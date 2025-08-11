const notificationRepository = require('../repositories/notificationRepository');

const notifyBidAssignment = async ({ projectId, acceptedBidId, rejectedBidIds }) => {
  try {
    const project = await notificationRepository.getProjectWithBids(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (acceptedBidId) {
      const acceptedBid = project.bids.find(bid => bid.id === acceptedBidId);
      if (acceptedBid) {
        await notificationRepository.createNotification({
          userId: acceptedBid.contractorId,
          type: 'BID_ACCEPTED',
          title: 'Bid Accepted',
          message: `Your bid for project "${project.title}" has been accepted!`,
          projectId,
          bidId: acceptedBidId,
        });
      }
    }

    for (const bidId of rejectedBidIds) {
      const rejectedBid = project.bids.find(bid => bid.id === bidId);
      if (rejectedBid) {
        await notificationRepository.createNotification({
          userId: rejectedBid.contractorId,
          type: 'BID_REJECTED',
          title: 'Bid Not Selected',
          message: `Your bid for project "${project.title}" was not selected.`,
          projectId,
          bidId,
        });
      }
    }

    await notificationRepository.createNotification({
      userId: project.ownerId,
      type: 'PROJECT_ASSIGNED',
      title: 'Project Assigned',
      message: `Your project "${project.title}" has been assigned to a contractor.`,
      projectId,
    });

  } catch (error) {
    throw error;
  }
};

const notifyProjectStatusChange = async ({ projectId, newStatus, userId }) => {
  try {
    const project = await notificationRepository.getProjectById(projectId);
    if (!project) return;

    const statusMessages = {
      'OPEN_FOR_BIDS': 'Your project is now open for contractor bids.',
      'ACTIVE': 'Your project is now active and work has begun.',
      'COMPLETED': 'Your project has been marked as completed.',
      'CANCELLED': 'Your project has been cancelled.',
    };

    const message = statusMessages[newStatus];
    if (message) {
      await notificationRepository.createNotification({
        userId,
        type: 'PROJECT_STATUS_CHANGED',
        title: `Project ${newStatus.toLowerCase().replace(/_/g, ' ')}`,
        message,
        projectId,
      });
    }
  } catch (error) {
    throw error;
  }
};

const getUserNotifications = async (userId, { limit = 20, offset = 0, unreadOnly = false } = {}) => {
  try {
    return await notificationRepository.getUserNotifications(userId, { limit, offset, unreadOnly });
  } catch (error) {
    throw new Error('Failed to get notifications');
  }
};

const markNotificationAsRead = async (notificationId, userId) => {
  try {
    return await notificationRepository.markAsRead(notificationId, userId);
  } catch (error) {
    throw new Error('Failed to mark notification as read');
  }
};

const markAllNotificationsAsRead = async (userId) => {
  try {
    return await notificationRepository.markAllAsRead(userId);
  } catch (error) {
    throw new Error('Failed to mark all notifications as read');
  }
};

module.exports = {
  notifyBidAssignment,
  notifyProjectStatusChange,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};