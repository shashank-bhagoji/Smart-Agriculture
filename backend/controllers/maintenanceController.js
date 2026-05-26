const Maintenance = require('../models/Maintenance');

// @desc  Create a maintenance request (owner only)
// @route POST /api/maintenance
exports.createRequest = async (req, res) => {
  try {
    const request = await Maintenance.create({ ...req.body, owner: req.user.id });
    res.status(201).json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Get maintenance requests for the logged-in owner
// @route GET /api/maintenance
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({ owner: req.user.id }).populate('equipment');
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Update status of a maintenance request (owner or admin)
// @route PATCH /api/maintenance/:id
exports.updateStatus = async (req, res) => {
  try {
    const request = await Maintenance.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { status: req.body.status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found or not yours' });
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
