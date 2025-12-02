const express = require('express');
const ActuatorStatus = require('../models/ActuatorStatus');
const Module = require('../models/Module');
const auth = require('../middleware/auth');
const { actuatorControlValidation, validate } = require('../utils/validation');

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    return auth(req, res, next);
  }
  req.user = null;
  next();
};

const router = express.Router();

// @route   GET /api/actuators/status/:moduleId
// @desc    Get actuator status for a module (Public for Arduino, Private for web)
// @access  Public (아두이노에서 직접 호출 가능)
router.get('/status/:moduleId', optionalAuth, async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Verify module exists
    const module = await Module.findByModuleId(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // If authenticated, verify module belongs to user
    if (req.user && module.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const status = await ActuatorStatus.findByModuleId(moduleId);

    if (!status) {
      // Return default status if not found
      return res.json({
        water_pump: false,
        air_pump: false,
        valve: false,
        heater: false,
        cooler: false
      });
    }

    // Return status directly (without success wrapper for Arduino compatibility)
    res.json({
      water_pump: status.water_pump || false,
      air_pump: status.air_pump || false,
      valve: status.valve || false,
      heater: status.heater || false,
      cooler: status.cooler || false
    });
  } catch (error) {
    console.error('Get actuator status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/actuators/control/:moduleId
// @desc    Control actuator for a module
// @access  Private
router.post('/control/:moduleId', auth, actuatorControlValidation, validate, async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { actuator, status } = req.body;

    // Verify module belongs to user
    const module = await Module.findByModuleId(moduleId);
    if (!module || module.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Update actuator status
    const updated = await ActuatorStatus.updateStatus(moduleId, actuator, status);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update actuator status'
      });
    }

    // Get updated status
    const actuatorStatus = await ActuatorStatus.findByModuleId(moduleId);

    res.json({
      success: true,
      message: `Actuator ${actuator} ${status ? 'turned on' : 'turned off'}`,
      status: actuatorStatus
    });
  } catch (error) {
    console.error('Control actuator error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/actuators/status/update/:moduleId
// @desc    Update multiple actuator statuses (for Arduino polling)
// @access  Public (아두이노에서 직접 호출 가능하지만, 모듈 검증 필요)
router.post('/status/update/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { water_pump, air_pump, valve, heater, cooler } = req.body;

    // Verify module exists
    const module = await Module.findByModuleId(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Update actuator status
    await ActuatorStatus.createOrUpdate(moduleId, {
      water_pump,
      air_pump,
      valve,
      heater,
      cooler
    });

    const actuatorStatus = await ActuatorStatus.findByModuleId(moduleId);

    res.json({
      success: true,
      message: 'Actuator status updated',
      status: actuatorStatus
    });
  } catch (error) {
    console.error('Update actuator status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

