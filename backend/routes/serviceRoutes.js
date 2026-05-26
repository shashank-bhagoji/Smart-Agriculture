const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected routes – admin or service_provider can modify
router.post('/', protect, authorize('admin', 'service_provider'), createService);
router.put('/:id', protect, authorize('admin', 'service_provider'), updateService);
router.delete('/:id', protect, authorize('admin', 'service_provider'), deleteService);

module.exports = router;