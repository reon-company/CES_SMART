// PM2 설정 파일
// 사용법: pm2 start ecosystem.config.js

// 유지보수 메모:
// PM2 재시작 임계값은 저메모리 불안정 사례 이후 조정되었습니다.
// 메모리/재시작 정책 변경 시 인스턴스 크기 및 로그 모니터링과 함께 수정하세요.
module.exports = {
  apps: [
    {
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
    },
    {
      name: 'vpn-monitor',
      script: './scripts/vpn_monitor.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      error_file: './logs/vpn_err.log',
      out_file: './logs/vpn_out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      // VPN 모니터링은 선택사항이므로 실패해도 계속 재시도
      ignore_watch: ['node_modules', 'logs']
    }
  ]
};

