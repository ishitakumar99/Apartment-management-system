const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: String, default: '' },
    month: { type: String, required: true }, // e.g. "2026-11"
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

billSchema.index({ resident: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Bill', billSchema);
