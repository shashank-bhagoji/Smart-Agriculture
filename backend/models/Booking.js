const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment" },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  operator: { type: mongoose.Schema.Types.ObjectId, ref: "Operator" },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startDate: Date,
  endDate: Date,
  status: { type: String, default: "pending" },
});

module.exports = mongoose.model("Booking", bookingSchema);