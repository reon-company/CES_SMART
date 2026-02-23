const express = require('express');
const ActuatorStatus = require('../models/ActuatorStatus');
const Module = require('../models/Module');
const auth = require('../middleware/auth');
const { actuatorControlValidation, validate } = require('../utils/validation');

// 유지보수 메모:
// 이 파일은 공개 아두이노 폴링 엔드포인트와 비공개 대시보드 제어 엔드포인트를 모두 제공합니다.
// 파라미터화된 라우트가 특정 경로를 가릴 수 있으므로 라우트 선언 순서가 중요합니다.
const router = express.Router();

// IMPORTANT: More specific routes must come BEFORE less specific routes
// /status/:moduleId must come before /:moduleId

// @route   GET /api/actuators/status/:moduleId
// @desc    Get actuator status for a module (Public - for Arduino)
// @access  Public (아두이노에서 직접 호출)
// This route MUST be defined before /:moduleId to avoid route matching issues
router.get('/status/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // Debug logging
    console.log(`[PUBLIC] GET /api/actuators/status/${moduleId} - No auth required`);

    // Verify module exists (no auth required for Arduino)
    const module = await Module.findByModuleId(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const status = await ActuatorStatus.findByModuleId(moduleId);

    if (!status) {
      // Return default status if not found
      return res.json({
        success: true,
        status: {
          module_id: moduleId,
          water_pump: false,
          air_pump: false,
          valve: false,
          heater: false,
          cooler: false,
          relay: false
        }
      });
    }

    // Convert MySQL TINYINT(1) to proper boolean values for JSON
    // MySQL BOOLEAN is stored as 0/1, but JSON should use true/false for Arduino compatibility
    const normalizedStatus = {
      ...status,
      water_pump: Boolean(status.water_pump),
      air_pump: Boolean(status.air_pump),
      valve: Boolean(status.valve),
      heater: Boolean(status.heater),
      cooler: Boolean(status.cooler),
      relay: Boolean(status.relay)
    };

    res.json({
      success: true,
      status: normalizedStatus
    });
  } catch (error) {
    console.error('Get actuator status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/actuators/:moduleId
// @desc    Get actuator status for a module (Private - for web dashboard)
// @access  Private
router.get('/:moduleId', auth, async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // Debug logging
    console.log(`[PRIVATE] GET /api/actuators/${moduleId} - Auth required`);

    // Verify module belongs to user
    const module = await Module.findByModuleId(moduleId);
    if (!module || module.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const status = await ActuatorStatus.findByModuleId(moduleId);

    if (!status) {
      // Return default status if not found
      return res.json({
        success: true,
        status: {
          module_id: moduleId,
          water_pump: false,
          air_pump: false,
          valve: false,
          heater: false,
          cooler: false,
          relay: false
        }
      });
    }

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get actuator status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/actuators/:moduleId/:actuatorType
// @desc    Control actuator for a module (alternative endpoint)
// @access  Private
router.post('/:moduleId/:actuatorType', auth, async (req, res) => {
  try {
    const { moduleId, actuatorType } = req.params;
    const { action } = req.body;
    
    // Debug logging
    console.log(`[PRIVATE] POST /api/actuators/${moduleId}/${actuatorType} - Action: ${action}`);
    
    // Convert action to boolean
    const status = action === 'on' || action === true || action === 'true';
    
    // Map actuator type
    const actuator = actuatorType === 'relay' ? 'relay' : actuatorType;

    // Verify module belongs to user
    const module = await Module.findByModuleId(moduleId);
    if (!module) {
      console.log(`Module not found: ${moduleId}`);
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    if (module.user_id !== req.user.id) {
      console.log(`Module ${moduleId} does not belong to user ${req.user.id}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log(`Updating ${actuator} to ${status} for module ${moduleId}`);

    // Update actuator status
    const updated = await ActuatorStatus.updateStatus(moduleId, actuator, status);

    if (!updated) {
      console.error(`Failed to update ${actuator} status for module ${moduleId}`);
      return res.status(400).json({
        success: false,
        message: 'Failed to update actuator status'
      });
    }

    // Get updated status
    const actuatorStatus = await ActuatorStatus.findByModuleId(moduleId);

    console.log(`Successfully updated ${actuator} to ${status} for module ${moduleId}`);

    res.json({
      success: true,
      message: `Actuator ${actuator} ${status ? 'turned on' : 'turned off'}`,
      status: actuatorStatus
    });
  } catch (error) {
    console.error('Control actuator error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/actuators/control/:moduleId
// @desc    Control actuator for a module (original endpoint)
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

    // Convert status to boolean
    const actuatorStatus = status === 'on' || status === true;

    // Update actuator status
    const updated = await ActuatorStatus.updateStatus(moduleId, actuator, actuatorStatus);

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'Failed to update actuator status'
      });
    }

    // Get updated status
    const fullStatus = await ActuatorStatus.findByModuleId(moduleId);

    res.json({
      success: true,
      message: `Actuator ${actuator} ${actuatorStatus ? 'turned on' : 'turned off'}`,
      status: fullStatus
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
    const { water_pump, air_pump, valve, heater, cooler, relay } = req.body;

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
      cooler,
      relay
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

