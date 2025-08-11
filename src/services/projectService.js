const projectRepository = require('../repositories/projectRepository');
const userRepository = require('../repositories/userRepository');

const createProject = async ({
  ownerId,
  title,
  description,
  budget,
  startDate,
  endDate,
  address,
}) => {
  if (
    !title || !description || budget == null ||
    !startDate || !endDate || !address
  ) {
    throw new Error('All project fields are required');
  }

  const owner = await userRepository.findUserById(ownerId);
  
  if (!owner) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  
  if (!owner.roles.includes('HOMEOWNER')) {
    const err = new Error('Only homeowners can create projects');
    err.status = 403;
    throw err;
  }

  const numericBudget = Number(budget);
  if (!Number.isFinite(numericBudget) || numericBudget <= 0) {
    throw new Error('Budget must be a positive number');
  }

  const trimmedAddress = address.trim();
  if (trimmedAddress.length < 10) {
    throw new Error('Address must be at least 10 characters long');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid startDate or endDate');
  }
  if (start > end) {
    throw new Error('startDate must be before or equal to endDate');
  }

  const projectData = {
    title,
    description,
    ownerId,
    budget: numericBudget,
    startDate: start,
    endDate: end,
    address: trimmedAddress,
  };

  const project = await projectRepository.createProject(projectData);
  return project;
};

const publishProject = async ({ projectId, bidsCloseAt, ownerId }) => {
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  if (project.ownerId !== ownerId) {
    const err = new Error('Not authorized to publish this project');
    err.status = 403;
    throw err;
  }
  if (project.status !== 'DRAFT') {
    const err = new Error('Only draft projects can be published');
    err.status = 400;
    throw err;
  }

  const closeDate = new Date(bidsCloseAt);
  if (Number.isNaN(closeDate.getTime()) || closeDate <= new Date()) {
    throw new Error('Bids close date must be in the future');
  }

  const updated = await projectRepository.updateProject({
    id: projectId,
    status: 'OPEN_FOR_BIDS',
    bidsCloseAt: closeDate,
  });
  return updated;
};

const allowedTransitions = {
  DRAFT: new Set(['PUBLISHED', 'OPEN_FOR_BIDS', 'CANCELLED']),
  PUBLISHED: new Set(['OPEN_FOR_BIDS', 'CANCELLED']),
  OPEN_FOR_BIDS: new Set(['ACTIVE', 'CANCELLED']),
  ACTIVE: new Set(['COMPLETED', 'CANCELLED']),
  COMPLETED: new Set([]),
  CANCELLED: new Set([]),
};

const updateProjectStatus = async ({ projectId, newStatus, actorUserId }) => {
  if (!projectId || !newStatus || !actorUserId) {
    throw new Error('projectId, newStatus and actorUserId are required');
  }
  const project = await projectRepository.findProjectById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  
  if (project.ownerId !== actorUserId) {
    const err = new Error('Not authorized to update status');
    err.status = 403;
    throw err;
  }
  const allowedNext = allowedTransitions[project.status] || new Set();
  if (!allowedNext.has(newStatus)) {
    const err = new Error(`Invalid status transition from ${project.status} to ${newStatus}`);
    err.status = 400;
    throw err;
  }
  const updated = await projectRepository.updateProjectStatus(projectId, newStatus);
  return updated;
};

const getProjectWithDetails = async (projectId, userId) => {
  
  const project = await projectRepository.findProjectWithDetails(projectId);

  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  if (
    project.ownerId !== userId &&
    project.contractorId !== userId
  ) {
    const err = new Error('Unauthorized access');
    err.status = 403;
    throw err;
  }

  return project;
};

const listProjects = async (userId, userRoles) => {
  const where = {};

  if (userRoles.includes('HOMEOWNER')) {
    where.OR = [
      { ownerId: userId },
      { status: 'OPEN_FOR_BIDS' }
    ];
  } else if (userRoles.includes('CONTRACTOR')) {
    where.status = 'OPEN_FOR_BIDS';
  }

  return await projectRepository.findProjects(where);
};

module.exports = {
  createProject,
  updateProjectStatus,
  publishProject,
  getProjectWithDetails,
  listProjects,
};