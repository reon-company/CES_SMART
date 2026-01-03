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
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // 서버를 종료하지 않고 로그만 남김 (PM2가 재시작)
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 서버를 종료하지 않고 로그만 남김
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CES SmartFarm API Server' });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/actuators', require('./routes/actuators'));
app.use('/api/config', require('./routes/config'));

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
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
