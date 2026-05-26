const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { 
    type: String, 
    required: true,
    enum: ['Damage', 'Late Return', 'Incorrect Specifications', 'Non-payment', 'Other']
  },
  description: { type: String, required: true },
  evidence: { type: String }, // URL or text description
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  resolution: { type: String }, // Admin notes on resolution
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dispute', disputeSchema);
