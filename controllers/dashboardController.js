const Task = require('../models/Task');
const User = require('../models/User');

/**
 * GET /api/dashboard/stats  (Admin)
 */
const getAdminStats = async (req, res) => {
  try {
    const [totalTasks, todo, inprogress, completed, totalUsers] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'todo' }),
      Task.countDocuments({ status: 'inprogress' }),
      Task.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'employee' }),
    ]);

    // Per-employee completion rates
    const employees = await User.find({ role: 'employee' }).select('name email');
    const employeeStats = await Promise.all(
      employees.map(async (emp) => {
        const empTotal = await Task.countDocuments({ assignedTo: emp._id });
        const empCompleted = await Task.countDocuments({
          assignedTo: emp._id,
          status: 'completed',
        });
        return {
          id: emp._id,
          name: emp.name,
          email: emp.email,
          total: empTotal,
          completed: empCompleted,
          completionRate: empTotal > 0 ? Math.round((empCompleted / empTotal) * 100) : 0,
        };
      })
    );

    res.json({
      totalTasks,
      totalUsers,
      byStatus: { todo, inprogress, completed },
      employeeStats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/dashboard/mine  (Employee)
 */
const getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, todo, inprogress, completed] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'todo' }),
      Task.countDocuments({ assignedTo: userId, status: 'inprogress' }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' }),
    ]);

    res.json({
      total,
      byStatus: { todo, inprogress, completed },
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAdminStats, getMyStats };
