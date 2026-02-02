# ✅ Tailscale 설정 완료!

## 성공적으로 연결되었습니다!

서버에서 ESP32-CAM에 접속할 수 있습니다.

### 연결 정보

- **서버 Tailscale IP**: `100.81.196.64`
- **ESP32-CAM 네트워크 컴퓨터 Tailscale IP**: `100.69.169.126`
- **ESP32-CAM 로컬 IP**: `192.168.1.3`
- **스트림 URL**: `http://100.69.169.126:81/stream`

### 테스트 결과

```bash
# 서버에서 테스트 성공
curl http://100.69.169.126:81/stream
# HTTP/1.1 200 OK
# Content-Type: multipart/x-mixed-replace
# JPEG 이미지 데이터 수신 중 ✓
```

## 📝 모듈 설정 업데이트

이제 대시보드에서 모듈의 스트림 URL을 업데이트하세요:

### 업데이트 방법

1. **대시보드 접속**
   - https://ces-smart.reonaicoffee.com 또는 http://43.201.148.223:3000

2. **모듈 선택**
   - 모듈 목록에서 ESP32-CAM이 연결된 모듈 선택 (예: MODULE_001)

3. **모듈 수정**
   - "수정" 버튼 클릭
   - "실시간 영상 URL" 필드에 입력:
     ```
     http://100.69.169.126:81/stream
     ```

4. **저장**
   - "저장" 버튼 클릭

5. **확인**
   - 모듈 상세 페이지에서 실시간 카메라 영상이 표시되는지 확인

## 🎉 완료!

이제 외부에서도 ESP32-CAM의 실시간 영상을 볼 수 있습니다!

### 접속 경로

1. **대시보드**: https://ces-smart.reonaicoffee.com/dashboard/modules/MODULE_001
2. **모듈 상세 페이지**: 실시간 카메라 섹션에서 영상 확인

## 🔍 문제 해결

### 카메라 영상이 표시되지 않을 때

1. **ESP32-CAM 네트워크 컴퓨터 확인**
   - Tailscale이 실행 중인지 확인
   - 포트 포워딩이 활성화되어 있는지 확인:
     ```powershell
     netsh interface portproxy show all
     ```

2. **서버에서 직접 테스트**
   ```bash
   ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
   curl http://100.69.169.126:81/stream
   ```

3. **브라우저 콘솔 확인**
   - F12 개발자 도구 열기
   - Console 탭에서 오류 메시지 확인
   - Network 탭에서 스트림 요청 상태 확인

### 포트 포워딩이 중단되었을 때

Windows에서 포트 포워딩을 다시 설정:

```powershell
# PowerShell 관리자 권한으로 실행
netsh interface portproxy add v4tov4 listenport=81 listenaddress=0.0.0.0 connectport=81 connectaddress=192.168.1.3
```

## 📚 참고 문서

- `backend/TAILSCALE_SETUP_SUMMARY.md` - 전체 설정 요약
- `backend/TAILSCALE_PORT_FORWARDING.md` - 포트 포워딩 상세 가이드
- `backend/TAILSCALE_WINDOWS_SETUP.ps1` - Windows 자동 설정 스크립트
