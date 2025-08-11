const milestoneService = require('../../services/milestoneService');
const milestoneRepository = require('../../repositories/milestoneRepository');

jest.mock('../../repositories/milestoneRepository');

describe('Milestone Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMilestone', () => {
    const validMilestoneData = {
      projectId: 'project-1',
      title: 'Demolition Complete',
      description: 'Remove all old fixtures and prepare for new installation',
      dueDate: '2025-09-15',
      actorUserId: 'homeowner-1'
    };

    const mockProject = {
      id: 'project-1',
      ownerId: 'homeowner-1',
      contractorId: 'contractor-1'
    };

    test('should create a milestone successfully', async () => {
      milestoneRepository.findProjectById.mockResolvedValue(mockProject);
      milestoneRepository.createMilestone.mockResolvedValue({
        id: 'milestone-1',
        ...validMilestoneData,
        status: 'PENDING'
      });

      const result = await milestoneService.createMilestone(validMilestoneData);

      expect(milestoneRepository.findProjectById).toHaveBeenCalledWith('project-1');
      expect(milestoneRepository.createMilestone).toHaveBeenCalledWith({
        projectId: 'project-1',
        title: 'Demolition Complete',
        description: 'Remove all old fixtures and prepare for new installation',
        dueDate: expect.any(Date),
        status: 'PENDING'
      });
      expect(result).toHaveProperty('id', 'milestone-1');
      expect(result).toHaveProperty('status', 'PENDING');
    });

    test('should reject milestone creation when title is missing', async () => {
      const invalidData = { ...validMilestoneData };
      delete invalidData.title;

      await expect(milestoneService.createMilestone(invalidData)).rejects.toThrow('Title, description and due date are required');
    });

    test('should reject milestone creation when description is missing', async () => {
      const invalidData = { ...validMilestoneData };
      delete invalidData.description;

      await expect(milestoneService.createMilestone(invalidData)).rejects.toThrow('Title, description and due date are required');
    });

    test('should reject milestone creation when due date is missing', async () => {
      const invalidData = { ...validMilestoneData };
      delete invalidData.dueDate;

      await expect(milestoneService.createMilestone(invalidData)).rejects.toThrow('Title, description and due date are required');
    });

    test('should reject milestone creation when project not found', async () => {
      milestoneRepository.findProjectById.mockResolvedValue(null);

      await expect(milestoneService.createMilestone(validMilestoneData)).rejects.toThrow('Project not found');
    });

    test('should reject milestone creation when user not authorized', async () => {
      milestoneRepository.findProjectById.mockResolvedValue(mockProject);

      const unauthorizedData = { ...validMilestoneData, actorUserId: 'unauthorized-user' };

      await expect(milestoneService.createMilestone(unauthorizedData)).rejects.toThrow('Not authorized to create milestones for this project');
    });

    test('should allow milestone creation when user is project owner', async () => {
      milestoneRepository.findProjectById.mockResolvedValue(mockProject);
      milestoneRepository.createMilestone.mockResolvedValue({
        id: 'milestone-1',
        ...validMilestoneData,
        status: 'PENDING'
      });

      const result = await milestoneService.createMilestone(validMilestoneData);

      expect(result).toHaveProperty('id', 'milestone-1');
    });

    test('should allow milestone creation when user is project contractor', async () => {
      milestoneRepository.findProjectById.mockResolvedValue(mockProject);
      milestoneRepository.createMilestone.mockResolvedValue({
        id: 'milestone-1',
        ...validMilestoneData,
        actorUserId: 'contractor-1',
        status: 'PENDING'
      });

      const contractorData = { ...validMilestoneData, actorUserId: 'contractor-1' };
      const result = await milestoneService.createMilestone(contractorData);

      expect(result).toHaveProperty('id', 'milestone-1');
    });
  });

  describe('updateMilestoneStatus', () => {
    const updateData = {
      milestoneId: 'milestone-1',
      status: 'COMPLETED',
      actorUserId: 'homeowner-1'
    };

    const mockMilestone = {
      id: 'milestone-1',
      projectId: 'project-1',
      title: 'Demolition Complete'
    };

    const mockProject = {
      id: 'project-1',
      ownerId: 'homeowner-1',
      contractorId: 'contractor-1'
    };

    test('should update milestone status successfully', async () => {
      milestoneRepository.findMilestoneById.mockResolvedValue(mockMilestone);
      milestoneRepository.findProjectById.mockResolvedValue(mockProject);
      milestoneRepository.updateMilestoneStatus.mockResolvedValue({
        ...mockMilestone,
        status: 'COMPLETED'
      });

      const result = await milestoneService.updateMilestoneStatus(updateData);

      expect(milestoneRepository.findMilestoneById).toHaveBeenCalledWith('milestone-1');
      expect(milestoneRepository.findProjectById).toHaveBeenCalledWith('project-1');
      expect(milestoneRepository.updateMilestoneStatus).toHaveBeenCalledWith('milestone-1', 'COMPLETED');
      expect(result.status).toBe('COMPLETED');
    });

    test('should reject update when milestone not found', async () => {
      milestoneRepository.findMilestoneById.mockResolvedValue(null);

      await expect(milestoneService.updateMilestoneStatus(updateData)).rejects.toThrow('Milestone not found');
    });

    test('should reject update when user not authorized', async () => {
      milestoneRepository.findMilestoneById.mockResolvedValue(mockMilestone);
      milestoneRepository.findProjectById.mockResolvedValue(mockProject);

      const unauthorizedData = { ...updateData, actorUserId: 'unauthorized-user' };

      await expect(milestoneService.updateMilestoneStatus(unauthorizedData)).rejects.toThrow('Not authorized to update this milestone');
    });

    test('should allow update when user is project owner', async () => {
      milestoneRepository.findMilestoneById.mockResolvedValue(mockMilestone);
      milestoneRepository.findProjectById.mockResolvedValue(mockProject);
      milestoneRepository.updateMilestoneStatus.mockResolvedValue({
        ...mockMilestone,
        status: 'COMPLETED'
      });

      const result = await milestoneService.updateMilestoneStatus(updateData);

      expect(result.status).toBe('COMPLETED');
    });

    test('should allow update when user is project contractor', async () => {
      milestoneRepository.findMilestoneById.mockResolvedValue(mockMilestone);
      milestoneRepository.findProjectById.mockResolvedValue(mockProject);
      milestoneRepository.updateMilestoneStatus.mockResolvedValue({
        ...mockMilestone,
        status: 'IN_PROGRESS'
      });

      const contractorData = { ...updateData, actorUserId: 'contractor-1' };
      const result = await milestoneService.updateMilestoneStatus(contractorData);

      expect(result.status).toBe('IN_PROGRESS');
    });
  });

  describe('getMilestonesByProject', () => {
    const mockMilestones = [
      { id: 'milestone-1', title: 'Demolition Complete', status: 'COMPLETED' },
      { id: 'milestone-2', title: 'Installation', status: 'PENDING' }
    ];

    test('should get milestones by project successfully', async () => {
      milestoneRepository.findMilestonesByProject.mockResolvedValue(mockMilestones);

      const result = await milestoneService.getMilestonesByProject('project-1');

      expect(milestoneRepository.findMilestonesByProject).toHaveBeenCalledWith('project-1');
      expect(result).toEqual(mockMilestones);
    });

    test('should reject when project ID is missing', async () => {
      await expect(milestoneService.getMilestonesByProject()).rejects.toThrow('Project ID is required');
    });

    test('should reject when project ID is null', async () => {
      await expect(milestoneService.getMilestonesByProject(null)).rejects.toThrow('Project ID is required');
    });

    test('should reject when project ID is empty string', async () => {
      await expect(milestoneService.getMilestonesByProject('')).rejects.toThrow('Project ID is required');
    });
  });
});
