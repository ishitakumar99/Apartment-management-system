const router = require('express').Router();
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

// Admin sees everyone; maintenance/security can't list users. Admin can filter by role.
router.get('/', allow('admin'), async (req, res, next) => {
  try {
    const filter = req.query.role ? { role: req.query.role } : {};
    res.json(await User.find(filter).sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

router.post('/', allow('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role, unit, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, unit, phone });
    res.status(201).json(await User.findById(user._id));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', allow('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    ['name', 'email', 'role', 'unit', 'phone'].forEach((k) => {
      if (req.body[k] !== undefined) user[k] = req.body[k];
    });
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json(await User.findById(user._id));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', allow('admin'), async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) return res.status(400).json({ message: "You can't delete yourself" });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
