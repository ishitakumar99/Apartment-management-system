const router = require('express').Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Visitor = require('../models/Visitor');
const Bill = require('../models/Bill');
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');

router.use(protect);

// Returns a role-appropriate summary for the dashboard.
router.get('/', async (req, res, next) => {
  try {
    const { role, _id, unit } = req.user;

    if (role === 'admin') {
      const [residents, openComplaints, resolved, inside, pendingBills, collected, announcements] = await Promise.all([
        User.countDocuments({ role: 'resident' }),
        Complaint.countDocuments({ status: { $ne: 'resolved' } }),
        Complaint.countDocuments({ status: 'resolved' }),
        Visitor.countDocuments({ status: 'inside' }),
        Bill.countDocuments({ status: 'pending' }),
        Bill.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Announcement.countDocuments(),
      ]);
      return res.json({ residents, openComplaints, resolved, visitorsInside: inside, pendingBills, collected: collected[0]?.total || 0, announcements });
    }

    if (role === 'resident') {
      const [open, resolved, pending, expected] = await Promise.all([
        Complaint.countDocuments({ resident: _id, status: { $ne: 'resolved' } }),
        Complaint.countDocuments({ resident: _id, status: 'resolved' }),
        Bill.countDocuments({ resident: _id, status: 'pending' }),
        Visitor.countDocuments({ unit, status: { $in: ['expected', 'inside'] } }),
      ]);
      return res.json({ openComplaints: open, resolved, pendingBills: pending, activeVisitors: expected });
    }

    if (role === 'security') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const [inside, today, expected] = await Promise.all([
        Visitor.countDocuments({ status: 'inside' }),
        Visitor.countDocuments({ createdAt: { $gte: startOfDay } }),
        Visitor.countDocuments({ status: 'expected' }),
      ]);
      return res.json({ visitorsInside: inside, visitorsToday: today, expectedVisitors: expected });
    }

    // maintenance
    const [assigned, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments({ assignedTo: _id, status: 'assigned' }),
      Complaint.countDocuments({ assignedTo: _id, status: 'in-progress' }),
      Complaint.countDocuments({ assignedTo: _id, status: 'resolved' }),
    ]);
    res.json({ assigned, inProgress, resolved });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
