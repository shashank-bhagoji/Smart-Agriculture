const Transport = require('../models/Transport');

// @desc Create a transport request (farmer)
// @route POST /api/transport
exports.createTransport = async (req, res) => {
  try {
    const transport = await Transport.create({ ...req.body, requester: req.user.id });
    res.status(201).json(transport);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get transport requests made by the logged‑in user
// @route GET /api/transport
exports.getMyTransports = async (req, res) => {
  try {
    const transports = await Transport.find({ requester: req.user.id }).populate('equipment');
    res.json(transports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
