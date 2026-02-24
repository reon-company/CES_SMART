-- Add relay field to actuator_status table for DHT11 + Relay test setup
ALTER TABLE actuator_status 
ADD COLUMN relay BOOLEAN DEFAULT FALSE AFTER cooler;

-- Update sensor_data table to support temperature and humidity (DHT11)
ALTER TABLE sensor_data 
MODIFY COLUMN temperature DECIMAL(5,2) DEFAULT NULL COMMENT '섭씨 온도 (DHT11)',
ADD COLUMN humidity DECIMAL(5,2) DEFAULT NULL COMMENT '습도 % (DHT11)' AFTER temperature;

