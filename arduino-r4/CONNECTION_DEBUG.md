# 아두이노 서버 연결 문제 해결

## 현재 상황
- ✅ WiFi 연결 성공 (IP: 192.168.1.12)
- ✅ MODULE_ID: MODULE_001
- ❌ 서버 연결 실패: "Connection to server failed!"

## 문제 원인 분석

### 가능한 원인
1. **포트 3000이 외부에서 접근 불가**
   - Lightsail 방화벽에서 포트 3000이 닫혀있을 수 있음
   - Nginx를 통해만 접근 가능할 수 있음

2. **아두이노가 외부 IP에 접속할 수 없음**
   - 공유기/라우터의 방화벽 설정
   - 네트워크 정책

3. **서버가 포트 3000에서 리스닝하지 않음**
   - Node.js 서버가 실행되지 않음
   - 다른 포트에서 실행 중

## 해결 방법

### 방법 1: 포트 3000을 방화벽에서 열기 (권장)

Lightsail 콘솔에서:
1. 인스턴스 선택 → "네트워킹" 탭
2. "+ 규칙 추가" 클릭
3. 설정:
   - 애플리케이션: Custom
   - 프로토콜: TCP
   - 포트: 3000
   - 제한: 모든 IPv4 주소
4. 저장

### 방법 2: Nginx를 통해 접속 (대안)

아두이노가 Nginx를 통해 접속하도록 설정:

```cpp
// config.h
#define API_BASE_URL "http://43.201.148.223"  // 포트 80 사용
// 또는
#define API_BASE_URL "http://CES-smart.reonaicoffee.com"  // 도메인 사용 (DNS 업데이트 후)
```

그리고 Nginx 설정에서 포트 80으로 프록시하도록 설정.

### 방법 3: 서버에서 직접 확인

서버에서 포트 3000이 외부에서 접근 가능한지 확인:

```bash
# 서버에서
curl http://43.201.148.223:3000/api/health

# 또는 다른 컴퓨터에서
curl http://43.201.148.223:3000/api/health
```

## 디버깅 단계

### 1. 서버 포트 확인
```bash
sudo ss -tlnp | grep 3000
```

### 2. 서버 로그 확인
```bash
pm2 logs ces-smartfarm | grep -i "sensor\|POST"
```

### 3. 아두이노 시리얼 모니터 확인
- API_BASE_URL이 올바른지 확인
- Host와 Port가 올바르게 파싱되는지 확인

## 빠른 테스트

아두이노 코드에 디버그 출력 추가:

```cpp
// api_client.h의 APIClient() 생성자에 추가
Serial.print("API Host: ");
Serial.println(host);
Serial.print("API Port: ");
Serial.println(port);
```

이렇게 하면 실제로 연결하려는 호스트와 포트를 확인할 수 있습니다.
