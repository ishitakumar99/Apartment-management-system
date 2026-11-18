const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:MM
    endTime: { type: String, required: true },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
  },
  { timestamps: true }
);

// Two active bookings can't share the same facility + date + slot.
bookingSchema.index(
  { facility: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: 'booked' } }
);

module.exports = mongoose.model('Booking', bookingSchema);
