const User = require('../models/User');
const { sendMail } = require('../utils/mailer');

exports.addWorker = async (req, res) => {
  if (!req.user || req.user.role !== 'hr') {
    return res.status(403).json({ message: 'Only HRs can add workers.' });
  }
  const {
    name,
    email,
    password,
    phoneNumber,
    department,
    position,
    shiftStartTime,
    geoLocation,
    fingerprintCaptured
  } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    // Generate a random password if not provided
    const workerPassword = password || Math.random().toString(36).slice(-8);
    user = new User({
      name,
      email,
      password: workerPassword,
      role: 'worker',
      phoneNumber,
      department,
      position,
      shiftStartTime,
      geoLocation,
      fingerprintCaptured: !!fingerprintCaptured,
      createdBy: req.user.userId
    });
    await user.save();
    // Send credentials via mock email
    await sendMail({
      to: email,
      subject: 'Your Worker Account Credentials',
      text: `Hello ${name},\n\nYou have been registered as a worker.\n\nLogin credentials:\nEmail: ${email}\nPassword: ${workerPassword}\n\nPlease log in and change your password after first login.`,
    });
    res.status(201).json({ message: 'Worker added successfully and credentials sent via email', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// List workers by HR or department
exports.listWorkersByHROrDepartment = async (req, res) => {
  // Aggressive cache prevention
  res.removeHeader && res.removeHeader('ETag');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  const { hrId, department } = req.query;
  let query = { role: 'worker' };
  if (hrId) query.createdBy = hrId;
  if (department) query.department = department;
  try {
    const workers = await User.find(query);
    res.status(200).json({ workers });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 