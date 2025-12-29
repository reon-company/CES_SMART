const express = require('express');
const SensorData = require('../models/SensorData');
const Module = require('../models/Module');
const auth = require('../middleware/auth');
const { sensorDataValidation, validate } = require('../utils/validation');

const router = express.Router();

// @route   POST /api/sensors
// @desc    Receive sensor data from Arduino (30초마다 전송)
// @access  Public (아두이노에서 직접 호출)
router.post('/', sensorDataValidation, validate, async (req, res) => {
  try {
    const { module_id, water_level, temperature, do_level, ph_level, light_level } = req.body;

    // Verify module exists
    const module = await Module.findByModuleId(module_id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Save sensor data
    const dataId = await SensorData.create(module_id, {
      water_level,
      temperature,
      do_level,
      ph_level,
      light_level
    });

    res.status(201).json({
      success: true,
      message: 'Sensor data saved successfully',
      data_id: dataId
    });
  } catch (error) {
    console.error('Save sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sensors/latest/:moduleId
// @desc    Get latest sensor data for a module
// @access  Private
router.get('/latest/:moduleId', auth, async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Verify module belongs to user
    const module = await Module.findByModuleId(moduleId);
    if (!module || module.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const latestData = await SensorData.getLatest(moduleId);

    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'No sensor data found'
      });
    }

    res.json({
      success: true,
      data: latestData
    });
  } catch (error) {
    console.error('Get latest sensor data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sensors/history/:moduleId
// @desc    Get sensor data history for a module
// @access  Private
router.get('/history/:moduleId', auth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { start_date, end_date, limit = 100, offset = 0 } = req.query;

    // Verify module belongs to user
    const module = await Module.findByModuleId(moduleId);
    if (!module || module.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get history
    const history = await SensorData.getHistory(
      moduleId,
      start_date || null,
      end_date || null,
      parseInt(limit),
      parseInt(offset)
    );

    // Get total count
    const totalCount = await SensorData.getHistoryCount(
      moduleId,
      start_date || null,
      end_date || null
    );

    res.json({
      success: true,
      count: history.length,
      total: totalCount,
      data: history
    });
  } catch (error) {
    console.error('Get sensor history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

