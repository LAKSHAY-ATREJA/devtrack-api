const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticate = require('../middleware/auth.middleware');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getStats,
} = require('../controllers/jobs.controller');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

const VALID_STATUSES = ['applied', 'interview', 'offer', 'rejected', 'accepted'];

const createJobValidation = [
  body('company').trim().notEmpty().withMessage('Company name is required').isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  body('position').trim().notEmpty().withMessage('Position is required').isLength({ max: 100 }).withMessage('Position cannot exceed 100 characters'),
  body('status').optional().isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  body('appliedDate').optional().isISO8601().withMessage('Applied date must be a valid date'),
];

const updateJobValidation = [
  body('company').optional().trim().notEmpty().withMessage('Company name cannot be empty').isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  body('position').optional().trim().notEmpty().withMessage('Position cannot be empty').isLength({ max: 100 }).withMessage('Position cannot exceed 100 characters'),
  body('status').optional().isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
  body('appliedDate').optional().isISO8601().withMessage('Applied date must be a valid date'),
];

// All job routes require authentication
router.use(authenticate);

router.get('/stats', getStats);
router.route('/').get(getJobs).post(createJobValidation, validate, createJob);
router.route('/:id').get(getJob).patch(updateJobValidation, validate, updateJob).delete(deleteJob);

module.exports = router;
