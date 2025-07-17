const LeaveRequest = require('../models/LeaveRequest');

// Worker submits a leave request
exports.submitLeaveRequest = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const user = req.user;
  try {
    const leaveRequest = new LeaveRequest({
      user: user.userId,
      userName: user.name,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending',
    });
    await leaveRequest.save();
    res.status(201).json({ message: 'Leave request submitted', leaveRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// List leave requests (worker: own, HR: all, admin: all)
exports.listLeaveRequests = async (req, res) => {
  const user = req.user;
  let query = {};
  if (user.role === 'worker') {
    query.user = user.userId;
  }
  try {
    const leaveRequests = await LeaveRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json({ leaveRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// HR approves/rejects a leave request
exports.updateLeaveRequestStatus = async (req, res) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: 'Only HR can update leave requests.' });
  }
  const { requestId } = req.params;
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const leaveRequest = await LeaveRequest.findById(requestId);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    leaveRequest.status = status;
    await leaveRequest.save();
    res.status(200).json({ message: 'Leave request updated', leaveRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 