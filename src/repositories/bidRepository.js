const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBid = async (bidData) => {
  return await prisma.bid.create({
    data: bidData,
  });
};

const findBidById = async (id) => {
  return await prisma.bid.findUnique({
    where: { id },
    include: {
      project: true,
      contractor: true,
    },
  });
};

const findBidByProjectAndContractor = async (projectId, contractorId) => {
  return await prisma.bid.findUnique({
    where: {
      projectId_contractorId: {
        projectId,
        contractorId,
      },
    },
  });
};

const findBidsByProject = async (projectId) => {
  return await prisma.bid.findMany({
    where: { projectId },
    include: {
      contractor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
};

const assignBidTransaction = async ({ projectId, selectedBidId, contractorId, newBudget, allBidIds }) => {
    return await prisma.$transaction(async (tx) => {

        const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: {
          status: 'ACTIVE',
          contractorId,
          selectedBidId,
          acceptedAmount: newBudget, 
        },
      });
  
      await tx.bid.updateMany({
        where: { id: { in: allBidIds } },
        data: {
          status: allBidIds.includes(selectedBidId) ? 'ACCEPTED' : 'REJECTED',
        },
      });
      return updatedProject;
    });
  };

module.exports = {
  createBid,
  findBidById,
  findBidByProjectAndContractor,
  findBidsByProject,
  assignBidTransaction,
};