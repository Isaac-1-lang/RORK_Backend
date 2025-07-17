const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

router.post('/check-in', auth, requireRole('worker'), attendanceController.checkIn);
router.post('/check-out', auth, requireRole('worker'), attendanceController.checkOut);
router.get('/history', auth, requireRole('worker', 'hr', 'admin'), attendanceController.getHistory);
// Attendance stats (late today, present, etc.)
router.get('/stats', auth, requireRole('hr', 'admin'), attendanceController.getStats);

module.exports = router; 