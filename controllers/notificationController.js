const Notification = require('../models/Notification');

// Send notification (HR/admin)
exports.sendNotification = async (req, res) => {
  const { userId, title, message } = req.body;
  try {
    const notification = new Notification({ user: userId, title, message });
    await notification.save();
    res.status(201).json({ message: 'Notification sent', notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// List notifications (user)
exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await Notification.findOne({ _id: notificationId, user: req.user.userId });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    notification.read = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.userId, read: false }, { $set: { read: true } });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 