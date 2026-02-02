const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Graceful shutdown 처리
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// 처리되지 않은 예외 처리
let uncaughtExceptionCount = 0;
const MAX_UNCAUGHT_EXCEPTIONS = 10;

process.on('uncaughtException', (err) => {
  uncaughtExceptionCount++;
  console.error(`Uncaught Exception (${uncaughtExceptionCount}/${MAX_UNCAUGHT_EXCEPTIONS}):`, err);
  
  // 너무 많은 예외가 발생하면 프로세스 종료 (PM2가 재시작)
  if (uncaughtExceptionCount >= MAX_UNCAUGHT_EXCEPTIONS) {
    console.error('Too many uncaught exceptions, exiting...');
    process.exit(1);
  }
});

let unhandledRejectionCount = 0;
const MAX_UNHANDLED_REJECTIONS = 20;

process.on('unhandledRejection', (reason, promise) => {
  unhandledRejectionCount++;
  console.error(`Unhandled Rejection (${unhandledRejectionCount}/${MAX_UNHANDLED_REJECTIONS}) at:`, promise, 'reason:', reason);
  
  // 너무 많은 rejection이 발생하면 프로세스 종료 (PM2가 재시작)
  if (unhandledRejectionCount >= MAX_UNHANDLED_REJECTIONS) {
    console.error('Too many unhandled rejections, exiting...');
    process.exit(1);
  }
});

// 카운터 리셋 (1시간마다)
setInterval(() => {
  uncaughtExceptionCount = Math.max(0, uncaughtExceptionCount - 1);
  unhandledRejectionCount = Math.max(0, unhandledRejectionCount - 5);
}, 3600000); // 1시간

// Middleware
// CORS 설정: 여러 origin을 배열로 처리
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3001'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CES SmartFarm API Server' });
});

// API 목록 (라우트 확인용)
app.get('/api', (req, res) => {
  res.json({
    message: 'CES SmartFarm API',
    baseUrl: '/api',
    routes: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (인증 필요)',
        logout: 'POST /api/auth/logout (인증 필요)'
      },
      modules: 'GET/POST /api/modules, GET/PUT/DELETE /api/modules/:moduleId (인증 필요)',
      sensors: {
        create: 'POST /api/sensors (인증 필요)',
        latest: 'GET /api/sensors/latest/:moduleId (인증 필요)',
        history: 'GET /api/sensors/history/:moduleId (인증 필요)'
      },
      actuators: {
        status: 'GET /api/actuators/status/:moduleId (인증 없음)',
        control: 'GET /api/actuators/:moduleId, POST /api/actuators/control/:moduleId (인증 필요)',
        statusUpdate: 'POST /api/actuators/status/update/:moduleId (인증 없음)'
      },
      config: 'GET/POST /api/config/thresholds/:moduleId (인증 필요)'
    }
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/actuators', require('./routes/actuators'));
app.use('/api/config', require('./routes/config'));

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.method + ' ' + req.originalUrl,
    hint: 'GET /api 로 사용 가능한 라우트 목록 확인'
  });
});

// Error handling middleware (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}`);
});

// 서버 타임아웃 설정
server.timeout = 30000; // 30초
server.keepAliveTimeout = 65000; // 65초
server.headersTimeout = 66000; // 66초
