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
    idempotencyKey: {
      type: String,
      select: false,
    },
    idempotencyHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_document, result) => {
        delete result.idempotencyKey;
        delete result.idempotencyHash;
        return result;
      },
    },
  }
);

jobSchema.index(
  { createdBy: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
    name: 'unique_job_creation_key_per_user',
  }
);

module.exports = mongoose.model('Job', jobSchema);
