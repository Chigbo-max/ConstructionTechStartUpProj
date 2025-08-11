const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const milestoneController = require('../controllers/milestoneController');

const router = express.Router();

router.post('/create', authenticateToken, milestoneController.create);
router.patch('/status', authenticateToken, milestoneController.updateStatus);
router.get('/:projectId', authenticateToken, milestoneController.getByProject);

module.exports = router;