const ActivityLog = require('../models/ActivityLog');

/**
 * Logs an activity to the database
 * @param {string} userId - Who performed the action
 * @param {string} action - Action type (TASK_CREATED, etc.)
 * @param {string|null} targetId - Task ID affected
 * @param {string} details - Human-readable description
 */
const logActivity = async (userId, action, targetId = null, details = '') => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      target: targetId,
      details,
    });
  } catch (err) {
    // Non-critical: log error but don't break the request
    console.error('Activity log failed:', err.message);
  }
};

module.exports = logActivity;
