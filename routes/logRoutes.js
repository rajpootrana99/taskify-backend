const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { getLogs } = require('../controllers/logController');

const router = express.Router();

router.get('/', protect, getLogs);

module.exports = router;
