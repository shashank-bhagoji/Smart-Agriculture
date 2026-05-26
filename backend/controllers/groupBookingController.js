const GroupBooking = require('../models/GroupBooking');
const { createNotification } = require('./notificationController');

// @desc  Start a new group booking
// @route POST /api/group-bookings
exports.createGroup = async (req, res) => {
  try {
    const { equipment, startDate, endDate, totalPrice } = req.body;
    const group = await GroupBooking.create({
      leader: req.user.id,
      members: [req.user.id],
      equipment,
      startDate,
      endDate,
      totalPrice
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Join an existing group
// @route PATCH /api/group-bookings/:id/join
exports.joinGroup = async (req, res) => {
  try {
    const group = await GroupBooking.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.status !== 'forming') return res.status(400).json({ message: 'Group is no longer accepting members' });
    
    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(req.user.id);
    await group.save();

    // Notify the leader
    await createNotification(
      group.leader,
      `A new farmer has joined your group booking for equipment.`,
      'general'
    );

    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get all group bookings
// @route GET /api/group-bookings
exports.getGroups = async (req, res) => {
  try {
    const groups = await GroupBooking.find()
      .populate('leader', 'name')
      .populate('equipment', 'name pricePerDay')
      .populate('members', 'name');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
