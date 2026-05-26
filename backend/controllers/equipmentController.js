const Equipment = require("../models/Equipment");

// Add equipment (owner only)
exports.addEquipment = async (req, res) => {
  const equipmentData = { ...req.body, owner: req.user.id };
  const equipment = await Equipment.create(equipmentData);
  res.json(equipment);
};

// Get equipment owned by logged-in owner
exports.getOwnerEquipment = async (req, res) => {
  const data = await Equipment.find({ owner: req.user.id }).populate("owner");
  res.json(data);
};

// Get all equipment with optional filters
exports.getAllEquipment = async (req, res) => {
  const { name, minPrice, maxPrice, availableDate } = req.query;
  let filter = {};
  if (name) filter.name = { $regex: name, $options: "i" };
  if (minPrice) filter.pricePerDay = { ...filter.pricePerDay, $gte: Number(minPrice) };
  if (maxPrice) filter.pricePerDay = { ...filter.pricePerDay, $lte: Number(maxPrice) };
  // Placeholder for availability filtering – will be enhanced later
  const data = await Equipment.find(filter).populate("owner");
  res.json(data);
};

// Get equipment by ID (public)
exports.getEquipmentById = async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const equipment = await Equipment.findById(req.params.id).populate("owner");
  if (!equipment) return res.status(404).json({ message: "Equipment not found" });
  res.json(equipment);
};

// Update equipment (owner only)
exports.updateEquipment = async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const equipment = await Equipment.findOne({ _id: req.params.id, owner: req.user.id });
  if (!equipment) return res.status(404).json({ message: "Equipment not found or not owned by you" });
  Object.assign(equipment, req.body);
  await equipment.save();
  res.json(equipment);
};

// Delete equipment (owner only)
exports.deleteEquipment = async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const equipment = await Equipment.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!equipment) return res.status(404).json({ message: "Equipment not found or not owned by you" });
  res.json({ message: "Equipment deleted" });
};

// Get equipment availability – returns booked date ranges
exports.getEquipmentAvailability = async (req, res) => {
  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) return res.status(404).json({ message: "Equipment not found" });
  const Booking = require("../models/Booking");
  const bookings = await Booking.find({ equipment: equipment._id });
  const bookedRanges = bookings.map(b => ({ startDate: b.startDate, endDate: b.endDate, status: b.status }));
  res.json(bookedRanges);
};