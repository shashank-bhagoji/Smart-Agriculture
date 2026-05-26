const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createGroup, joinGroup, getGroups } = require('../controllers/groupBookingController');

router.post('/', protect, createGroup);
router.get('/', getGroups);
router.patch('/:id/join', protect, joinGroup);

module.exports = router;
