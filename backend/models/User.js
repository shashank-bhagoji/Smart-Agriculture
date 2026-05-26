const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["farmer", "owner", "service_provider", "admin"],
    default: "farmer",
  },
  // optional profile fields
  phone: { type: String },
  location: {
    name: { type: String },
    lat: { type: Number },
    lon: { type: Number }
  },
  serviceType: { type: String }, // e.g., "Harvesting", "Crop Spraying"
  services: [{ type: String }], // e.g., ["land preparation","harvesting"]
  favoriteEquipment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Equipment" }],
  favoriteServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  isApproved: { type: Boolean, default: true }, // Default true for farmers/providers, false for owners
  googleRefreshToken: { type: String },
});

module.exports = mongoose.model("User", userSchema);