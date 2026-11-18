const router = require('express').Router();
const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const { protect, allow } = require('../middleware/auth');
const { buildSlots } = require('../utils/slots');

router.use(protect);

const slotStart = (date, time) => new Date(`${date}T${time}:00`); // server local time
const validDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || '');

// Slots for one facility on one day, each marked booked / past.
router.get('/availability', async (req, res, next) => {
  try {
    const { facility, date } = req.query;
    if (!facility || !validDate(date)) return res.status(400).json({ message: 'facility and date (YYYY-MM-DD) are required' });
    const f = await Facility.findById(facility);
    if (!f) return res.status(404).json({ message: 'Facility not found' });
    const booked = await Booking.find({ facility, date, status: 'booked' });
    const bookedMap = new Map(booked.map((b) => [b.startTime, String(b.resident)]));
    const now = new Date();
    const slots = buildSlots(f).map((s) => ({
      ...s,
      booked: bookedMap.has(s.start),
      mine: bookedMap.get(s.start) === String(req.user._id),
      past: slotStart(date, s.start) < now,
    }));
    res.json({ facility: f, date, slots });
  } catch (e) {
    next(e);
  }
});

// Residents see their own bookings; admin sees all.
router.get('/', allow('admin', 'resident'), async (req, res, next) => {
  try {
    const filter = req.user.role === 'resident' ? { resident: req.user._id } : {};
    res.json(
      await Booking.find(filter)
        .sort({ date: -1, startTime: -1 })
        .limit(200)
        .populate('facility', 'name icon')
        .populate('resident', 'name unit')
    );
  } catch (e) {
    next(e);
  }
});

router.post('/', allow('resident'), async (req, res, next) => {
  try {
    const { facility, date, startTime } = req.body;
    if (!facility || !validDate(date) || !startTime) return res.status(400).json({ message: 'facility, date and startTime are required' });
    const f = await Facility.findById(facility);
    if (!f || !f.active) return res.status(404).json({ message: 'Facility not available' });
    const slot = buildSlots(f).find((s) => s.start === startTime);
    if (!slot) return res.status(400).json({ message: 'Invalid time slot' });
    if (slotStart(date, slot.start) < new Date()) return res.status(400).json({ message: 'That slot is in the past' });

    const b = await Booking.create({ facility, resident: req.user._id, date, startTime: slot.start, endTime: slot.end });
    res.status(201).json(await b.populate('facility', 'name icon'));
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'That slot was just booked by someone else' });
    next(e);
  }
});

router.delete('/:id', allow('admin', 'resident'), async (req, res, next) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role === 'resident' && String(b.resident) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    b.status = 'cancelled';
    await b.save();
    res.json({ message: 'Booking cancelled' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
