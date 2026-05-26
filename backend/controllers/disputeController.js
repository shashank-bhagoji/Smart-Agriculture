const Dispute = require('../models/Dispute');
const { createNotification } = require('./notificationController');

// @desc  Raise a new dispute
// @route POST /api/disputes
exports.raiseDispute = async (req, res) => {
  try {
    const { booking, reason, description, evidence } = req.body;
    const dispute = await Dispute.create({
      booking,
      raisedBy: req.user.id,
      reason,
      description,
      evidence
    });

    // Notify admin (if admin email is in env or just general alert)
    // For now, just a confirmation notification to the user
    await createNotification(
      req.user.id,
      `Your dispute regarding booking ${booking} has been submitted. Status: Pending.`,
      'alert'
    );

    res.status(201).json(dispute);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get disputes (User gets their own, Admin gets all)
// @route GET /api/disputes
exports.getDisputes = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.raisedBy = req.user.id;
    }
    const disputes = await Dispute.find(query)
      .populate('booking')
      .populate('raisedBy', 'name email');
    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Resolve a dispute (Admin only)
// @route PATCH /api/disputes/:id/resolve
exports.resolveDispute = async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    dispute.status = status;
    dispute.resolution = resolution;
    await dispute.save();

    // Notify the person who raised it
    await createNotification(
      dispute.raisedBy,
      `Your dispute has been ${status}. Resolution: ${resolution}`,
      'alert'
    );

    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
