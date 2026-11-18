const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    purpose: { type: String, default: 'Visit' },
    unit: { type: String, required: true, trim: true },
    type: { type: String, enum: ['guest', 'delivery', 'service'], default: 'guest' },
    status: { type: String, enum: ['expected', 'inside', 'exited'], default: 'inside' },
    entryTime: { type: Date, default: null },
    exitTime: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visitor', visitorSchema);
