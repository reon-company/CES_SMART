-- Add camera_stream_url column for ESP32-CAM real-time stream
-- Run this on existing database: mysql -u user -p ces_smartfarm < migration_add_camera_stream_url.sql

USE ces_smartfarm;

ALTER TABLE modules
ADD COLUMN camera_stream_url VARCHAR(512) DEFAULT NULL
COMMENT 'ESP32-CAM 실시간 스트림 URL (예: http://192.168.0.100:81/stream)'
AFTER wifi_password;
