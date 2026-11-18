const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, unit: u.unit, phone: u.phone });

// Public signup always creates a resident. Other roles are created by an admin.
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, unit, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, unit, phone, role: 'resident' });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
