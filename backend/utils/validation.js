const { body, validationResult } = require('express-validator');

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const moduleValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Module name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Module name must be between 1 and 255 characters'),
  body('module_id')
    .trim()
    .notEmpty()
    .withMessage('Module ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Module ID must be between 1 and 50 characters')
];

const sensorDataValidation = [
  body('module_id')
    .trim()
    .notEmpty()
    .withMessage('Module ID is required'),
  body('water_level')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Water level must be between 0 and 100'),
  body('temperature')
    .optional()
    .isFloat()
    .withMessage('Temperature must be a valid number'),
  body('do_level')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('DO level must be a positive number'),
  body('ph_level')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH level must be between 0 and 14'),
  body('light_level')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Light level must be between 0 and 100')
];

const actuatorControlValidation = [
  body('actuator')
    .isIn(['water_pump', 'air_pump', 'valve', 'heater', 'cooler'])
    .withMessage('Invalid actuator type'),
  body('status')
    .isBoolean()
    .withMessage('Status must be a boolean value')
];

const thresholdValidation = [
  body('sensor_type')
    .isIn(['water_level', 'temperature', 'do_level', 'ph_level', 'light_level'])
    .withMessage('Invalid sensor type'),
  body('min_value')
    .optional()
    .isFloat()
    .withMessage('Min value must be a valid number'),
  body('max_value')
    .optional()
    .isFloat()
    .withMessage('Max value must be a valid number')
];

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  moduleValidation,
  sensorDataValidation,
  actuatorControlValidation,
  thresholdValidation,
  validate
};

