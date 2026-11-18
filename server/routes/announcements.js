const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    res.json(await Announcement.find().sort({ createdAt: -1 }).populate('author', 'name'));
  } catch (e) {
    next(e);
  }
});

router.post('/', allow('admin'), async (req, res, next) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });
    const a = await Announcement.create({ title, message, author: req.user._id });
    res.status(201).json(await a.populate('author', 'name'));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', allow('admin'), async (req, res, next) => {
  try {
    const a = await Announcement.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Announcement not found' });
    if (req.body.title !== undefined) a.title = req.body.title;
    if (req.body.message !== undefined) a.message = req.body.message;
    await a.save();
    res.json(await a.populate('author', 'name'));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', allow('admin'), async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
