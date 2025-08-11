const cleanProjectResponse = (project) => {
    const cleanProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      ownerId: project.ownerId,
      status: project.status,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      address: project.address,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  
    if (project.bidsCloseAt) cleanProject.bidsCloseAt = project.bidsCloseAt;
    if (project.contractorId) cleanProject.contractorId = project.contractorId;
    if (project.selectedBidId) cleanProject.selectedBidId = project.selectedBidId;
    if (project.acceptedAmount) cleanProject.acceptedAmount = project.acceptedAmount;
  
    return cleanProject;
  };
  
  module.exports = { cleanProjectResponse };