const router = require('express').Router();
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { active: true };
    res.json(await Facility.find(filter).sort({ createdAt: 1 }));
  } catch (e) {
    next(e);
  }
});

router.post('/', allow('admin'), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (await Facility.findOne({ name })) return res.status(409).json({ message: 'Facility already exists' });
    res.status(201).json(await Facility.create(req.body));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', allow('admin'), async (req, res, next) => {
  try {
    const f = await Facility.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Facility not found' });
    ['name', 'icon', 'description', 'openTime', 'closeTime', 'slotMinutes', 'active'].forEach((k) => {
      if (req.body[k] !== undefined) f[k] = req.body[k];
    });
    await f.save();
    res.json(f);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', allow('admin'), async (req, res, next) => {
  try {
    await Facility.findByIdAndDelete(req.params.id);
    await Booking.deleteMany({ facility: req.params.id });
    res.json({ message: 'Facility deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
