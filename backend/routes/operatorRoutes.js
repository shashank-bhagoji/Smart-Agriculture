const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const {
  createOperator,
  getOperators,
  getOperatorById,
  updateOperator,
  deleteOperator,
} = require('../controllers/operatorController');

// Public endpoints
router.get('/', getOperators);
router.get('/:id', getOperatorById);

// Protected: only admin or service_provider can create/update/delete operators
router.post('/', protect, authorize('admin', 'service_provider'), createOperator);
router.put('/:id', protect, authorize('admin', 'service_provider'), updateOperator);
router.delete('/:id', protect, authorize('admin', 'service_provider'), deleteOperator);

module.exports = router;
