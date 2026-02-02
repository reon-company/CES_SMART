# 백엔드 로그 확인 가이드

## 백엔드 서버 로그 확인 방법

백엔드 서버가 실행 중인 방식에 따라 로그를 확인하는 방법이 다릅니다.

---

## 방법 1: PM2로 실행 중인 경우 (서버/프로덕션)

### PM2 로그 확인 명령어

```bash
# 실시간 로그 확인 (가장 유용)
pm2 logs ces-smartfarm

# 또는 모든 앱의 로그
pm2 logs

# 최근 로그만 확인 (마지막 100줄)
pm2 logs ces-smartfarm --lines 100

# 에러 로그만 확인
pm2 logs ces-smartfarm --err

# 출력 로그만 확인
pm2 logs ces-smartfarm --out
```

### PM2 로그 파일 위치

PM2 설정(`ecosystem.config.js`)에 따라 로그 파일이 저장됩니다:

```bash
# 로그 파일 직접 확인
tail -f backend/logs/out.log    # 일반 로그
tail -f backend/logs/err.log   # 에러 로그

# 또는
cat backend/logs/out.log | grep "camera_stream_url"
cat backend/logs/err.log | grep "camera_stream_url"
```

### PM2 상태 확인

```bash
# 실행 중인 앱 목록 확인
pm2 list

# 특정 앱의 상세 정보
pm2 show ces-smartfarm

# 실시간 모니터링
pm2 monit
```

---

## 방법 2: 직접 실행 중인 경우 (로컬 개발)

### 터미널에서 직접 확인

서버를 실행한 터미널 창에서 바로 로그를 볼 수 있습니다.

```bash
# backend 폴더로 이동
cd backend

# 서버 실행 (로그가 터미널에 바로 표시됨)
npm start

# 또는 개발 모드 (nodemon 사용)
npm run dev
```

### 로그 예시

카메라 스트림 URL 업데이트 시 다음과 같은 로그가 표시됩니다:

```
Update module request: { moduleId: '6', userId: 1, camera_stream_url: 'http://192.168.1.13:81/stream' }
Update data: { name: '1호', wifi_ssid: 'REON9999', camera_stream_url: 'http://192.168.1.13:81/stream' }
Module.update called with data: { id: 6, userId: 1, data: { ... } }
Adding camera_stream_url to update: http://192.168.1.13:81/stream
Executing SQL: UPDATE modules SET name = ?, wifi_ssid = ?, camera_stream_url = ? WHERE id = ? AND user_id = ?
With values: [ '1호', 'REON9999', 'http://192.168.1.13:81/stream', 6, 1 ]
Update result: { affectedRows: 1 }
Updated module from database: { id: 6, name: '1호', camera_stream_url: 'http://192.168.1.13:81/stream' }
```

---

## 방법 3: 원격 서버에 SSH 접속하여 확인

### 서버에 접속

```bash
# SSH로 서버 접속 (키 파일 경로와 서버 주소는 실제 값으로 변경)
ssh -i ~/path/to/key.pem ubuntu@43.203.141.2

# 또는
ssh ubuntu@43.203.141.2
```

### 서버에서 로그 확인

```bash
# 프로젝트 폴더로 이동
cd ~/ces-smartfarm/backend

# PM2 로그 확인
pm2 logs ces-smartfarm

# 또는 로그 파일 직접 확인
tail -f logs/out.log
tail -f logs/err.log
```

---

## 방법 4: 특정 키워드로 필터링

### camera_stream_url 관련 로그만 확인

```bash
# PM2 로그에서 필터링
pm2 logs ces-smartfarm | grep "camera_stream_url"

# 로그 파일에서 필터링
grep "camera_stream_url" backend/logs/out.log
grep "camera_stream_url" backend/logs/err.log

# 실시간 필터링
tail -f backend/logs/out.log | grep "camera_stream_url"
```

### 모듈 업데이트 관련 로그만 확인

```bash
pm2 logs ces-smartfarm | grep "Update module"
pm2 logs ces-smartfarm | grep "Module.update"
```

---

## 확인해야 할 로그

카메라 스트림 URL 저장 문제를 확인할 때 다음 로그를 찾아보세요:

1. **요청 수신 확인**
   ```
   Update module request: { moduleId: '6', userId: 1, camera_stream_url: '...' }
   ```

2. **업데이트 데이터 확인**
   ```
   Update data: { camera_stream_url: 'http://192.168.1.13:81/stream' }
   ```

3. **SQL 실행 확인**
   ```
   Adding camera_stream_url to update: http://192.168.1.13:81/stream
   Executing SQL: UPDATE modules SET ... camera_stream_url = ? ...
   ```

4. **업데이트 결과 확인**
   ```
   Update result: { affectedRows: 1 }
   ```

5. **조회 결과 확인**
   ```
   Updated module from database: { camera_stream_url: 'http://192.168.1.13:81/stream' }
   ```

---

## 문제 해결

### 로그가 보이지 않는 경우

1. **서버가 실행 중인지 확인**
   ```bash
   pm2 list
   # 또는
   ps aux | grep node
   ```

2. **서버 재시작**
   ```bash
   pm2 restart ces-smartfarm
   ```

3. **로그 파일 권한 확인**
   ```bash
   ls -la backend/logs/
   ```

### 로그 파일이 없는 경우

```bash
# 로그 디렉토리 생성
mkdir -p backend/logs

# PM2 재시작
pm2 restart ces-smartfarm
```

---

## 빠른 확인 명령어

```bash
# 한 줄로 최근 로그 확인
pm2 logs ces-smartfarm --lines 50 | grep -i "camera\|module\|update"

# 에러만 확인
pm2 logs ces-smartfarm --err --lines 100

# 실시간 모니터링 (Ctrl+C로 종료)
pm2 logs ces-smartfarm --lines 0
```
