const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // equipment owner
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
