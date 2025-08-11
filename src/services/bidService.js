const bidRepository = require('../repositories/bidRepository');
const projectRepository = require('../repositories/projectRepository');
const notificationService = require('../services/notificationService');

const createBid = async ({
  projectId,
  contractorId,
  amount,
  proposal,
  estimatedDuration,
  estimatedStartDate,
  estimatedEndDate,
}) => {
  const project = await projectRepository.findProjectById(projectId);
  
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  if (project.status !== 'OPEN_FOR_BIDS') {
    const err = new Error('Project is not accepting bids');
    err.status = 400;
    throw err;
  }

  if (project.bidsCloseAt && new Date() > project.bidsCloseAt) {
    const err = new Error('Bidding period has ended');
    err.status = 400;
    throw err;
  }

  const existingBid = await bidRepository.findBidByProjectAndContractor(projectId, contractorId);
  
  if (existingBid) {
    const err = new Error('You have already submitted a bid for this project');
    err.status = 400;
    throw err;
  }

  if (!amount || amount <= 0) {
    throw new Error('Bid amount must be positive');
  }

  if (!proposal || proposal.trim().length < 10) {
    throw new Error('Proposal must be at least 10 characters');
  }

  if (!estimatedDuration || estimatedDuration <= 0) {
    throw new Error('Estimated duration must be positive');
  }

  const bidData = {
    projectId,
    contractorId,
    amount: Number(amount),
    proposal: proposal.trim(),
    estimatedDuration: Number(estimatedDuration),
    estimatedStartDate: new Date(estimatedStartDate),
    estimatedEndDate: new Date(estimatedEndDate),
  };

  const bid = await bidRepository.createBid(bidData);
  return bid;
};

const assignBid = async ({ projectId, bidId, ownerId }) => {
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      const err = new Error('Project not found');
      err.status = 404;
      throw err;
    }
  
    if (project.ownerId !== ownerId) {
      const err = new Error('Not authorized to assign bids');
      err.status = 403;
      throw err;
    }
  
    if (project.status !== 'OPEN_FOR_BIDS') {
      const err = new Error('Project is not in bidding phase');
      err.status = 400;
      throw err;
    }
  
    const bid = await bidRepository.findBidById(bidId);
    if (!bid || bid.projectId !== projectId) {
      const err = new Error('Bid not found');
      err.status = 404;
      throw err;
    }
  
    const allBids = await bidRepository.findBidsByProject(projectId);
  
    const result = await bidRepository.assignBidTransaction({
      projectId,
      selectedBidId: bidId,
      contractorId: bid.contractorId,
      newBudget: bid.amount, 
      allBidIds: allBids.map(b => b.id),
    });
  
    await notificationService.notifyBidAssignment({
      projectId,
      acceptedBidId: bidId,
      rejectedBidIds: allBids.filter(b => b.id !== bidId).map(b => b.id),
    });
  
    return result;
  };


  const getBidsByProject = async (projectId, userId) => {
    const project = await projectRepository.findProjectById(projectId)
  
    if (!project) {
      throw new Error('Project not found');
    }
  
    if (
      project.ownerId !== userId &&
      project.contractorId !== userId
    ) {
      throw new Error('Unauthorized access');
    }
  
    return await bidRepository.findBidsByProject(projectId)
  };

module.exports = {
   createBid,
   assignBid,
   getBidsByProject,
   };