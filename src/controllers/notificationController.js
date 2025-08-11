const notificationService = require('../services/notificationService');

exports.getNotifications = async (req, res) => {
  try {

    const { limit, offset, unreadOnly } = req.query;
    const notifications = await notificationService.getUserNotifications(req.user.sub, {
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0,
      unreadOnly: unreadOnly === 'true',
    });
    
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updated = await notificationService.markNotificationAsRead(notificationId, req.user.sub);
    res.json({ message: 'Notification marked as read', notification: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllNotificationsAsRead(req.user.sub);
    res.json({ message: 'All notifications marked as read', count: result.count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

