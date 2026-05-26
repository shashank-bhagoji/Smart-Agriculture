const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String }, // e.g., 'land preparation', 'harvesting', 'soil testing'
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Service', serviceSchema);