const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { getAdminStats, getMyStats } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);

router.get('/stats', adminOnly, getAdminStats);
router.get('/mine', getMyStats);

module.exports = router;
