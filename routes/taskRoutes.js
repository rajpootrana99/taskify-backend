const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(protect); // All task routes require login

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', adminOnly, createTask);
router.put('/:id', adminOnly, updateTask);
router.patch('/:id/status', updateTaskStatus);   // Admin + Employee
router.delete('/:id', adminOnly, deleteTask);

module.exports = router;
