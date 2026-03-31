const express = require('express');
const authenticate = require('../middleware/auth.middleware');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobs.controller');

const router = express.Router();

// All job routes require authentication
router.use(authenticate);

router.route('/').get(getJobs).post(createJob);
router.route('/:id').get(getJob).patch(updateJob).delete(deleteJob);

module.exports = router;
