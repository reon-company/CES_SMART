const express = require('express');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const Module = require('../models/Module');
const auth = require('../middleware/auth');

// 유지보수 메모:
// 이 라우터는 운영 환경의 카메라 경계 계층입니다.
// 프론트엔드는 카메라 LAN 직접 접근을 쓰지 말고, 여기의 프록시 엔드포인트를 사용해야 합니다.
// 타임아웃/헤더/인증 정책 변경은 모바일 외부 스트리밍에 직접 영향을 줍니다.
const router = express.Router();
const CONNECT_TIMEOUT_MS = 15000;
const HEALTH_TIMEOUT_MS = 5000;

const withQueryTokenAuth = (req, res, next) => {
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  return auth(req, res, next);
};

const isRetryableNetworkError = (code) => (
  code === 'ETIMEDOUT' ||
  code === 'ECONNREFUSED' ||
  code === 'ENETUNREACH' ||
  code === 'EHOSTUNREACH' ||
  code === 'ECONNRESET'
);

const sendProxyError = (res, statusCode, code, message, extra = {}) => {
  if (res.headersSent) {
    res.end();
    return;
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...extra,
  });
};

const getAuthorizedModule = async (moduleId, userId) => {
  const module = await Module.findByModuleId(moduleId);
  if (!module) {
    return { status: 404, body: { success: false, message: 'Module not found' } };
  }

  if (module.user_id !== userId) {
    return { status: 403, body: { success: false, message: 'Access denied' } };
  }

  if (!module.camera_stream_url) {
    return { status: 404, body: { success: false, message: 'Camera stream URL not configured' } };
  }

  return { module };
};

const getCameraBaseUrl = (streamUrl) => {
  const url = new URL(streamUrl);
  const targetPort = url.port || (url.protocol === 'https:' ? '443' : '80');
  return `${url.protocol}//${url.hostname}:${targetPort}`;
};

// @route   GET /api/camera/:moduleId/health
// @desc    Check camera stream reachability
// @access  Private (token in query or header)
router.get('/:moduleId/health', withQueryTokenAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;

    const moduleResult = await getAuthorizedModule(moduleId, userId);
    if (!moduleResult.module) {
      return res.status(moduleResult.status).json(moduleResult.body);
    }

    const streamUrl = moduleResult.module.camera_stream_url;
    const url = new URL(streamUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    const targetPort = url.port || (isHttps ? 443 : 80);

    const options = {
      hostname: url.hostname,
      port: targetPort,
      path: url.pathname + url.search,
      method: 'GET',
      timeout: HEALTH_TIMEOUT_MS,
      headers: {
        'User-Agent': 'CES-SmartFarm-Proxy/1.0',
      },
    };

    const healthReq = client.request(options, (healthRes) => {
      const reachable = healthRes.statusCode >= 200 && healthRes.statusCode < 400;
      const payload = {
        success: reachable,
        reachable,
        statusCode: healthRes.statusCode,
        contentType: healthRes.headers['content-type'] || null,
        cameraUrl: streamUrl,
        target: `${url.hostname}:${targetPort}`,
      };

      healthRes.destroy();
      res.status(reachable ? 200 : 502).json(payload);
    });

    healthReq.on('timeout', () => {
      healthReq.destroy(new Error('Camera health check timeout'));
    });

    healthReq.on('error', (err) => {
      const code = err.code || 'CAMERA_UNREACHABLE';
      const message = isRetryableNetworkError(err.code)
        ? `Cannot reach camera at ${url.hostname}. Check Tailscale/VPN/port forwarding path.`
        : 'Failed to verify camera reachability';

      sendProxyError(res, 502, code, message, {
        cameraUrl: streamUrl,
        error: err.message,
      });
    });

    healthReq.end();
  } catch (error) {
    console.error('Camera health check error:', error);
    sendProxyError(res, 500, 'INTERNAL_ERROR', 'Server error during camera health check');
  }
});

// @route   POST /api/camera/:moduleId/wifi
// @desc    Configure ESP32-CAM WiFi via backend proxy
// @access  Private
router.post('/:moduleId/wifi', auth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;
    const ssid = String(req.body?.ssid || '').trim();
    const password = String(req.body?.password || '');

    if (!ssid) {
      return res.status(400).json({
        success: false,
        message: 'SSID is required',
      });
    }

    const moduleResult = await getAuthorizedModule(moduleId, userId);
    if (!moduleResult.module) {
      return res.status(moduleResult.status).json(moduleResult.body);
    }

    const baseUrl = getCameraBaseUrl(moduleResult.module.camera_stream_url);
    const configUrl = `${baseUrl}/wifi/set?ssid=${encodeURIComponent(ssid)}&password=${encodeURIComponent(password)}`;
    const target = new URL(configUrl);
    const isHttps = target.protocol === 'https:';
    const client = isHttps ? https : http;
    const targetPort = target.port || (isHttps ? 443 : 80);

    const options = {
      hostname: target.hostname,
      port: targetPort,
      path: target.pathname + target.search,
      method: 'GET',
      timeout: HEALTH_TIMEOUT_MS,
      headers: {
        'User-Agent': 'CES-SmartFarm-Proxy/1.0',
      },
    };

    const proxyReq = client.request(options, (proxyRes) => {
      let responseText = '';
      proxyRes.on('data', (chunk) => {
        responseText += chunk.toString();
      });
      proxyRes.on('end', () => {
        const ok = proxyRes.statusCode >= 200 && proxyRes.statusCode < 300;
        res.status(ok ? 200 : 502).json({
          success: ok,
          statusCode: proxyRes.statusCode,
          message: ok ? 'ESP32-CAM WiFi settings applied' : 'Failed to apply ESP32-CAM WiFi settings',
          cameraResponse: responseText.slice(0, 4000),
          target: `${target.hostname}:${targetPort}`,
        });
      });
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy(new Error('Camera WiFi setting timeout'));
    });

    proxyReq.on('error', (err) => {
      sendProxyError(
        res,
        isRetryableNetworkError(err.code) ? 504 : 502,
        err.code || 'CAMERA_WIFI_CONFIG_ERROR',
        'Failed to reach ESP32-CAM WiFi config endpoint',
        {
          error: err.message,
          target: `${target.hostname}:${targetPort}`,
        }
      );
    });

    proxyReq.end();
  } catch (error) {
    console.error('Camera WiFi config error:', error);
    sendProxyError(res, 500, 'INTERNAL_ERROR', 'Server error during camera WiFi config');
  }
});

