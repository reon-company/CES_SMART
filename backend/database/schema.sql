-- CES SmartFarm Database Schema
-- MySQL Database for AWS RDS

CREATE DATABASE IF NOT EXISTS ces_smartfarm;
USE ces_smartfarm;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modules table (최대 30개 제한은 애플리케이션 레벨에서 처리)
CREATE TABLE IF NOT EXISTS modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  module_id VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('active', 'inactive', 'error') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_module_id (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sensor data table
CREATE TABLE IF NOT EXISTS sensor_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id VARCHAR(50) NOT NULL,
  water_level DECIMAL(5,2) DEFAULT NULL COMMENT '0-100%',
  temperature DECIMAL(5,2) DEFAULT NULL COMMENT '섭씨 온도',
  do_level DECIMAL(5,2) DEFAULT NULL COMMENT 'mg/L',
  ph_level DECIMAL(4,2) DEFAULT NULL COMMENT '0-14',
  light_level DECIMAL(5,2) DEFAULT NULL COMMENT '0-100%',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE,
  INDEX idx_module_id (module_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Actuator status table
CREATE TABLE IF NOT EXISTS actuator_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id VARCHAR(50) UNIQUE NOT NULL,
  water_pump BOOLEAN DEFAULT FALSE,
  air_pump BOOLEAN DEFAULT FALSE,
  valve BOOLEAN DEFAULT FALSE,
  heater BOOLEAN DEFAULT FALSE,
  cooler BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE,
  INDEX idx_module_id (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thresholds table
CREATE TABLE IF NOT EXISTS thresholds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id VARCHAR(50) NOT NULL,
  sensor_type ENUM('water_level', 'temperature', 'do_level', 'ph_level', 'light_level') NOT NULL,
  min_value DECIMAL(10,2) DEFAULT NULL,
  max_value DECIMAL(10,2) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE,
  UNIQUE KEY unique_module_sensor (module_id, sensor_type),
  INDEX idx_module_id (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

