const express = require('express');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const Module = require('../models/Module');
const auth = require('../middleware/auth');

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
