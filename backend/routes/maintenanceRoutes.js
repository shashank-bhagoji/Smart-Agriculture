const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRequest, getMyRequests, updateStatus } = require('../controllers/maintenanceController');

router.post('/', protect, createRequest);
router.get('/', protect, getMyRequests);
router.patch('/:id', protect, updateStatus);

module.exports = router;
