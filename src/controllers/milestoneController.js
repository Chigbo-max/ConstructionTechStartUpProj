const milestoneService = require('../services/milestoneService');

exports.create = async (req, res) => {
  try {
    const milestone = await milestoneService.createMilestone({
      ...req.body,
      actorUserId: req.user.sub,
    });
    res.status(201).json({ message: 'Milestone created', milestone });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { milestoneId, status } = req.body;
    const updated = await milestoneService.updateMilestoneStatus({
      milestoneId,
      status,
      actorUserId: req.user.sub,
    });
    res.json({ message: 'Milestone status updated', milestone: updated });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestones = await milestoneService.getMilestonesByProject(projectId);
    res.json({ milestones });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};