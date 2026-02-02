// PM2 설정 파일
// 사용법: pm2 start ecosystem.config.js

module.exports = {
  apps: [{
    name: 'ces-smartfarm',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '300M', // 메모리 제한을 더 낮춰서 조기 재시작
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 5, // 재시작 횟수 제한
    min_uptime: '30s', // 최소 실행 시간 증가
    restart_delay: 10000, // 재시작 지연 증가 (10초)
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // 메모리 누수 감지 및 자동 재시작
    kill_timeout: 5000,
    listen_timeout: 10000,
    shutdown_with_message: true
  }]
};

