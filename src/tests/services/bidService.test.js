const bidService = require('../../services/bidService');
const bidRepository = require('../../repositories/bidRepository');
const projectRepository = require('../../repositories/projectRepository');
const notificationService = require('../../services/notificationService');

jest.mock('../../repositories/bidRepository');
jest.mock('../../repositories/projectRepository');
jest.mock('../../services/notificationService');

describe('Bid Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBid', () => {
    const validBidData = {
      projectId: 'project-1',
      contractorId: 'contractor-1',
      amount: 9500,
      proposal: 'Quality work guaranteed with warranty',
      estimatedDuration: 45,
      estimatedStartDate: '2025-09-01',
      estimatedEndDate: '2025-09-25'
    };

    const mockProject = {
      id: 'project-1',
      status: 'OPEN_FOR_BIDS',
      bidsCloseAt: null
    };

    test('should create a bid successfully', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);
      bidRepository.findBidByProjectAndContractor.mockResolvedValue(null);
      bidRepository.createBid.mockResolvedValue({ id: 'bid-1', ...validBidData });

      const result = await bidService.createBid(validBidData);

      expect(projectRepository.findProjectById).toHaveBeenCalledWith('project-1');
      expect(bidRepository.findBidByProjectAndContractor).toHaveBeenCalledWith('project-1', 'contractor-1');
      expect(bidRepository.createBid).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'bid-1');
    });

    test('should reject bid when project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(bidService.createBid(validBidData)).rejects.toThrow('Project not found');
    });

    test('should reject bid when project status is not OPEN_FOR_BIDS', async () => {
      const draftProject = { ...mockProject, status: 'DRAFT' };
      projectRepository.findProjectById.mockResolvedValue(draftProject);

      await expect(bidService.createBid(validBidData)).rejects.toThrow('Project is not accepting bids');
    });

    test('should reject duplicate bid from same contractor', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);
      bidRepository.findBidByProjectAndContractor.mockResolvedValue({ id: 'existing-bid' });

      await expect(bidService.createBid(validBidData)).rejects.toThrow('You have already submitted a bid for this project');
    });
  });

  describe('assignBid', () => {
    const assignData = {
      projectId: 'project-1',
      bidId: 'bid-1',
      ownerId: 'homeowner-1'
    };

    const mockProject = {
      id: 'project-1',
      ownerId: 'homeowner-1',
      status: 'OPEN_FOR_BIDS'
    };

    const mockBid = {
      id: 'bid-1',
      projectId: 'project-1',
      contractorId: 'contractor-1',
      amount: 9500
    };

    test('should assign bid successfully', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);
      bidRepository.findBidById.mockResolvedValue(mockBid);
      bidRepository.findBidsByProject.mockResolvedValue([mockBid]);
      bidRepository.assignBidTransaction.mockResolvedValue({ success: true });
      notificationService.notifyBidAssignment.mockResolvedValue();

      const result = await bidService.assignBid(assignData);

      expect(result).toEqual({ success: true });
    });

    test('should reject assignment when not authorized', async () => {
      const unauthorizedProject = { ...mockProject, ownerId: 'other-user' };
      projectRepository.findProjectById.mockResolvedValue(unauthorizedProject);

      await expect(bidService.assignBid(assignData)).rejects.toThrow('Not authorized to assign bids');
    });
  });

  describe('getBidsByProject', () => {
    const mockProject = {
      id: 'project-1',
      ownerId: 'homeowner-1',
      contractorId: 'contractor-1'
    };

    test('should get bids when user is project owner', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);
      bidRepository.findBidsByProject.mockResolvedValue([]);

      const result = await bidService.getBidsByProject('project-1', 'homeowner-1');

      expect(result).toEqual([]);
    });

    test('should reject access when user not authorized', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);

      await expect(bidService.getBidsByProject('project-1', 'unauthorized-user')).rejects.toThrow('Unauthorized access');
    });
  });
});
