const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const {
  addEquipment,
  getAllEquipment,
  getOwnerEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentAvailability,
} = require('../controllers/equipmentController');

// Public routes
router.get('/', getAllEquipment); // list with filters

// Owner protected routes
router.get('/owner', protect, authorize('owner', 'admin'), getOwnerEquipment);
router.post('/', protect, authorize('owner', 'admin'), addEquipment);
router.put('/:id', protect, authorize('owner', 'admin'), updateEquipment);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteEquipment);

// Public route that must be after /owner
router.get('/:id', getEquipmentById); // detail view
router.get('/:id/availability', getEquipmentAvailability); // availability dates

module.exports = router;