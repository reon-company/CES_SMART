-- Add relay field to sensor_data table for relay history tracking
-- 릴레이 상태 히스토리를 저장하기 위해 sensor_data 테이블에 relay 컬럼 추가

ALTER TABLE sensor_data 
ADD COLUMN relay BOOLEAN DEFAULT FALSE AFTER humidity;

