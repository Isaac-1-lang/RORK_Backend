const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'on_leave'],
    default: 'present',
  },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema); 