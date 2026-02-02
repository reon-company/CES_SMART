const pool = require('../config/database');

class ActuatorStatus {
  static async findByModuleId(moduleId) {
    const [rows] = await pool.execute(
      'SELECT * FROM actuator_status WHERE module_id = ?',
      [moduleId]
    );
    return rows[0];
  }

  static async createOrUpdate(moduleId, data) {
    // Check if record exists
    const existing = await this.findByModuleId(moduleId);
    
    if (existing) {
      // Update existing record
      const [result] = await pool.execute(
        `UPDATE actuator_status 
         SET water_pump = ?, air_pump = ?, valve = ?, heater = ?, cooler = ?, relay = ? 
         WHERE module_id = ?`,
        [
          data.water_pump !== undefined ? data.water_pump : existing.water_pump,
          data.air_pump !== undefined ? data.air_pump : existing.air_pump,
          data.valve !== undefined ? data.valve : existing.valve,
          data.heater !== undefined ? data.heater : existing.heater,
          data.cooler !== undefined ? data.cooler : existing.cooler,
          data.relay !== undefined ? data.relay : (existing.relay || false),
          moduleId
        ]
      );
      return result.affectedRows > 0;
    } else {
      // Create new record
      const [result] = await pool.execute(
        `INSERT INTO actuator_status 
         (module_id, water_pump, air_pump, valve, heater, cooler, relay) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          moduleId,
          data.water_pump || false,
          data.air_pump || false,
          data.valve || false,
          data.heater || false,
          data.cooler || false,
          data.relay || false
        ]
      );
      return result.insertId;
    }
  }

  static async updateStatus(moduleId, actuator, status) {
    const fieldMap = {
      water_pump: 'water_pump',
      air_pump: 'air_pump',
      valve: 'valve',
      heater: 'heater',
      cooler: 'cooler',
      relay: 'relay'
    };

    if (!fieldMap[actuator]) {
      throw new Error('Invalid actuator type');
    }

    const existing = await this.findByModuleId(moduleId);
    if (!existing) {
      // Create new record with default values
      const defaultData = {
        water_pump: false,
        air_pump: false,
        valve: false,
        heater: false,
        cooler: false,
        relay: false
      };
      defaultData[actuator] = status;
      return await this.createOrUpdate(moduleId, defaultData);
    }

    const [result] = await pool.execute(
      `UPDATE actuator_status SET ${fieldMap[actuator]} = ? WHERE module_id = ?`,
      [status, moduleId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ActuatorStatus;

