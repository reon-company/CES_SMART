// VPN 연결 상태 모니터링 및 자동 재연결 (Node.js 버전)
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const VPN_INTERFACE = 'wg0';
const CHECK_INTERVAL = 60000; // 60초
const TARGET_IP = '192.168.1.13'; // ESP32-CAM IP (설정에 따라 변경)

async function checkVPN() {
  try {
    // VPN 인터페이스 확인
    const { stdout: interfaces } = await execPromise(`ip link show ${VPN_INTERFACE} 2>/dev/null || echo ""`);
    if (!interfaces.trim()) {
      console.log(`[VPN Monitor] VPN 인터페이스 ${VPN_INTERFACE}가 없습니다.`);
      return false;
    }

    // WireGuard 상태 확인
    const { stdout: wgStatus } = await execPromise(`wg show ${VPN_INTERFACE} 2>/dev/null || echo ""`);
    if (!wgStatus.trim()) {
      console.log(`[VPN Monitor] VPN 인터페이스가 비활성화되어 있습니다.`);
      return false;
    }

    // ESP32-CAM 네트워크 접속 테스트
    try {
      await execPromise(`ping -c 1 -W 2 ${TARGET_IP} 2>/dev/null`);
      console.log(`[VPN Monitor] VPN 연결 정상, ESP32-CAM 접속 가능`);
      return true;
    } catch (error) {
      console.log(`[VPN Monitor] VPN은 연결되어 있지만 ESP32-CAM에 접속할 수 없습니다.`);
      return false;
    }
  } catch (error) {
    console.error(`[VPN Monitor] 오류:`, error.message);
    return false;
  }
}

async function restartVPN() {
  try {
    console.log(`[VPN Monitor] VPN을 재시작합니다...`);
    await execPromise(`wg-quick down ${VPN_INTERFACE} 2>/dev/null || true`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await execPromise(`wg-quick up ${VPN_INTERFACE}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    if (await checkVPN()) {
      console.log(`[VPN Monitor] VPN 재시작 성공`);
      return true;
    } else {
      console.log(`[VPN Monitor] VPN 재시작 실패`);
      return false;
    }
  } catch (error) {
    console.error(`[VPN Monitor] VPN 재시작 오류:`, error.message);
    return false;
  }
}

async function monitor() {
  console.log(`[VPN Monitor] VPN 모니터링 시작 (${CHECK_INTERVAL}ms 간격)`);
  
  while (true) {
    const isConnected = await checkVPN();
    
    if (!isConnected) {
      console.log(`[VPN Monitor] VPN 연결 문제 감지, 재시작 시도...`);
      await restartVPN();
    }
    
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

// 직접 실행 시
if (require.main === module) {
  monitor().catch(error => {
    console.error(`[VPN Monitor] 치명적 오류:`, error);
    process.exit(1);
  });
}

module.exports = { checkVPN, restartVPN };
