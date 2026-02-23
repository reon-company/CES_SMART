const pool = require('../config/database');

// 유지보수 메모:
// User 모델은 비밀번호 해시 유출을 방지하기 위해 findById에서 제한된 필드만 노출합니다.
// 필드 선택이 변경되면 auth 미들웨어와 프론트엔드 프로필 페이로드가 영향을 받습니다.
class User {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async create(email, password, name) {
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, password, name]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    
    if (data.name) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.password) {
      fields.push('password = ?');
      values.push(data.password);
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;

