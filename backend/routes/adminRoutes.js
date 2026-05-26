const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { getStats, getAllUsers, updateUserRole, deleteEquipment, deleteService, getPendingOwners, approveOwner, deleteUser } = require('../controllers/adminController');

// All routes here are admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/pending-owners', getPendingOwners);
router.patch('/owners/:id/approve', approveOwner);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.delete('/equipment/:id', deleteEquipment);
router.delete('/services/:id', deleteService);

module.exports = router;
