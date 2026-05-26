const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTransport, getMyTransports } = require('../controllers/transportController');

// All transport routes require login
router.post('/', protect, createTransport);
router.get('/', protect, getMyTransports);

module.exports = router;
