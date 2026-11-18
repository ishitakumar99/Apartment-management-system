const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'security', 'cleaning', 'lift', 'other'],
      default: 'other',
    },
    status: { type: String, enum: ['open', 'assigned', 'in-progress', 'resolved'], default: 'open' },
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
