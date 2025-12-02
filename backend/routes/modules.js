const express = require('express');
const Module = require('../models/Module');
const ActuatorStatus = require('../models/ActuatorStatus');
const auth = require('../middleware/auth');
const { moduleValidation, validate } = require('../utils/validation');

const router = express.Router();
const MAX_MODULES = 30;

// @route   GET /api/modules
// @desc    Get all modules for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const modules = await Module.findByUserId(req.user.id);
    res.json({
      success: true,
      count: modules.length,
      modules
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/modules/:moduleId/wifi-config
// @desc    Get WiFi configuration for module (for Arduino)
// @access  Public (Arduino needs to access this)
// NOTE: This route must be defined BEFORE /:moduleId to avoid route conflicts
router.get('/:moduleId/wifi-config', async (req, res) => {
  try {
    const module = await Module.findByModuleId(req.params.moduleId);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    if (!module.wifi_ssid || !module.wifi_password) {
      return res.status(404).json({
        success: false,
        message: 'WiFi configuration not set'
      });
    }

    // WiFi 정보 반환 (비밀번호는 평문으로 전송 - HTTPS 권장)
    res.json({
      success: true,
      wifi_ssid: module.wifi_ssid,
      wifi_password: module.wifi_password
    });
  } catch (error) {
    console.error('Get WiFi config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/modules/:moduleId
// @desc    Get single module by module_id (string) or id (number)
// @access  Private
router.get('/:moduleId', auth, async (req, res) => {
  try {
    // Check if moduleId is a number (database id) or string (module_id)
    const isNumeric = /^\d+$/.test(req.params.moduleId);
    let module;
    
    if (isNumeric) {
      // If numeric, use findById
      module = await Module.findById(req.params.moduleId, req.user.id);
    } else {
      // If string, use findByModuleId and verify user ownership
      const foundModule = await Module.findByModuleId(req.params.moduleId);
      if (foundModule && foundModule.user_id === req.user.id) {
        module = foundModule;
      } else {
        module = null;
      }
    }
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.json({
      success: true,
      module
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/modules
// @desc    Create a new module
// @access  Private
router.post('/', auth, moduleValidation, validate, async (req, res) => {
  try {
    const { name, module_id } = req.body;
    // WiFi 정보는 선택 사항 (나중에 모듈 상세 페이지에서 설정 가능)
    const { wifi_ssid, wifi_password } = req.body;

    // Check module count limit (최대 30개)
    const moduleCount = await Module.countByUserId(req.user.id);
    if (moduleCount >= MAX_MODULES) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_MODULES} modules allowed per user`
      });
    }

    // Check if module_id already exists
    const existingModule = await Module.findByModuleId(module_id);
    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: 'Module ID already exists'
      });
    }

    // Create module (WiFi 정보는 선택 사항)
    const moduleId = await Module.create(req.user.id, name, module_id, wifi_ssid || null, wifi_password || null);

    // Initialize actuator status
    await ActuatorStatus.createOrUpdate(module_id, {
      water_pump: false,
      air_pump: false,
      valve: false,
      heater: false,
      cooler: false
    });

    const module = await Module.findById(moduleId, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/modules/:moduleId
// @desc    Update module by module_id (string) or id (number)
// @access  Private
router.put('/:moduleId', auth, async (req, res) => {
  try {
    const { name, status, wifi_ssid, wifi_password } = req.body;

    // Check if moduleId is a number (database id) or string (module_id)
    const isNumeric = /^\d+$/.test(req.params.moduleId);
    let module;
    let dbId;
    
    if (isNumeric) {
      // If numeric, use findById
      dbId = req.params.moduleId;
      module = await Module.findById(dbId, req.user.id);
    } else {
      // If string, use findByModuleId and verify user ownership
      const foundModule = await Module.findByModuleId(req.params.moduleId);
      if (foundModule && foundModule.user_id === req.user.id) {
        module = foundModule;
        dbId = foundModule.id;
      } else {
        module = null;
      }
    }

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Update module
    const updated = await Module.update(dbId, req.user.id, {
      name,
      status,
      wifi_ssid,
      wifi_password
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No changes made'
      });
    }

    const updatedModule = await Module.findById(dbId, req.user.id);

    res.json({
      success: true,
      message: 'Module updated successfully',
      module: updatedModule
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/modules/:moduleId
// @desc    Delete module by module_id (string) or id (number)
// @access  Private
router.delete('/:moduleId', auth, async (req, res) => {
  try {
    // Check if moduleId is a number (database id) or string (module_id)
    const isNumeric = /^\d+$/.test(req.params.moduleId);
    let module;
    let dbId;
    
    if (isNumeric) {
      // If numeric, use findById
      dbId = req.params.moduleId;
      module = await Module.findById(dbId, req.user.id);
    } else {
      // If string, use findByModuleId and verify user ownership
      const foundModule = await Module.findByModuleId(req.params.moduleId);
      if (foundModule && foundModule.user_id === req.user.id) {
        module = foundModule;
        dbId = foundModule.id;
      } else {
        module = null;
      }
    }

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Delete module (cascade will handle related data)
    const deleted = await Module.delete(dbId, req.user.id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete module'
      });
    }

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

