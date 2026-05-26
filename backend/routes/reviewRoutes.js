const express = require('express');
const router = express.Router();
const { createReview, getReviewsForItem } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/:type/:itemId', getReviewsForItem);

module.exports = router;
