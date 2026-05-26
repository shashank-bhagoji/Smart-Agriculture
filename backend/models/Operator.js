const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  ratePerDay: { type: Number, required: true },
  servicesOffered: [{ type: String }], // e.g., ['plowing','harvesting']
  isAvailable: { type: Boolean, default: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional link to a user account
});

module.exports = mongoose.model('Operator', operatorSchema);
