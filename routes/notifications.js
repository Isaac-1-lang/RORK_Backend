const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

// Send notification (HR/admin)
router.post('/send', auth, requireRole('hr', 'admin'), notificationController.sendNotification);
// List notifications (user)
router.get('/list', auth, notificationController.listNotifications);
// Mark as read (user)
router.patch('/mark-as-read/:notificationId', auth, notificationController.markAsRead);
// Mark all as read (user)
router.patch('/mark-all-as-read', auth, notificationController.markAllAsRead);

module.exports = router; 