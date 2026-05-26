const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe, updateMe, toggleFavorite, getFavorites } = require('../controllers/userController');

// Get current user's profile
router.get('/me', protect, getMe);

// Update current user's profile
router.put('/me', protect, updateMe);

// Favorites
router.post('/favorites', protect, toggleFavorite);
router.get('/favorites', protect, getFavorites);

module.exports = router;
