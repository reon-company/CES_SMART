const pool = require('../config/database');

class Threshold {
  static async findByModuleId(moduleId) {
    const [rows] = await pool.execute(
      'SELECT * FROM thresholds WHERE module_id = ?',
      [moduleId]
    );
    return rows;
  }

  static async findByModuleIdAndType(moduleId, sensorType) {
    const [rows] = await pool.execute(
      'SELECT * FROM thresholds WHERE module_id = ? AND sensor_type = ?',
      [moduleId, sensorType]
    );
    return rows[0];
  }

  static async createOrUpdate(moduleId, sensorType, minValue, maxValue) {
    const existing = await this.findByModuleIdAndType(moduleId, sensorType);
    
    if (existing) {
      // Update existing threshold
      const [result] = await pool.execute(
        `UPDATE thresholds 
         SET min_value = ?, max_value = ? 
         WHERE module_id = ? AND sensor_type = ?`,
        [minValue, maxValue, moduleId, sensorType]
      );
      return result.affectedRows > 0;
    } else {
      // Create new threshold
      const [result] = await pool.execute(
        `INSERT INTO thresholds (module_id, sensor_type, min_value, max_value) 
         VALUES (?, ?, ?, ?)`,
        [moduleId, sensorType, minValue, maxValue]
      );
      return result.insertId;
    }
  }

  static async updateMultiple(moduleId, thresholds) {
    const results = [];
    for (const threshold of thresholds) {
      const result = await this.createOrUpdate(
        moduleId,
        threshold.sensor_type,
        threshold.min_value,
        threshold.max_value
      );
      results.push(result);
    }
    return results;
  }
}

module.exports = Threshold;

