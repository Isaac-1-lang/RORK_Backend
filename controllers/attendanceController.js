const Attendance = require('../models/Attendance');

// Worker checks in
exports.checkIn = async (req, res) => {
  const userId = req.user.userId;
  const { location } = req.body;
  const today = new Date();
  today.setHours(0,0,0,0);
  try {
    // Prevent double check-in
    let record = await Attendance.findOne({ worker: userId, date: today });
    if (record && record.checkIn) {
      return res.status(400).json({ message: 'Already checked in today.' });
    }
    if (!record) {
      record = new Attendance({ worker: userId, date: today });
    }
    record.checkIn = new Date();
    record.location = location;
    await record.save();
    res.status(200).json({ message: 'Checked in successfully', attendance: record });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Worker checks out
exports.checkOut = async (req, res) => {
  const userId = req.user.userId;
  const today = new Date();
  today.setHours(0,0,0,0);
  try {
    let record = await Attendance.findOne({ worker: userId, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'Check-in required before check-out.' });
    }
    if (record.checkOut) {
      return res.status(400).json({ message: 'Already checked out today.' });
    }
    record.checkOut = new Date();
    await record.save();
    res.status(200).json({ message: 'Checked out successfully', attendance: record });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance history (worker or HR)
exports.getHistory = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;
  let query = {};
  if (role === 'worker') {
    query.worker = userId;
  } else if (role === 'hr' || role === 'admin') {
    if (req.query.workerId) {
      query.worker = req.query.workerId;
    }
  }
  try {
    const records = await Attendance.find(query).populate('worker', 'name email');
    res.status(200).json({ attendance: records });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance stats (late today, present, absent, etc.)
exports.getStats = async (req, res) => {
  const { department } = req.query;
  const today = new Date();
  today.setHours(0,0,0,0);
  let userQuery = {};
  if (department) userQuery = { department, role: 'worker' };
  try {
    let workers = [];
    if (department) {
      const User = require('../models/User');
      workers = await User.find(userQuery).select('_id');
    }
    let attendanceQuery = { date: today };
    if (workers.length > 0) {
      attendanceQuery.worker = { $in: workers.map(w => w._id) };
    }
    const records = await Attendance.find(attendanceQuery);
    const stats = {
      late: records.filter(r => r.status === 'late').length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      on_leave: records.filter(r => r.status === 'on_leave').length,
      total: records.length
    };
    res.status(200).json({ stats });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 