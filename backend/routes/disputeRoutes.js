const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { raiseDispute, getDisputes, resolveDispute } = require('../controllers/disputeController');

router.post('/', protect, raiseDispute);
router.get('/', protect, getDisputes);
router.patch('/:id/resolve', protect, authorize('admin'), resolveDispute);

module.exports = router;
