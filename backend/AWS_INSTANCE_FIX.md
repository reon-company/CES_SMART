# AWS Lightsail 인스턴스 오류 해결 가이드

## 오류: UPSTREAM_ERROR [515]

이 오류는 AWS Lightsail 인스턴스에 문제가 발생했을 때 나타납니다.

## 해결 방법

### 1단계: AWS 콘솔에서 인스턴스 상태 확인

1. AWS Lightsail 콘솔 접속: https://lightsail.aws.amazon.com
2. 인스턴스 목록에서 `43.201.148.223` 또는 해당 인스턴스 확인
3. 상태 확인:
   - 🟢 **Running**: 정상 실행 중
   - 🟡 **Pending**: 시작 중
   - 🔴 **Stopped**: 중지됨
   - ⚠️ **Error**: 오류 발생

### 2단계: 인스턴스 재시작

#### 방법 A: AWS 콘솔에서 재시작

1. Lightsail 콘솔에서 인스턴스 선택
2. **"..." (작업)** 메뉴 클릭
3. **"재시작"** 또는 **"시작"** 선택
4. 몇 분 대기 후 다시 연결 시도

#### 방법 B: AWS CLI 사용 (설치된 경우)

```bash
# 인스턴스 재시작
aws lightsail reboot-instance --instance-name <인스턴스이름>

# 또는 인스턴스 시작 (중지된 경우)
aws lightsail start-instance --instance-name <인스턴스이름>
```

### 3단계: 연결 재시도

인스턴스가 재시작된 후 (약 1-2분):

```bash
# SSH 연결 테스트
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223

# 또는 PowerShell에서
ssh -i C:\KKJ\LightsailDefaultKey-ap-northeast-2.pem ubuntu@43.201.148.223
```

### 4단계: 서버 상태 확인

연결 성공 후:

```bash
# 서버 상태 확인
uptime
df -h
free -m

# PM2 프로세스 확인
pm2 status
pm2 logs ces-smartfarm --lines 20
```

## 예방 조치

### 1. 인스턴스 모니터링 설정

AWS Lightsail 콘솔에서:
1. 인스턴스 선택
2. **"모니터링"** 탭
3. 알람 설정 (CPU, 메모리 등)

### 2. 자동 스냅샷 설정

1. **"스냅샷"** 탭
2. **"자동 스냅샷"** 활성화
3. 일일 자동 스냅샷 설정

### 3. 리소스 확인

인스턴스가 리소스 부족으로 중지되었을 수 있습니다:

```bash
# 메모리 사용량 확인
free -m

# 디스크 사용량 확인
df -h

# CPU 사용량 확인
top
```

## 일반적인 원인

1. **메모리 부족**: 애플리케이션이 메모리를 과도하게 사용
2. **디스크 공간 부족**: 로그 파일이나 데이터가 디스크를 가득 채움
3. **네트워크 문제**: 방화벽이나 보안 그룹 설정
4. **시스템 크래시**: 커널 패닉 또는 하드웨어 오류

## 빠른 복구 체크리스트

- [ ] AWS 콘솔에서 인스턴스 상태 확인
- [ ] 인스턴스 재시작
- [ ] 1-2분 대기
- [ ] SSH 연결 테스트
- [ ] PM2 프로세스 확인 및 재시작
- [ ] 애플리케이션 로그 확인

## 서버 재시작 후 자동 복구

인스턴스가 재시작되면 PM2가 자동으로 애플리케이션을 시작해야 합니다:

```bash
# PM2 자동 시작 확인
pm2 startup
pm2 save
```

## 문제가 계속되면

1. **AWS 지원 센터 문의**: 인스턴스 로그 확인 요청
2. **인스턴스 스냅샷 복원**: 최근 정상 작동 시점으로 복원
3. **새 인스턴스 생성**: 백업에서 새 인스턴스로 마이그레이션
