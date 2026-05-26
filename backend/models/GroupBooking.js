const mongoose = require('mongoose');

const groupBookingSchema = new mongoose.Schema({
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['forming', 'booked', 'completed', 'cancelled'], 
    default: 'forming' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GroupBooking', groupBookingSchema);
