-- Add WiFi RSSI column to sensor_data table
USE ces_smartfarm;

ALTER TABLE sensor_data
ADD COLUMN wifi_rssi INT DEFAULT NULL COMMENT 'WiFi 신호 강도 (dBm)' AFTER light_level;