// @route   GET /api/camera/:moduleId/stream
// @desc    Proxy camera stream from ESP32-CAM
// @access  Private (token in query or header)
router.get('/:moduleId/stream', withQueryTokenAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;

    console.log('Camera stream request:', { moduleId, userId });

    const moduleResult = await getAuthorizedModule(moduleId, userId);
    if (!moduleResult.module) {
      return res.status(moduleResult.status).json(moduleResult.body);
    }

    const streamUrl = moduleResult.module.camera_stream_url;
    console.log('Proxying camera stream:', streamUrl);
    const url = new URL(streamUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    const targetPort = url.port || (isHttps ? 443 : 80);

    const options = {
      hostname: url.hostname,
      port: targetPort,
      path: url.pathname + url.search,
      method: 'GET',
      timeout: CONNECT_TIMEOUT_MS,
      headers: {
        'User-Agent': 'CES-SmartFarm-Proxy/1.0',
      },
    };

    const proxyReq = client.request(options, (proxyRes) => {
      // 연결이 완료되면 연결 타임아웃 제거 (장시간 MJPEG 스트림 지원)
      proxyReq.setTimeout(0);

      const hopByHopHeaders = new Set([
        'connection',
        'keep-alive',
        'proxy-authenticate',
        'proxy-authorization',
        'te',
        'trailer',
        'transfer-encoding',
        'upgrade',
        'content-length',
      ]);

      res.status(proxyRes.statusCode || 502);
      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (!hopByHopHeaders.has(String(key).toLowerCase()) && value !== undefined) {
          res.setHeader(key, value);
        }
      });

      if (!res.getHeader('Cache-Control')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
      if (!res.getHeader('Pragma')) {
        res.setHeader('Pragma', 'no-cache');
      }
      if (!res.getHeader('Expires')) {
        res.setHeader('Expires', '0');
      }
      // 브라우저 이미지 태그 cross-origin 렌더링 호환성
      if (!res.getHeader('Access-Control-Allow-Origin')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }

      proxyRes.pipe(res);

      proxyRes.on('error', (err) => {
        console.error('Proxy response error:', err);
        sendProxyError(res, 502, err.code || 'STREAM_RESPONSE_ERROR', 'Stream response error', {
          cameraUrl: streamUrl,
          error: err.message,
        });
      });

      proxyRes.on('aborted', () => {
        if (!res.writableEnded) {
          res.end();
        }
      });
    });

    proxyReq.on('timeout', () => {
      console.error('Proxy request timeout:', {
        streamUrl,
        hostname: url.hostname,
        port: targetPort,
        timeout: CONNECT_TIMEOUT_MS,
      });
      proxyReq.destroy(new Error('Camera connection timeout'));
      sendProxyError(
        res,
        504,
        'CAMERA_TIMEOUT',
        `Camera connection timeout. Cannot reach ${url.hostname}. Check Tailscale/VPN/port forwarding path.`,
        { cameraUrl: streamUrl }
      );
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', {
        message: err.message,
        code: err.code,
        streamUrl,
        hostname: url.hostname,
        port: targetPort,
      });

      const errorCode = err.code || 'CAMERA_PROXY_ERROR';
      const message = isRetryableNetworkError(err.code)
        ? `Cannot reach camera at ${url.hostname}. Check Tailscale/VPN/port forwarding path.`
        : 'Failed to connect to camera';

      sendProxyError(res, 502, errorCode, message, {
        cameraUrl: streamUrl,
        error: err.message,
      });
    });

    req.on('close', () => {
      if (!proxyReq.destroyed) {
        proxyReq.destroy();
      }
    });

    proxyReq.end();

  } catch (error) {
    console.error('Camera stream proxy error:', error);
    if (error instanceof TypeError || String(error.message || '').includes('Invalid URL')) {
      sendProxyError(res, 400, 'INVALID_CAMERA_URL', 'Invalid camera stream URL', {
        error: error.message,
      });
      return;
    }
    sendProxyError(res, 500, 'INTERNAL_ERROR', 'Server error');
  }
});

module.exports = router;
