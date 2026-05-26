const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markRead, markAllRead, clearNotifications } = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllRead);
router.patch('/:id/read', protect, markRead);
router.delete('/', protect, clearNotifications);

module.exports = router;
