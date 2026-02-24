# ESP32-CAM 포트 포워딩 설정 스크립트 (Windows PowerShell 관리자 권한)

# ESP32-CAM 로컬 IP
$ESP32CAM_IP = "192.168.1.13"
$TAILSCALE_IP = "100.69.169.126"
$PORT = 81

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ESP32-CAM 포트 포워딩 설정" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 기존 포트 포워딩 제거 (있으면)
Write-Host "기존 포트 포워딩 제거 중..." -ForegroundColor Yellow
netsh interface portproxy delete v4tov4 listenport=$PORT listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=$PORT listenaddress=$TAILSCALE_IP 2>$null

# 포트 포워딩 추가
Write-Host "포트 포워딩 추가 중..." -ForegroundColor Yellow
netsh interface portproxy add v4tov4 listenport=$PORT listenaddress=0.0.0.0 connectport=$PORT connectaddress=$ESP32CAM_IP

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 포트 포워딩 설정 완료!" -ForegroundColor Green
} else {
    Write-Host "✗ 포트 포워딩 설정 실패" -ForegroundColor Red
    exit 1
}

# 방화벽 규칙 추가
Write-Host "방화벽 규칙 추가 중..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "ESP32-CAM Proxy" -ErrorAction SilentlyContinue
if ($firewallRule) {
    Write-Host "기존 방화벽 규칙 제거 중..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "ESP32-CAM Proxy"
}

New-NetFirewallRule -DisplayName "ESP32-CAM Proxy" -Direction Inbound -LocalPort $PORT -Protocol TCP -Action Allow

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 방화벽 규칙 추가 완료!" -ForegroundColor Green
} else {
    Write-Host "✗ 방화벽 규칙 추가 실패" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "설정 완료!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "포트 포워딩 설정:" -ForegroundColor Yellow
netsh interface portproxy show all
Write-Host ""
Write-Host "ESP32-CAM 접속 URL:" -ForegroundColor Yellow
Write-Host "  로컬: http://localhost:$PORT/stream" -ForegroundColor White
Write-Host "  Tailscale: http://$TAILSCALE_IP:$PORT/stream" -ForegroundColor White
Write-Host ""
Write-Host "서버에서 테스트:" -ForegroundColor Yellow
Write-Host "  curl http://$TAILSCALE_IP:$PORT/stream" -ForegroundColor White
Write-Host ""
