-- WiFi 설정 컬럼 추가 마이그레이션
-- 기존 데이터베이스에 WiFi 컬럼을 추가하는 스크립트

USE ces_smartfarm;

ALTER TABLE modules 
ADD COLUMN wifi_ssid VARCHAR(255) DEFAULT NULL COMMENT 'WiFi SSID' AFTER module_id,
ADD COLUMN wifi_password VARCHAR(255) DEFAULT NULL COMMENT 'WiFi Password' AFTER wifi_ssid;

