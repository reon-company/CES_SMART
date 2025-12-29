const pool = require('../config/database');

class SensorData {
  static async create(moduleId, data) {
    const [result] = await pool.execute(
      `INSERT INTO sensor_data 
       (module_id, water_level, temperature, do_level, ph_level, light_level) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        moduleId,
        data.water_level || null,
        data.temperature || null,
        data.do_level || null,
        data.ph_level || null,
        data.light_level || null
      ]
    );
    return result.insertId;
  }

  static async getLatest(moduleId) {
    const [rows] = await pool.execute(
      `SELECT * FROM sensor_data 
       WHERE module_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [moduleId]
    );
    return rows[0];
  }

  static async getHistory(moduleId, startDate, endDate, limit = 100, offset = 0) {
    let query = 'SELECT * FROM sensor_data WHERE module_id = ?';
    const params = [moduleId];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getHistoryCount(moduleId, startDate, endDate) {
    let query = 'SELECT COUNT(*) as count FROM sensor_data WHERE module_id = ?';
    const params = [moduleId];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].count;
  }
}

module.exports = SensorData;

