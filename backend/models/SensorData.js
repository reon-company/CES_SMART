const pool = require('../config/database');

// 유지보수 메모:
// SensorData는 릴레이 상태에 대해 혼합 펌웨어 페이로드 타입(string/number/bool)을 허용합니다.
// 하위 호환성을 위해 여기서의 정규화는 의도적으로 방어적입니다.
class SensorData {
  static async create(moduleId, data) {
    // Convert relay to proper boolean value (handle both boolean and string)
    let relayValue = null;
    if (data.relay !== undefined && data.relay !== null) {
      if (typeof data.relay === 'boolean') {
        relayValue = data.relay ? 1 : 0;
      } else if (typeof data.relay === 'string') {
        relayValue = (data.relay === 'true' || data.relay === '1') ? 1 : 0;
      } else if (typeof data.relay === 'number') {
        relayValue = data.relay ? 1 : 0;
      } else {
        relayValue = Boolean(data.relay) ? 1 : 0;
      }
    }

    const [result] = await pool.execute(
      `INSERT INTO sensor_data 
       (module_id, water_level, temperature, humidity, relay, do_level, ph_level, light_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        moduleId,
        data.water_level || null,
        data.temperature || null,
        data.humidity || null,
        relayValue,
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
    // LIMIT과 OFFSET은 파라미터로 바인딩할 수 없으므로 쿼리 문자열에 직접 포함
    const safeLimit = parseInt(limit) || 100;
    const safeOffset = parseInt(offset) || 0;
    
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

    // LIMIT과 OFFSET을 쿼리 문자열에 직접 포함 (SQL injection 방지를 위해 parseInt 사용)
    query += ` ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

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

