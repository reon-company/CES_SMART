# MySQL 설치 문제 해결 가이드

현재 MySQL 설치에 문제가 있습니다. 다음 단계를 따라 수동으로 해결하세요.

## 1. 서버 접속

```bash
ssh -i LightsailDefaultKey-ap-northeast-2.pem ubuntu@3.36.68.151
```

## 2. 실행 중인 apt 프로세스 확인 및 종료

```bash
# 실행 중인 apt 프로세스 확인
sudo ps aux | grep apt

# 프로세스가 있다면 종료 (PID는 위 명령어 결과에서 확인)
sudo kill -9 <PID>

# 또는 모든 apt 프로세스 종료
sudo killall apt apt-get

# lock 파일 제거
sudo rm /var/lib/apt/lists/lock
sudo rm /var/cache/apt/archives/lock
sudo rm /var/lib/dpkg/lock*
sudo dpkg --configure -a
```

## 3. MySQL 완전 제거 및 재설치

```bash
# MySQL 완전 제거
sudo apt remove --purge mysql-server mysql-client mysql-common mysql-server-core-* mysql-client-core-* -y
sudo apt autoremove -y
sudo apt autoclean

# MySQL 관련 파일 제거
sudo rm -rf /var/lib/mysql
sudo rm -rf /var/run/mysqld
sudo rm -rf /etc/mysql

# MySQL 재설치
sudo apt update
sudo apt install mysql-server -y
```

## 4. MySQL 서비스 시작

```bash
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

## 5. MySQL 접속 테스트

```bash
# 비밀번호 없이 접속 (처음 설치 시)
sudo mysql -u root

# 또는 비밀번호가 설정되어 있다면
sudo mysql -u root -p
```

## 6. 데이터베이스 및 사용자 생성

MySQL 콘솔에서:

```sql
CREATE DATABASE ces_smartfarm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ces_user'@'localhost' IDENTIFIED BY '원하는_강력한_비밀번호';
GRANT ALL PRIVILEGES ON ces_smartfarm.* TO 'ces_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 7. 스키마 적용

```bash
cd ~/ces-smartfarm/backend
mysql -u ces_user -p ces_smartfarm < database/schema.sql
```

## 8. .env 파일 업데이트

```bash
nano ~/ces-smartfarm/backend/.env
```

다음 내용으로 수정:
```env
PORT=3000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=ces_user
DB_PASSWORD=위에서_설정한_비밀번호
DB_NAME=ces_smartfarm
JWT_SECRET=최소32자이상의강력한랜덤문자열
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3001
```

## 9. 서버 재시작

```bash
source ~/.nvm/nvm.sh
pm2 restart ces-smartfarm --update-env
pm2 logs ces-smartfarm
```

## 대안: MariaDB 사용

MySQL 설치가 계속 실패한다면 MariaDB를 사용할 수 있습니다:

```bash
sudo apt install mariadb-server -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql -u root
```

MariaDB는 MySQL과 호환되므로 동일한 방법으로 사용할 수 있습니다.

