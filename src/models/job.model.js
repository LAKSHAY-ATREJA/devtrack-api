const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 100,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ['applied', 'interview', 'offer', 'rejected', 'accepted'],
      default: 'applied',
    },
    location: { type: String, trim: true, default: 'Remote' },
    salary: { type: Number, min: 0 },
    notes: { type: String, maxlength: 1000 },
    appliedDate: { type: Date, default: Date.now },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
