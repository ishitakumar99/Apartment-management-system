const router = require('express').Router();
const Complaint = require('../models/Complaint');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

const populate = (q) => q.populate('resident', 'name unit').populate('assignedTo', 'name');

router.get('/', async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let filter = {};
    if (role === 'resident') filter = { resident: _id };
    else if (role === 'maintenance') filter = { assignedTo: _id };
    else if (role === 'security') return res.json([]);
    res.json(await populate(Complaint.find(filter).sort({ createdAt: -1 })));
  } catch (e) {
    next(e);
  }
});

router.post('/', allow('resident', 'admin'), async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });
    const c = await Complaint.create({ title, description, category, resident: req.user._id });
    res.status(201).json(await populate(Complaint.findById(c._id)));
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const c = await Complaint.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Complaint not found' });
    const { role, _id } = req.user;

    if (role === 'admin') {
      if (req.body.assignedTo !== undefined) {
        c.assignedTo = req.body.assignedTo || null;
        if (c.assignedTo && c.status === 'open') c.status = 'assigned';
      }
      if (req.body.status) c.status = req.body.status;
    } else if (role === 'maintenance') {
      if (String(c.assignedTo) !== String(_id)) return res.status(403).json({ message: 'Not assigned to you' });
      if (!['in-progress', 'resolved'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
      c.status = req.body.status;
    } else if (role === 'resident') {
      if (String(c.resident) !== String(_id) || c.status !== 'open') return res.status(403).json({ message: 'Only your open complaints can be edited' });
      ['title', 'description', 'category'].forEach((k) => req.body[k] !== undefined && (c[k] = req.body[k]));
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await c.save();
    res.json(await populate(Complaint.findById(c._id)));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const c = await Complaint.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Complaint not found' });
    const isOwner = String(c.resident) === String(req.user._id);
    if (req.user.role !== 'admin' && !(isOwner && c.status === 'open')) return res.status(403).json({ message: 'Forbidden' });
    await c.deleteOne();
    res.json({ message: 'Complaint deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
