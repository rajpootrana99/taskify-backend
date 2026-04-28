const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_DELETED',
        'STATUS_UPDATED',
        'USER_REGISTERED',
        'USER_LOGGED_IN',
      ],
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// TTL index: auto-delete logs older than 90 days (performance optimization)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
