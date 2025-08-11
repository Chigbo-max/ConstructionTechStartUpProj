const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createMilestone = async (data) => {
  return await prisma.milestone.create({ data });
};

const findMilestoneById = async (id) => {
  return await prisma.milestone.findUnique({ where: { id } });
};

const updateMilestoneStatus = async (id, status) => {
  return await prisma.milestone.update({
    where: { id },
    data: { status },
  });
};

const findMilestonesByProject = async (projectId) => {
  return await prisma.milestone.findMany({
    where: { projectId },
    orderBy: { dueDate: 'asc' },
  });
};

const findProjectById = async (projectId) => {
  return await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      ownerId: true,
      contractorId: true,
    },
  });
};

module.exports = {
  createMilestone,
  findMilestoneById,
  updateMilestoneStatus,
  findMilestonesByProject,
  findProjectById,
};