const projectService = require('../../services/projectService');
const projectRepository = require('../../repositories/projectRepository');
const userRepository = require('../../repositories/userRepository');

jest.mock('../../repositories/projectRepository');
jest.mock('../../repositories/userRepository');

describe('Project Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    const validProjectData = {
      ownerId: 'homeowner-1',
      title: 'Kitchen Remodel',
      description: 'Complete kitchen renovation with modern appliances',
      budget: 15000,
      startDate: '2025-01-01',
      endDate: '2025-03-01',
      address: '123 Main Street, Anytown, USA'
    };

    const mockOwner = {
      id: 'homeowner-1',
      name: 'John Doe',
      roles: ['HOMEOWNER']
    };

    test('should create a project successfully', async () => {
      userRepository.findUserById.mockResolvedValue(mockOwner);
      projectRepository.createProject.mockResolvedValue({
        id: 'project-1',
        ...validProjectData,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await projectService.createProject(validProjectData);

      expect(userRepository.findUserById).toHaveBeenCalledWith('homeowner-1');
      expect(projectRepository.createProject).toHaveBeenCalledWith({
        title: 'Kitchen Remodel',
        description: 'Complete kitchen renovation with modern appliances',
        ownerId: 'homeowner-1',
        budget: 15000,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        address: '123 Main Street, Anytown, USA'
      });
      expect(result).toHaveProperty('id', 'project-1');
      expect(result).toHaveProperty('status', 'DRAFT');
    });

    test('should reject project creation when title is missing', async () => {
      const invalidData = { ...validProjectData };
      delete invalidData.title;

      await expect(projectService.createProject(invalidData)).rejects.toThrow('All project fields are required');
    });

    test('should reject project creation when description is missing', async () => {
      const invalidData = { ...validProjectData };
      delete invalidData.description;

      await expect(projectService.createProject(invalidData)).rejects.toThrow('All project fields are required');
    });

    test('should reject project creation when budget is missing', async () => {
      const invalidData = { ...validProjectData };
      delete invalidData.budget;

      await expect(projectService.createProject(invalidData)).rejects.toThrow('All project fields are required');
    });

    test('should reject project creation when start date is missing', async () => {
      const invalidData = { ...validProjectData };
      delete invalidData.startDate;

      await expect(projectService.createProject(invalidData)).rejects.toThrow('All project fields are required');
    });

    test('should reject project creation when end date is missing', async () => {
      const invalidData = { ...validProjectData };
      delete invalidData.endDate;

      await expect(projectService.createProject(invalidData)).rejects.toThrow('All project fields are required');
    });

    test('should reject project creation when address is missing', async () => {
      const invalidData = { ...validProjectData };
      delete invalidData.address;

      await expect(projectService.createProject(invalidData)).rejects.toThrow('All project fields are required');
    });

    test('should reject project creation when owner not found', async () => {
      userRepository.findUserById.mockResolvedValue(null);

      await expect(projectService.createProject(validProjectData)).rejects.toThrow('User not found');
    });

    test('should reject project creation when owner is not a homeowner', async () => {
      const contractorOwner = { ...mockOwner, roles: ['CONTRACTOR'] };
      userRepository.findUserById.mockResolvedValue(contractorOwner);

      await expect(projectService.createProject(validProjectData)).rejects.toThrow('Only homeowners can create projects');
    });

    test('should reject project creation with invalid budget', async () => {
      userRepository.findUserById.mockResolvedValue(mockOwner);

      const invalidData = { ...validProjectData, budget: -100 };

      await expect(projectService.createProject(invalidData)).rejects.toThrow('Budget must be a positive number');
    });

    test('should reject project creation with non-numeric budget', async () => {
      userRepository.findUserById.mockResolvedValue(mockOwner);

      const invalidData = { ...validProjectData, budget: 'invalid' };

      await expect(projectService.createProject(invalidData)).rejects.toThrow('Budget must be a positive number');
    });

    test('should reject project creation with short address', async () => {
      userRepository.findUserById.mockResolvedValue(mockOwner);

      const invalidData = { ...validProjectData, address: 'Short' };

      await expect(projectService.createProject(invalidData)).rejects.toThrow('Address must be at least 10 characters long');
    });

    test('should reject project creation with invalid start date', async () => {
      userRepository.findUserById.mockResolvedValue(mockOwner);

      const invalidData = { ...validProjectData, startDate: 'invalid-date' };

      await expect(projectService.createProject(invalidData)).rejects.toThrow('Invalid startDate or endDate');
    });

    test('should reject project creation with invalid end date', async () => {
      userRepository.findUserById.mockResolvedValue(mockOwner);

      const invalidData = { ...validProjectData, endDate: 'invalid-date' };

      await expect(projectService.createProject(invalidData)).rejects.toThrow('Invalid startDate or endDate');
    });

    test('should reject project creation when start date is after end date', async () => {
      userRepository.findUserById.mockResolvedValue(mockOwner);

      const invalidData = { ...validProjectData, startDate: '2025-03-01', endDate: '2025-01-01' };

      await expect(projectService.createProject(invalidData)).rejects.toThrow('startDate must be before or equal to endDate');
    });
  });

  describe('publishProject', () => {
    const publishData = {
      projectId: 'project-1',
      bidsCloseAt: '2025-12-31',
      ownerId: 'homeowner-1'
    };

    const mockProject = {
      id: 'project-1',
      title: 'Kitchen Remodel',
      ownerId: 'homeowner-1',
      status: 'DRAFT'
    };

    test('should publish project successfully', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);
      projectRepository.updateProject.mockResolvedValue({
        ...mockProject,
        status: 'OPEN_FOR_BIDS',
        bidsCloseAt: new Date('2025-12-31')
      });

      const result = await projectService.publishProject(publishData);

      expect(projectRepository.findProjectById).toHaveBeenCalledWith('project-1');
      expect(projectRepository.updateProject).toHaveBeenCalledWith({
        id: 'project-1',
        status: 'OPEN_FOR_BIDS',
        bidsCloseAt: expect.any(Date)
      });
      expect(result.status).toBe('OPEN_FOR_BIDS');
    });

    test('should reject publishing when project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(projectService.publishProject(publishData)).rejects.toThrow('Project not found');
    });

    test('should reject publishing when not authorized', async () => {
      const unauthorizedProject = { ...mockProject, ownerId: 'other-user' };
      projectRepository.findProjectById.mockResolvedValue(unauthorizedProject);

      await expect(projectService.publishProject(publishData)).rejects.toThrow('Not authorized to publish this project');
    });

    test('should reject publishing when project is not in DRAFT status', async () => {
      const nonDraftProject = { ...mockProject, status: 'OPEN_FOR_BIDS' };
      projectRepository.findProjectById.mockResolvedValue(nonDraftProject);

      await expect(projectService.publishProject(publishData)).rejects.toThrow('Only draft projects can be published');
    });

    test('should reject publishing with invalid bids close date', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);

      const invalidData = { ...publishData, bidsCloseAt: 'invalid-date' };

      await expect(projectService.publishProject(invalidData)).rejects.toThrow('Bids close date must be in the future');
    });

    test('should reject publishing with past bids close date', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const invalidData = { ...publishData, bidsCloseAt: pastDate.toISOString() };

      await expect(projectService.publishProject(invalidData)).rejects.toThrow('Bids close date must be in the future');
    });
  });

  describe('updateProjectStatus', () => {
    const updateData = {
      projectId: 'project-1',
      newStatus: 'ACTIVE',
      actorUserId: 'homeowner-1'
    };

    const mockProject = {
      id: 'project-1',
      title: 'Kitchen Remodel',
      ownerId: 'homeowner-1',
      status: 'OPEN_FOR_BIDS'
    };

    test('should update project status successfully', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);
      projectRepository.updateProjectStatus.mockResolvedValue({
        ...mockProject,
        status: 'ACTIVE'
      });

      const result = await projectService.updateProjectStatus(updateData);

      expect(projectRepository.findProjectById).toHaveBeenCalledWith('project-1');
      expect(projectRepository.updateProjectStatus).toHaveBeenCalledWith('project-1', 'ACTIVE');
      expect(result.status).toBe('ACTIVE');
    });

    test('should reject update when project not found', async () => {
      projectRepository.findProjectById.mockResolvedValue(null);

      await expect(projectService.updateProjectStatus(updateData)).rejects.toThrow('Project not found');
    });

    test('should reject update when not authorized', async () => {
      const unauthorizedProject = { ...mockProject, ownerId: 'other-user' };
      projectRepository.findProjectById.mockResolvedValue(unauthorizedProject);

      await expect(projectService.updateProjectStatus(updateData)).rejects.toThrow('Not authorized to update status');
    });

    test('should reject update with invalid status transition', async () => {
      projectRepository.findProjectById.mockResolvedValue(mockProject);

      const invalidData = { ...updateData, newStatus: 'DRAFT' };

      await expect(projectService.updateProjectStatus(invalidData)).rejects.toThrow('Invalid status transition from OPEN_FOR_BIDS to DRAFT');
    });

    test('should reject update with missing parameters', async () => {
      await expect(projectService.updateProjectStatus({})).rejects.toThrow('projectId, newStatus and actorUserId are required');
    });
  });

  describe('getProjectWithDetails', () => {
    const mockProject = {
      id: 'project-1',
      title: 'Kitchen Remodel',
      ownerId: 'homeowner-1',
      contractorId: 'contractor-1'
    };

    test('should get project when user is owner', async () => {
      projectRepository.findProjectWithDetails.mockResolvedValue(mockProject);

      const result = await projectService.getProjectWithDetails('project-1', 'homeowner-1');

      expect(projectRepository.findProjectWithDetails).toHaveBeenCalledWith('project-1');
      expect(result).toEqual(mockProject);
    });

    test('should get project when user is contractor', async () => {
      projectRepository.findProjectWithDetails.mockResolvedValue(mockProject);

      const result = await projectService.getProjectWithDetails('project-1', 'contractor-1');

      expect(result).toEqual(mockProject);
    });

    test('should reject access when project not found', async () => {
      projectRepository.findProjectWithDetails.mockResolvedValue(null);

      await expect(projectService.getProjectWithDetails('project-1', 'homeowner-1')).rejects.toThrow('Project not found');
    });

    test('should reject access when user not authorized', async () => {
      projectRepository.findProjectWithDetails.mockResolvedValue(mockProject);

      await expect(projectService.getProjectWithDetails('project-1', 'unauthorized-user')).rejects.toThrow('Unauthorized access');
    });
  });

  describe('listProjects', () => {
    const mockProjects = [
      { id: 'project-1', title: 'Kitchen Remodel', status: 'OPEN_FOR_BIDS' },
      { id: 'project-2', title: 'Bathroom Renovation', status: 'DRAFT' }
    ];

    test('should list projects for homeowner', async () => {
      projectRepository.findProjects.mockResolvedValue(mockProjects);

      const result = await projectService.listProjects('homeowner-1', ['HOMEOWNER']);

      expect(projectRepository.findProjects).toHaveBeenCalledWith({
        OR: [
          { ownerId: 'homeowner-1' },
          { status: 'OPEN_FOR_BIDS' }
        ]
      });
      expect(result).toEqual(mockProjects);
    });

    test('should list projects for contractor', async () => {
      projectRepository.findProjects.mockResolvedValue(mockProjects);

      const result = await projectService.listProjects('contractor-1', ['CONTRACTOR']);

      expect(projectRepository.findProjects).toHaveBeenCalledWith({
        status: 'OPEN_FOR_BIDS'
      });
      expect(result).toEqual(mockProjects);
    });

    test('should list projects for user with multiple roles', async () => {
      projectRepository.findProjects.mockResolvedValue(mockProjects);

      const result = await projectService.listProjects('user-1', ['HOMEOWNER', 'CONTRACTOR']);

      expect(projectRepository.findProjects).toHaveBeenCalledWith({
        OR: [
          { ownerId: 'user-1' },
          { status: 'OPEN_FOR_BIDS' }
        ]
      });
      expect(result).toEqual(mockProjects);
    });
  });
});