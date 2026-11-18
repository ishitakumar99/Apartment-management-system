const router = require('express').Router();
const Bill = require('../models/Bill');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', allow('admin', 'resident'), async (req, res, next) => {
  try {
    const filter = req.user.role === 'resident' ? { resident: req.user._id } : {};
    res.json(await Bill.find(filter).sort({ month: -1 }).populate('resident', 'name unit'));
  } catch (e) {
    next(e);
  }
});

// Admin generates a bill for one resident, or for ALL residents if no resident is given.
router.post('/', allow('admin'), async (req, res, next) => {
  try {
    const { resident, month, amount } = req.body;
    if (!month || amount === undefined) return res.status(400).json({ message: 'Month and amount are required' });
    const targets = resident ? await User.find({ _id: resident, role: 'resident' }) : await User.find({ role: 'resident' });
    if (!targets.length) return res.status(404).json({ message: 'No residents found' });
    let created = 0;
    for (const r of targets) {
      const exists = await Bill.findOne({ resident: r._id, month });
      if (exists) continue;
      await Bill.create({ resident: r._id, unit: r.unit, month, amount });
      created++;
    }
    res.status(201).json({ message: `${created} bill(s) created`, created });
  } catch (e) {
    next(e);
  }
});

// Mark paid (demo payment: no real gateway). Residents can pay their own; admin can mark any.
router.put('/:id/pay', allow('admin', 'resident'), async (req, res, next) => {
  try {
    const b = await Bill.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Bill not found' });
    if (req.user.role === 'resident' && String(b.resident) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    b.status = 'paid';
    b.paidAt = new Date();
    await b.save();
    res.json(await b.populate('resident', 'name unit'));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', allow('admin'), async (req, res, next) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
