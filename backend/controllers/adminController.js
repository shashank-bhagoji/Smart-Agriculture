const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { sendApprovalNotification, sendDeletionNotification } = require('../services/emailService');
const { createNotification } = require('./notificationController');

// @desc  Get pending equipment owners
// @route GET /api/admin/pending-owners
exports.getPendingOwners = async (req, res) => {
  try {
    const owners = await User.find({ role: 'owner', isApproved: false }).select('-password');
    res.json(owners);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Approve or Reject owner
// @route PATCH /api/admin/owners/:id/approve
exports.approveOwner = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const isAccepted = status === 'accepted';
    
    let user;
    if (isAccepted) {
      user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
      if (user) {
        await createNotification(user._id, "Your account has been approved! You can now list your equipment.", "approval");
      }
    } else {
      user = await User.findById(req.params.id);
      if (user) {
        await createNotification(user._id, "Your registration request was rejected.", "rejection");
        await User.findByIdAndDelete(req.params.id);
      }
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Send email to the owner
    await sendApprovalNotification(user.email, isAccepted);

    res.json({ message: `Owner ${status} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get platform-wide statistics
// @route GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const equipmentCount = await Equipment.countDocuments();
    const serviceCount = await Service.countDocuments();
    const bookings = await Booking.find();
    
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    res.json({
      users: userCount,
      equipment: equipmentCount,
      services: serviceCount,
      totalRevenue,
      pendingBookings,
      totalBookings: bookings.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get all users for management
// @route GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Update user role
// @route PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Delete any equipment (Moderation)
// @route DELETE /api/admin/equipment/:id
exports.deleteEquipment = async (req, res) => {
  try {
    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment removed by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Delete any service (Moderation)
// @route DELETE /api/admin/services/:id
exports.deleteService = async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service removed by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Delete any user (Owner, Farmer, etc)
// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userEmail = user.email;
    await User.findByIdAndDelete(req.params.id);

    // Also clean up their listings if they are an owner/provider
    if (user.role === 'owner') {
      await Equipment.deleteMany({ owner: user._id });
    } else if (user.role === 'service_provider') {
      await Service.deleteMany({ provider: user._id });
    }

    // Send email notification
    await sendDeletionNotification(userEmail);

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
