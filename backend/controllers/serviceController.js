const Service = require('../models/Service');

// @desc Get all services (public)
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('provider', 'name email');
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get a single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name email');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Create a new service (admin or service_provider)
exports.createService = async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, provider: req.user.id });
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update a service (owner/provider only)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate({ _id: req.params.id, provider: req.user.id }, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found or not owned by you' });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Delete a service (owner/provider only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({ _id: req.params.id, provider: req.user.id });
    if (!service) return res.status(404).json({ message: 'Service not found or not owned by you' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};