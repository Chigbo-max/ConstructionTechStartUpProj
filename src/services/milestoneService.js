const milestoneRepository = require('../repositories/milestoneRepository');

const createMilestone = async ({ projectId, title, description, dueDate, actorUserId }) => {
  if (!title || !description || !dueDate) {
    throw new Error('Title, description and due date are required');
  }

  const project = await milestoneRepository.findProjectById(projectId);
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  if (project.contractorId !== actorUserId && project.ownerId !== actorUserId) {
    const err = new Error('Not authorized to create milestones for this project');
    err.status = 403;
    throw err;
  }

  return await milestoneRepository.createMilestone({
    projectId,
    title,
    description,
    dueDate: new Date(dueDate),
    status: 'PENDING'
  });
};

const updateMilestoneStatus = async ({ milestoneId, status, actorUserId }) => {
  const milestone = await milestoneRepository.findMilestoneById(milestoneId);
  if (!milestone) {
    const err = new Error('Milestone not found');
    err.status = 404;
    throw err;
  }

  const project = await milestoneRepository.findProjectById(milestone.projectId);
  if (project.contractorId !== actorUserId && project.ownerId !== actorUserId) {
    const err = new Error('Not authorized to update this milestone');
    err.status = 403;
    throw err;
  }

  return await milestoneRepository.updateMilestoneStatus(milestoneId, status);
};

const getMilestonesByProject = async (projectId) => {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
  
    return await milestoneRepository.findMilestonesByProject(projectId);
  };

module.exports = {
    createMilestone,
    updateMilestoneStatus,
    getMilestonesByProject
};