const ActivityLog = require('../models/ActivityLog');
const Task = require('../models/Task');

/**
 * GET /api/logs
 * - Admin: all logs
 * - Employee: only logs for their assigned tasks (requires target taskId)
 */
const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.target) filter.target = req.query.target;

    if (req.user.role !== 'admin') {
      if (!req.query.target) {
        return res.status(403).json({ message: 'Access denied. Target task ID is required for non-admins.' });
      }

      const task = await Task.findById(req.query.target);
      if (!task || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to this task.' });
      }
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('user', 'name email role')
        .populate('target', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLogs };
