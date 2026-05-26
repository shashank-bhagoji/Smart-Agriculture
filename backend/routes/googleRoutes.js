const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAuthUrl, handleCallback } = require('../controllers/googleController');

router.get('/auth', protect, getAuthUrl);
router.get('/callback', handleCallback);

module.exports = router;
