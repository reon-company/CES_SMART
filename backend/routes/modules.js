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

// @route   GET /api/modules/:moduleId
// @desc    Get single module by ID
// @access  Private
router.get('/:moduleId', auth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId, req.user.id);
    
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

    // Create module
    const moduleId = await Module.create(req.user.id, name, module_id);

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
// @desc    Update module
// @access  Private
router.put('/:moduleId', auth, async (req, res) => {
  try {
    const { name, status } = req.body;

    // Check if module exists and belongs to user
    const module = await Module.findById(req.params.moduleId, req.user.id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Update module
    const updated = await Module.update(req.params.moduleId, req.user.id, {
      name,
      status
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No changes made'
      });
    }

    const updatedModule = await Module.findById(req.params.moduleId, req.user.id);

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
// @desc    Delete module
// @access  Private
router.delete('/:moduleId', auth, async (req, res) => {
  try {
    // Check if module exists and belongs to user
    const module = await Module.findById(req.params.moduleId, req.user.id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Delete module (cascade will handle related data)
    const deleted = await Module.delete(req.params.moduleId, req.user.id);

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

