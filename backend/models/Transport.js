const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending','accepted','rejected'], default: 'pending' },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // farmer who requests
});

module.exports = mongoose.model('Transport', transportSchema);
