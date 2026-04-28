const Task = require('../models/Task');
const logActivity = require('../utils/logger');

/**
 * GET /api/tasks
 * - Admin: all tasks
 * - Employee: only their tasks
 */
const getTasks = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Employees can only view their own tasks
    if (
      req.user.role !== 'admin' &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * POST /api/tasks  (Admin only)
 */
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority,
      dueDate,
    });

    await logActivity(
      req.user._id,
      'TASK_CREATED',
      task._id,
      `Task "${title}" assigned to user ${assignedTo}`
    );

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/tasks/:id  (Admin only)
 */
const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, priority, dueDate, status },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    await logActivity(
      req.user._id,
      'TASK_UPDATED',
      task._id,
      `Task "${task.title}" updated by ${req.user.name}`
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PATCH /api/tasks/:id/status
 * Employee updates their own task status; Admin can update any
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['todo', 'inprogress', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (
      req.user.role !== 'admin' &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.status = status;
    await task.save();

    await logActivity(
      req.user._id,
      'STATUS_UPDATED',
      task._id,
      `Status of "${task.title}" changed to ${status} by ${req.user.name}`
    );

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE /api/tasks/:id  (Admin only)
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await logActivity(
      req.user._id,
      'TASK_DELETED',
      null,
      `Task "${task.title}" deleted by ${req.user.name}`
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
