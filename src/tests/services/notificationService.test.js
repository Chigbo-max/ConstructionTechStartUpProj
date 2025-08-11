const notificationService = require('../../services/notificationService');
const notificationRepository = require('../../repositories/notificationRepository');

jest.mock('../../repositories/notificationRepository');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('notifyBidAssignment', () => {
    const mockProject = {
      id: 'project-1',
      title: 'Kitchen Renovation',
      ownerId: 'homeowner-1',
      bids: [
        { id: 'bid-1', contractorId: 'contractor-1' },
        { id: 'bid-2', contractorId: 'contractor-2' }
      ]
    };

    const assignmentData = {
      projectId: 'project-1',
      acceptedBidId: 'bid-1',
      rejectedBidIds: ['bid-2']
    };

    test('should create notifications for bid assignment successfully', async () => {
      notificationRepository.getProjectWithBids.mockResolvedValue(mockProject);
      notificationRepository.createNotification.mockResolvedValue({ id: 'notification-1' });

      await notificationService.notifyBidAssignment(assignmentData);

      expect(notificationRepository.getProjectWithBids).toHaveBeenCalledWith('project-1');
      expect(notificationRepository.createNotification).toHaveBeenCalledTimes(3);
      
      expect(notificationRepository.createNotification).toHaveBeenCalledWith({
        userId: 'contractor-1',
        type: 'BID_ACCEPTED',
        title: 'Bid Accepted',
        message: 'Your bid for project "Kitchen Renovation" has been accepted!',
        projectId: 'project-1',
        bidId: 'bid-1'
      });

      expect(notificationRepository.createNotification).toHaveBeenCalledWith({
        userId: 'contractor-2',
        type: 'BID_REJECTED',
        title: 'Bid Not Selected',
        message: 'Your bid for project "Kitchen Renovation" was not selected.',
        projectId: 'project-1',
        bidId: 'bid-2'
      });

      expect(notificationRepository.createNotification).toHaveBeenCalledWith({
        userId: 'homeowner-1',
        type: 'PROJECT_ASSIGNED',
        title: 'Project Assigned',
        message: 'Your project "Kitchen Renovation" has been assigned to a contractor.',
        projectId: 'project-1'
      });
    });

    test('should handle case when project not found gracefully', async () => {
      notificationRepository.getProjectWithBids.mockResolvedValue(null);
      await expect(notificationService.notifyBidAssignment(assignmentData)).rejects.toThrow('Project not found');
    });

    test('should handle case when accepted bid not found', async () => {
      const projectWithoutAcceptedBid = {
        ...mockProject,
        bids: [{ id: 'bid-2', contractorId: 'contractor-2' }]
      };
      notificationRepository.getProjectWithBids.mockResolvedValue(projectWithoutAcceptedBid);
      notificationRepository.createNotification.mockResolvedValue({ id: 'notification-1' });

      await notificationService.notifyBidAssignment(assignmentData);

      expect(notificationRepository.createNotification).toHaveBeenCalledTimes(2);
    });

    test('should handle case when no rejected bids', async () => {
      const assignmentDataNoRejected = {
        projectId: 'project-1',
        acceptedBidId: 'bid-1',
        rejectedBidIds: []
      };

      notificationRepository.getProjectWithBids.mockResolvedValue(mockProject);
      notificationRepository.createNotification.mockResolvedValue({ id: 'notification-1' });

      await notificationService.notifyBidAssignment(assignmentDataNoRejected);

      expect(notificationRepository.createNotification).toHaveBeenCalledTimes(2);
    });
  });

  describe('notifyProjectStatusChange', () => {
    const mockProject = {
      id: 'project-1',
      title: 'Kitchen Renovation'
    };

    test('should create notification for OPEN_FOR_BIDS status', async () => {
      notificationRepository.getProjectById.mockResolvedValue(mockProject);
      notificationRepository.createNotification.mockResolvedValue({ id: 'notification-1' });

      await notificationService.notifyProjectStatusChange({
        projectId: 'project-1',
        newStatus: 'OPEN_FOR_BIDS',
        userId: 'homeowner-1'
      });

      expect(notificationRepository.createNotification).toHaveBeenCalledWith({
        userId: 'homeowner-1',
        type: 'PROJECT_STATUS_CHANGED',
        title: 'Project open for bids',
        message: 'Your project is now open for contractor bids.',
        projectId: 'project-1'
      });
    });

    test('should create notification for ACTIVE status', async () => {
      notificationRepository.getProjectById.mockResolvedValue(mockProject);
      notificationRepository.createNotification.mockResolvedValue({ id: 'notification-1' });

      await notificationService.notifyProjectStatusChange({
        projectId: 'project-1',
        newStatus: 'ACTIVE',
        userId: 'homeowner-1'
      });

      expect(notificationRepository.createNotification).toHaveBeenCalledWith({
        userId: 'homeowner-1',
        type: 'PROJECT_STATUS_CHANGED',
        title: 'Project active',
        message: 'Your project is now active and work has begun.',
        projectId: 'project-1'
      });
    });

    test('should create notification for COMPLETED status', async () => {
      notificationRepository.getProjectById.mockResolvedValue(mockProject);
      notificationRepository.createNotification.mockResolvedValue({ id: 'notification-1' });

      await notificationService.notifyProjectStatusChange({
        projectId: 'project-1',
        newStatus: 'COMPLETED',
        userId: 'homeowner-1'
      });

      expect(notificationRepository.createNotification).toHaveBeenCalledWith({
        userId: 'homeowner-1',
        type: 'PROJECT_STATUS_CHANGED',
        title: 'Project completed',
        message: 'Your project has been marked as completed.',
        projectId: 'project-1'
      });
    });

    test('should create notification for CANCELLED status', async () => {
      notificationRepository.getProjectById.mockResolvedValue(mockProject);
      notificationRepository.createNotification.mockResolvedValue({ id: 'notification-1' });

      await notificationService.notifyProjectStatusChange({
        projectId: 'project-1',
        newStatus: 'CANCELLED',
        userId: 'homeowner-1'
      });

      expect(notificationRepository.createNotification).toHaveBeenCalledWith({
        userId: 'homeowner-1',
        type: 'PROJECT_STATUS_CHANGED',
        title: 'Project cancelled',
        message: 'Your project has been cancelled.',
        projectId: 'project-1'
      });
    });

    test('should not create notification for unknown status', async () => {
      notificationRepository.getProjectById.mockResolvedValue(mockProject);

      await notificationService.notifyProjectStatusChange({
        projectId: 'project-1',
        newStatus: 'UNKNOWN_STATUS',
        userId: 'homeowner-1'
      });

      expect(notificationRepository.createNotification).not.toHaveBeenCalled();
    });

    test('should handle case when project not found gracefully', async () => {
      notificationRepository.getProjectById.mockResolvedValue(null);

      await expect(notificationService.notifyProjectStatusChange({
        projectId: 'project-1',
        newStatus: 'OPEN_FOR_BIDS',
        userId: 'homeowner-1'
      })).resolves.toBeUndefined();
    });
  });

  describe('getUserNotifications', () => {
    const mockNotifications = [
      { id: 'notification-1', title: 'Bid Accepted', read: false },
      { id: 'notification-2', title: 'Project Started', read: true }
    ];

    test('should get user notifications with default parameters', async () => {
      notificationRepository.getUserNotifications.mockResolvedValue(mockNotifications);

      const result = await notificationService.getUserNotifications('user-1');

      expect(notificationRepository.getUserNotifications).toHaveBeenCalledWith('user-1', {
        limit: 20,
        offset: 0,
        unreadOnly: false
      });
      expect(result).toEqual(mockNotifications);
    });

    test('should get user notifications with custom parameters', async () => {
      notificationRepository.getUserNotifications.mockResolvedValue(mockNotifications);

      const result = await notificationService.getUserNotifications('user-1', {
        limit: 10,
        offset: 5,
        unreadOnly: true
      });

      expect(notificationRepository.getUserNotifications).toHaveBeenCalledWith('user-1', {
        limit: 10,
        offset: 5,
        unreadOnly: true
      });
      expect(result).toEqual(mockNotifications);
    });

    test('should handle repository errors', async () => {
      notificationRepository.getUserNotifications.mockRejectedValue(new Error('Database error'));

      await expect(notificationService.getUserNotifications('user-1')).rejects.toThrow('Failed to get notifications');
    });
  });

  describe('markNotificationAsRead', () => {
    test('should mark notification as read successfully', async () => {
      const mockNotification = { id: 'notification-1', read: true };
      notificationRepository.markAsRead.mockResolvedValue(mockNotification);

      const result = await notificationService.markNotificationAsRead('notification-1', 'user-1');

      expect(notificationRepository.markAsRead).toHaveBeenCalledWith('notification-1', 'user-1');
      expect(result).toEqual(mockNotification);
    });

    test('should handle repository errors', async () => {
      notificationRepository.markAsRead.mockRejectedValue(new Error('Database error'));

      await expect(notificationService.markNotificationAsRead('notification-1', 'user-1')).rejects.toThrow('Failed to mark notification as read');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    test('should mark all notifications as read successfully', async () => {
      const mockResult = { updatedCount: 5 };
      notificationRepository.markAllAsRead.mockResolvedValue(mockResult);

      const result = await notificationService.markAllNotificationsAsRead('user-1');

      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockResult);
    });

    test('should handle repository errors', async () => {
      notificationRepository.markAllAsRead.mockRejectedValue(new Error('Database error'));

      await expect(notificationService.markAllNotificationsAsRead('user-1')).rejects.toThrow('Failed to mark all notifications as read');
    });
  });
});
