const pool = require('../config/database');

class Module {
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM modules WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM modules WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  static async findByModuleId(moduleId) {
    const [rows] = await pool.execute(
      'SELECT * FROM modules WHERE module_id = ?',
      [moduleId]
    );
    return rows[0];
  }

  static async countByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM modules WHERE user_id = ?',
      [userId]
    );
    return rows[0].count;
  }

  static async create(userId, name, moduleId, wifiSsid = null, wifiPassword = null) {
    const [result] = await pool.execute(
      'INSERT INTO modules (user_id, name, module_id, wifi_ssid, wifi_password) VALUES (?, ?, ?, ?, ?)',
      [userId, name, moduleId, wifiSsid, wifiPassword]
    );
    return result.insertId;
  }

  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    
    if (data.name) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.status) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.wifi_ssid !== undefined) {
      fields.push('wifi_ssid = ?');
      values.push(data.wifi_ssid);
    }
    if (data.wifi_password !== undefined) {
      fields.push('wifi_password = ?');
      values.push(data.wifi_password);
    }
    
    if (fields.length === 0) return null;
    
    values.push(id, userId);
    const [result] = await pool.execute(
      `UPDATE modules SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM modules WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Module;

