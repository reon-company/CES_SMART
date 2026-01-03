const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 5, // 무제한 큐 방지 (메모리 누수 방지)
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // 연결 타임아웃 설정 (너무 길면 요청이 계속 쌓임)
  acquireTimeout: 10000, // 10초로 단축
  timeout: 10000, // 10초로 단축
  reconnect: true, // 자동 재연결
  // 연결 풀 모니터링
  idleTimeout: 300000, // 5분 후 유휴 연결 종료
  maxIdle: 5 // 최대 유휴 연결 수
});

// Test database connection with retry
let connectionRetries = 0;
const maxRetries = 3;

function testConnection() {
  pool.getConnection()
    .then(connection => {
      console.log('Database connected successfully');
      connection.release();
      connectionRetries = 0; // 성공 시 리셋
    })
    .catch(err => {
      connectionRetries++;
      console.error(`Database connection error (attempt ${connectionRetries}/${maxRetries}):`, err.message);

      if (connectionRetries < maxRetries) {
        // 재시도
        setTimeout(() => {
          console.log('Retrying database connection...');
          testConnection();
        }, 5000); // 5초 후 재시도
      } else {
        console.error('Failed to connect to database after', maxRetries, 'attempts');
        // 서버는 계속 실행하되, 데이터베이스 연결 실패 로그 남김
      }
    });
}

// 초기 연결 테스트
testConnection();

// 주기적으로 연결 상태 확인 (5분마다)
setInterval(() => {
  pool.getConnection()
    .then(connection => {
      connection.release();
    })
    .catch(err => {
      console.error('Database connection health check failed:', err.message);
      // 재연결 시도
      if (connectionRetries < maxRetries) {
        testConnection();
      }
    });
}, 300000); // 5분마다

module.exports = pool;

