const router = require('express').Router();
const Visitor = require('../models/Visitor');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', allow('admin', 'security', 'resident'), async (req, res, next) => {
  try {
    const filter = req.user.role === 'resident' ? { unit: req.user.unit } : {};
    res.json(await Visitor.find(filter).sort({ createdAt: -1 }).limit(200));
  } catch (e) {
    next(e);
  }
});

// Security/admin log an entry now. Residents pre-register an expected visitor for their own unit.
router.post('/', allow('admin', 'security', 'resident'), async (req, res, next) => {
  try {
    const { name, phone, purpose, unit, type } = req.body;
    if (!name) return res.status(400).json({ message: 'Visitor name is required' });
    const isResident = req.user.role === 'resident';
    const visitorUnit = isResident ? req.user.unit : unit;
    if (!visitorUnit) return res.status(400).json({ message: 'Unit is required' });
    const v = await Visitor.create({
      name, phone, purpose, type,
      unit: visitorUnit,
      status: isResident ? 'expected' : 'inside',
      entryTime: isResident ? null : new Date(),
      createdBy: req.user._id,
    });
    res.status(201).json(v);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/entry', allow('admin', 'security'), async (req, res, next) => {
  try {
    const v = await Visitor.findById(req.params.id);
    if (!v) return res.status(404).json({ message: 'Visitor not found' });
    v.status = 'inside';
    v.entryTime = new Date();
    await v.save();
    res.json(v);
  } catch (e) {
    next(e);
  }
});

router.put('/:id/exit', allow('admin', 'security'), async (req, res, next) => {
  try {
    const v = await Visitor.findById(req.params.id);
    if (!v) return res.status(404).json({ message: 'Visitor not found' });
    v.status = 'exited';
    v.exitTime = new Date();
    await v.save();
    res.json(v);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', allow('admin'), async (req, res, next) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Visitor record deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
