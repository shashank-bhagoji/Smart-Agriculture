const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: String,
  description: String,
  pricePerDay: Number,
  image: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  availability: [{ date: Date, isBooked: Boolean }],
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Equipment", equipmentSchema);