const express = require('express');
const Threshold = require('../models/Threshold');
const Module = require('../models/Module');
const auth = require('../middleware/auth');
const { thresholdValidation, validate } = require('../utils/validation');

// 유지보수 메모:
// 임계값 설정은 모듈 소유권에 민감합니다. 여기서의 auth/소유권 변경은
// 현장 운영의 자동 제어 안전 가정에 직접 영향을 줍니다.
const router = express.Router();

// @route   GET /api/config/thresholds/:moduleId
// @desc    Get all thresholds for a module
// @access  Private
router.get('/thresholds/:moduleId', auth, async (req, res) => {
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

    const thresholds = await Threshold.findByModuleId(moduleId);

    res.json({
      success: true,
      count: thresholds.length,
      thresholds
    });
  } catch (error) {
    console.error('Get thresholds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/config/thresholds/:moduleId/:sensor_type
// @desc    Get threshold for a specific sensor type
// @access  Private
router.get('/thresholds/:moduleId/:sensor_type', auth, async (req, res) => {
  try {
    const { moduleId, sensor_type } = req.params;

    // Verify module belongs to user
    const module = await Module.findByModuleId(moduleId);
    if (!module || module.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const threshold = await Threshold.findByModuleIdAndType(moduleId, sensor_type);

    if (!threshold) {
      return res.status(404).json({
        success: false,
        message: 'Threshold not found for this sensor type'
      });
    }

    res.json({
      success: true,
      threshold
    });
  } catch (error) {
    console.error('Get threshold error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/config/thresholds/:moduleId
// @desc    Update thresholds for a module
// @access  Private
router.post('/thresholds/:moduleId', auth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { thresholds } = req.body;

    // Verify module belongs to user
    const module = await Module.findByModuleId(moduleId);
    if (!module || module.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Validate thresholds array
    if (!Array.isArray(thresholds)) {
      return res.status(400).json({
        success: false,
        message: 'Thresholds must be an array'
      });
    }

    // Update thresholds
    const results = await Threshold.updateMultiple(moduleId, thresholds);

    // Get updated thresholds
    const updatedThresholds = await Threshold.findByModuleId(moduleId);

    res.json({
      success: true,
      message: 'Thresholds updated successfully',
      thresholds: updatedThresholds
    });
  } catch (error) {
    console.error('Update thresholds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

