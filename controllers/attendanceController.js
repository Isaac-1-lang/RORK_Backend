const Attendance = require('../models/Attendance');
const CompanyLocation = require('../models/CompanyLocation');

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat)/2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon))/2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// Worker/HR checks in
exports.checkIn = async (req, res) => {
  const userId = req.user.userId;
  const { location } = req.body;
  const today = new Date();
  today.setHours(0,0,0,0);
  try {
    // Enforce location radius
    const companyLoc = await CompanyLocation.findOne().sort({ updatedAt: -1 });
    if (!companyLoc) {
      return res.status(400).json({ message: 'Company location not set.' });
    }
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Current location required.' });
    }
    const dist = getDistanceFromLatLonInMeters(
      companyLoc.latitude,
      companyLoc.longitude,
      location.latitude,
      location.longitude
    );
    if (dist > 50) {
      return res.status(403).json({ message: 'You must be within 50 meters of the company location to clock in.' });
    }
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

// Worker/HR checks out
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
    // Enforce location radius for check-out as well
    const companyLoc = await CompanyLocation.findOne().sort({ updatedAt: -1 });
    if (!companyLoc) {
      return res.status(400).json({ message: 'Company location not set.' });
    }
    const { location } = req.body;
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Current location required.' });
    }
    const dist = getDistanceFromLatLonInMeters(
      companyLoc.latitude,
      companyLoc.longitude,
      location.latitude,
      location.longitude
    );
    if (dist > 50) {
      return res.status(403).json({ message: 'You must be within 50 meters of the company location to clock out.' });
    }
    const checkInTime = record.checkIn;
    const checkOutTime = new Date();
    const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60); // ms to hours
    record.checkOut = checkOutTime;
    record.totalHours = hoursWorked;
    await record.save();
    res.status(200).json({ message: 'Checked out successfully', attendance: record, totalHours: hoursWorked });
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