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

  static async create(userId, name, moduleId, wifiSsid = null, wifiPassword = null, cameraStreamUrl = null) {
    const [result] = await pool.execute(
      'INSERT INTO modules (user_id, name, module_id, wifi_ssid, wifi_password, camera_stream_url) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, moduleId, wifiSsid, wifiPassword, cameraStreamUrl]
    );
    return result.insertId;
  }

  static async update(id, userId, data) {
    const fields = [];
    const values = [];
    
    console.log('Module.update called with data:', {
      id,
      userId,
      data: { ...data, wifi_password: data.wifi_password ? '***' : data.wifi_password }
    });
    
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
    // camera_stream_url은 null도 허용하므로 undefined가 아닌 경우 모두 업데이트
    if (data.camera_stream_url !== undefined) {
      fields.push('camera_stream_url = ?');
      values.push(data.camera_stream_url); // null도 허용
      console.log('Adding camera_stream_url to update:', data.camera_stream_url);
    } else {
      console.log('camera_stream_url is undefined, skipping update');
    }
    
    if (fields.length === 0) {
      console.log('No fields to update');
      return null;
    }
    
    values.push(id, userId);
    const sql = `UPDATE modules SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    console.log('Executing SQL:', sql);
    console.log('With values:', values.map((v, i) => i < values.length - 2 ? (v === null ? 'NULL' : (typeof v === 'string' && v.length > 20 ? v.substring(0, 20) + '...' : v)) : v));
    
    const [result] = await pool.execute(sql, values);
    console.log('Update result:', { affectedRows: result.affectedRows });
    
    return result.affectedRows > 0;
  }

  static async updateModuleId(id, userId, nextModuleId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.execute(
        'SELECT module_id FROM modules WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      const current = rows[0];
      if (!current) {
        await connection.rollback();
        return { updated: false, reason: 'NOT_FOUND' };
      }

      const previousModuleId = current.module_id;
      if (previousModuleId === nextModuleId) {
        await connection.rollback();
        return { updated: false, reason: 'NO_CHANGE' };
      }

      const [dupRows] = await connection.execute(
        'SELECT id FROM modules WHERE module_id = ? LIMIT 1',
        [nextModuleId]
      );
      if (dupRows.length > 0) {
        await connection.rollback();
        return { updated: false, reason: 'DUPLICATE' };
      }

      // NOTE:
      // schema has foreign keys referencing modules.module_id without ON UPDATE CASCADE.
      // Keep all related rows aligned in a single transaction.
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');

      await connection.execute(
        'UPDATE sensor_data SET module_id = ? WHERE module_id = ?',
        [nextModuleId, previousModuleId]
      );
      await connection.execute(
        'UPDATE actuator_status SET module_id = ? WHERE module_id = ?',
        [nextModuleId, previousModuleId]
      );
      await connection.execute(
        'UPDATE thresholds SET module_id = ? WHERE module_id = ?',
        [nextModuleId, previousModuleId]
      );
      const [moduleResult] = await connection.execute(
        'UPDATE modules SET module_id = ? WHERE id = ? AND user_id = ?',
        [nextModuleId, id, userId]
      );

      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      await connection.commit();

      return {
        updated: moduleResult.affectedRows > 0,
        reason: moduleResult.affectedRows > 0 ? 'UPDATED' : 'NO_CHANGE',
      };
    } catch (error) {
      try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch (_) {
        // ignore reset error
      }
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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

