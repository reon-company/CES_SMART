# 메모리 최적화 가이드

## 현재 인스턴스 사양
- **RAM**: 1GB ⚠️ (부족할 수 있음)
- **vCPU**: 2
- **SSD**: 40GB

## 메모리 사용량 분석

### 예상 메모리 사용량
- **Ubuntu 시스템**: ~200-300MB
- **MySQL 데이터베이스**: ~200-400MB
- **Node.js 서버**: ~100-200MB
- **PM2 프로세스 매니저**: ~50MB
- **VPN 모니터링 (선택)**: ~50MB
- **기타 시스템 프로세스**: ~100-200MB

**총 예상 사용량**: ~700-1200MB

1GB RAM에서는 **메모리 부족으로 인스턴스가 중지될 수 있습니다**.

## 해결 방법

### 방법 1: 인스턴스 업그레이드 (권장)

AWS Lightsail에서 더 큰 인스턴스로 업그레이드:

1. **Lightsail 콘솔** → 인스턴스 선택
2. **"..." 메뉴** → **"인스턴스 변경"** 또는 **"업그레이드"**
3. 권장 사양:
   - **2GB RAM, 1 vCPU** (최소)
   - **4GB RAM, 2 vCPU** (권장)
   - **8GB RAM, 2 vCPU** (여유 있음)

### 방법 2: 메모리 최적화 (임시 조치)

#### MySQL 메모리 사용량 줄이기

```bash
# MySQL 설정 파일 수정
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 다음 설정 추가/수정:
[mysqld]
innodb_buffer_pool_size = 128M
max_connections = 50
key_buffer_size = 32M
tmp_table_size = 32M
max_heap_table_size = 32M

# MySQL 재시작
sudo systemctl restart mysql
```

#### Node.js 메모리 제한

이미 설정되어 있음:
```javascript
// ecosystem.config.js
max_memory_restart: '300M'
```

#### 불필요한 서비스 중지

```bash
# 사용하지 않는 서비스 확인
sudo systemctl list-units --type=service --state=running

# 예: Apache가 실행 중이면 중지 (Nginx만 사용하는 경우)
sudo systemctl stop apache2
sudo systemctl disable apache2
```

#### 스왑 메모리 추가 (임시 조치)

```bash
# 1GB 스왑 파일 생성
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 영구적으로 활성화
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 방법 3: 모니터링 설정

```bash
# 메모리 사용량 실시간 모니터링
watch -n 5 free -m

# 또는
htop
```

## 메모리 사용량 확인

서버에 연결 후:

```bash
# 현재 메모리 사용량 확인
free -h

# 상세 메모리 사용량
cat /proc/meminfo

# 프로세스별 메모리 사용량
ps aux --sort=-%mem | head -10

# MySQL 메모리 사용량
mysql -u root -p -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size';"
```

## 권장 사양

### 최소 사양 (기본 운영)
- **RAM**: 2GB
- **vCPU**: 1
- **SSD**: 40GB

### 권장 사양 (안정적 운영)
- **RAM**: 4GB
- **vCPU**: 2
- **SSD**: 40GB

### 여유 있는 사양 (확장 가능)
- **RAM**: 8GB
- **vCPU**: 2
- **SSD**: 80GB

## 즉시 조치

1. **인스턴스 업그레이드** (가장 효과적)
2. **스왑 메모리 추가** (임시 조치)
3. **MySQL 메모리 최적화** (즉시 적용 가능)

## 비용 비교 (AWS Lightsail)

- **1GB RAM**: ~$5/월
- **2GB RAM**: ~$10/월
- **4GB RAM**: ~$20/월
- **8GB RAM**: ~$40/월

## 체크리스트

- [ ] 현재 메모리 사용량 확인
- [ ] 인스턴스 업그레이드 고려
- [ ] 스왑 메모리 추가 (임시)
- [ ] MySQL 메모리 최적화
- [ ] 불필요한 서비스 중지
- [ ] 메모리 모니터링 설정
