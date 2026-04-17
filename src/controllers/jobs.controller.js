const mongoose = require('mongoose');
const Job = require('../models/job.model');

const ALLOWED_SORT_FIELDS = [
  'createdAt', '-createdAt',
  'updatedAt', '-updatedAt',
  'company', '-company',
  'position', '-position',
  'status', '-status',
  'appliedDate', '-appliedDate',
  'salary', '-salary',
];

// GET /api/jobs?status=applied&sort=-createdAt&page=1&limit=10
exports.getJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let { sort = '-createdAt' } = req.query;

    // Sanitise sort parameter to prevent injection
    if (!ALLOWED_SORT_FIELDS.includes(sort)) {
      sort = '-createdAt';
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = { createdBy: req.user.id };
    if (status) {
      const validStatuses = ['applied', 'interview', 'offer', 'rejected', 'accepted'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      filter.status = status;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort(sort).skip(skip).limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (err) {
    next(err);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const { company, position, status, location, salary, notes, appliedDate } = req.body;
    const job = await Job.create({
      company,
      position,
      status,
      location,
      salary,
      notes,
      appliedDate,
      createdBy: req.user.id,
    });
    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const { company, position, status, location, salary, notes, appliedDate } = req.body;
    const updates = {};
    if (company !== undefined) updates.company = company;
    if (position !== undefined) updates.position = position;
    if (status !== undefined) updates.status = status;
    if (location !== undefined) updates.location = location;
    if (salary !== undefined) updates.salary = salary;
    if (notes !== undefined) updates.notes = notes;
    if (appliedDate !== undefined) updates.appliedDate = appliedDate;

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updates,
      { new: true, runValidators: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/stats — summary counts grouped by status
exports.getStats = async (req, res, next) => {
  try {
    const results = await Job.aggregate([
      { $match: { createdBy: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusOrder = ['applied', 'interview', 'offer', 'rejected', 'accepted'];
    const stats = {};
    statusOrder.forEach((s) => { stats[s] = 0; });
    results.forEach(({ _id, count }) => { stats[_id] = count; });

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    res.json({ stats, total });
  } catch (err) {
    next(err);
  }
};
