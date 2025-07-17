const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

// Worker submits a leave request
router.post('/submit', auth, requireRole('worker'), leaveRequestController.submitLeaveRequest);
// List leave requests (worker: own, HR/admin: all)
router.get('/list', auth, requireRole('worker', 'hr', 'admin'), leaveRequestController.listLeaveRequests);
// HR updates leave request status
router.patch('/update-status/:requestId', auth, requireRole('hr'), leaveRequestController.updateLeaveRequestStatus);

module.exports = router; 