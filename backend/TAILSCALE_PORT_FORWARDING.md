# Tailscale 포트 포워딩 설정 가이드

## 현재 상태

✅ **서버 Tailscale IP**: `100.81.196.64`
✅ **ESP32-CAM 네트워크 컴퓨터 Tailscale IP**: `100.69.169.126`
✅ **ESP32-CAM 로컬 IP**: `192.168.1.13` (또는 실제 IP)

## 포트 포워딩 설정

ESP32-CAM 네트워크 컴퓨터에서 ESP32-CAM의 포트 81을 Tailscale IP의 포트 81로 포워딩해야 합니다.

### Windows에서 설정

#### PowerShell 관리자 권한으로 실행

```powershell
# 포트 포워딩 설정 (ESP32-CAM: 192.168.1.13:81)
netsh interface portproxy add v4tov4 listenport=81 listenaddress=0.0.0.0 connectport=81 connectaddress=192.168.1.13

# 방화벽 규칙 추가
New-NetFirewallRule -DisplayName "ESP32-CAM Proxy" -Direction Inbound -LocalPort 81 -Protocol TCP -Action Allow

# 설정 확인
netsh interface portproxy show all
```

#### 포트 포워딩 제거 (필요시)

```powershell
netsh interface portproxy delete v4tov4 listenport=81 listenaddress=0.0.0.0
```

### Linux에서 설정

#### socat 사용 (간단, 권장)

```bash
# socat 설치
sudo apt update
sudo apt install -y socat

# 포트 포워딩 실행 (백그라운드)
nohup socat TCP-LISTEN:81,fork,reuseaddr TCP:192.168.1.13:81 > /dev/null 2>&1 &

# 또는 systemd 서비스로 등록 (재부팅 후에도 자동 실행)
sudo nano /etc/systemd/system/esp32cam-proxy.service
```

서비스 파일 내용:
```ini
[Unit]
Description=ESP32-CAM Port Forwarding
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:81,fork,reuseaddr TCP:192.168.1.13:81
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

서비스 시작:
```bash
sudo systemctl daemon-reload
sudo systemctl enable esp32cam-proxy
sudo systemctl start esp32cam-proxy
sudo systemctl status esp32cam-proxy
```

#### iptables 사용

```bash
# IP 포워딩 활성화
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf

# 포트 포워딩 설정
sudo iptables -t nat -A PREROUTING -p tcp --dport 81 -j DNAT --to-destination 192.168.1.13:81
sudo iptables -t nat -A POSTROUTING -j MASQUERADE

# 방화벽 규칙 추가
sudo ufw allow 81/tcp

# 규칙 저장 (Ubuntu)
sudo netfilter-persistent save
# 또는
sudo iptables-save > /etc/iptables/rules.v4
```

### Mac에서 설정

#### socat 사용

```bash
# socat 설치
brew install socat

# 포트 포워딩 실행
socat TCP-LISTEN:81,fork,reuseaddr TCP:192.168.1.13:81
```

## 연결 테스트

### 1. ESP32-CAM 네트워크 컴퓨터에서 로컬 테스트

```bash
# ESP32-CAM 직접 접속 테스트
curl http://192.168.1.13:81/stream

# 포트 포워딩 테스트 (컴퓨터의 로컬 IP 사용)
curl http://localhost:81/stream
```

### 2. 서버에서 Tailscale IP로 테스트

```bash
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# ESP32-CAM 네트워크 컴퓨터의 Tailscale IP로 접속 테스트
ping 100.69.169.126

# ESP32-CAM 스트림 접속 테스트
curl http://100.69.169.126:81/stream
```

성공하면 MJPEG 스트림 데이터가 출력됩니다.

## 모듈 설정 업데이트

포트 포워딩이 정상 작동하면, 모듈 설정에서 스트림 URL을 업데이트합니다:

**스트림 URL**: `http://100.69.169.126:81/stream`

### 모듈 설정 업데이트 방법

1. 대시보드에서 모듈 선택
2. "수정" 버튼 클릭
3. "실시간 영상 URL" 필드에 입력: `http://100.69.169.126:81/stream`
4. 저장

## 문제 해결

### 포트 포워딩이 작동하지 않을 때

1. **ESP32-CAM 직접 접속 확인**
   ```bash
   curl http://192.168.1.13:81/stream
   ```

2. **포트 포워딩 상태 확인**
   - Windows: `netsh interface portproxy show all`
   - Linux: `sudo netstat -tlnp | grep 81`

3. **방화벽 확인**
   - Windows: 방화벽에서 포트 81 허용 확인
   - Linux: `sudo ufw status`

4. **Tailscale 연결 확인**
   ```bash
   tailscale status
   ```

### 서버에서 접속이 안 될 때

1. **Tailscale 연결 확인**
   ```bash
   ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
   sudo tailscale status
   ```

2. **ping 테스트**
   ```bash
   ping 100.69.169.126
   ```

3. **포트 접속 테스트**
   ```bash
   telnet 100.69.169.126 81
   # 또는
   nc -zv 100.69.169.126 81
   ```

## 참고

- **ESP32-CAM 네트워크 컴퓨터 Tailscale IP**: `100.69.169.126`
- **서버 Tailscale IP**: `100.81.196.64`
- **ESP32-CAM 로컬 IP**: `192.168.1.13` (실제 IP로 변경 필요)
- **포트**: `81`
