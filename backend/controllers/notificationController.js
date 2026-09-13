const mockStore = require('../utils/mockStore');

// @desc    Get user notifications
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifs = mockStore.getNotifications(req.user._id);
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const idx = mockStore.notifications.findIndex(n => n._id === id);
    if (idx !== -1) {
      mockStore.notifications[idx].isRead = true;
    }
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    mockStore.notifications.forEach(n => { n.isRead = true; });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
