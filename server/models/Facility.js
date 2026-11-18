const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    icon: { type: String, default: '🏟' },
    description: { type: String, default: '' },
    openTime: { type: String, default: '06:00' }, // HH:MM, 24h
    closeTime: { type: String, default: '22:00' },
    slotMinutes: { type: Number, default: 60, min: 15 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facility', facilitySchema);
