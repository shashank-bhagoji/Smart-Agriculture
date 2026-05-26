const Notification = require('../models/Notification');

// @desc  Get all notifications for the logged-in user
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Mark a notification as read
// @route PATCH /api/notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const note = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Notification not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Mark ALL notifications as read
// @route PATCH /api/notifications/read-all
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Delete ALL notifications for the logged-in user
// @route DELETE /api/notifications
exports.clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper: create a notification for a user (called internally from other controllers)
exports.createNotification = async (userId, message, type = 'general') => {
  try {
    await Notification.create({ user: userId, message, type });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};
