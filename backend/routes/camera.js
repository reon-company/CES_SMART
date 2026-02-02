const express = require('express');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const Module = require('../models/Module');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/camera/:moduleId/stream
// @desc    Proxy camera stream from ESP32-CAM
// @access  Private (token in query or header)
router.get('/:moduleId/stream', async (req, res, next) => {
  // 쿼리 파라미터에서 토큰 확인 (img 태그용)
  if (req.query.token) {
    // 토큰을 헤더로 이동하여 auth 미들웨어 사용
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  // auth 미들웨어 실행
  return auth(req, res, next);
}, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id;

    console.log('Camera stream request:', { moduleId, userId });

    // Find module by module_id (e.g., MODULE_003)
    const module = await Module.findByModuleId(moduleId);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if module belongs to user
    if (module.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if camera_stream_url exists
    if (!module.camera_stream_url) {
      return res.status(404).json({
        success: false,
        message: 'Camera stream URL not configured'
      });
    }

    const streamUrl = module.camera_stream_url;
    console.log('Proxying camera stream:', streamUrl);

    // VPN 연결 상태 확인 (선택사항)
    // VPN이 설정되어 있으면 자동으로 VPN을 통해 접속됨
    // 시스템 라우팅 테이블이 VPN을 통해 ESP32-CAM 네트워크로 라우팅함

    try {
      const url = new URL(streamUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      // Set headers for MJPEG stream
      res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=ffmpeg');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Connection', 'keep-alive');

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'GET',
        timeout: 30000,
        headers: {
          'User-Agent': 'CES-SmartFarm-Proxy/1.0'
        }
      };

      const proxyReq = client.request(options, (proxyRes) => {
        // Forward status code
        res.statusCode = proxyRes.statusCode;
        
        // Forward headers (except some that should be set by us)
        Object.keys(proxyRes.headers).forEach(key => {
          if (key.toLowerCase() !== 'content-length' && 
              key.toLowerCase() !== 'transfer-encoding') {
            res.setHeader(key, proxyRes.headers[key]);
          }
        });

        // Pipe the stream
        proxyRes.pipe(res);

        proxyRes.on('error', (err) => {
          console.error('Proxy response error:', err);
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: 'Stream error'
            });
          } else {
            res.end();
          }
        });
      });

      proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Failed to connect to camera',
            error: err.message
          });
        } else {
          res.end();
        }
      });

      proxyReq.on('timeout', () => {
        console.error('Proxy request timeout');
        proxyReq.destroy();
        if (!res.headersSent) {
          res.status(504).json({
            success: false,
            message: 'Camera connection timeout'
          });
        } else {
          res.end();
        }
      });

      // Handle client disconnect
      req.on('close', () => {
        console.log('Client disconnected, closing proxy connection');
        proxyReq.destroy();
      });

      proxyReq.end();

    } catch (urlError) {
      console.error('Invalid camera stream URL:', urlError);
      return res.status(400).json({
        success: false,
        message: 'Invalid camera stream URL',
        error: urlError.message
      });
    }

  } catch (error) {
    console.error('Camera stream proxy error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
});

module.exports = router;
