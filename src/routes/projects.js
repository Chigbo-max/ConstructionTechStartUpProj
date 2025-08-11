const express = require('express');
const {authenticateToken, requireRole} = require('../middleware/auth');
const projectController = require('../controllers/projectController');

const router = express.Router();

router.post('/create', authenticateToken, requireRole('HOMEOWNER'), projectController.create);
router.patch('/publish', authenticateToken, requireRole('HOMEOWNER'), projectController.publish)
router.patch('/status', authenticateToken, requireRole('HOMEOWNER'), projectController.updateStatus);
router.get('/:id', authenticateToken, projectController.getProjectDetails);
router.get('/', authenticateToken, projectController.listProjects);

module.exports = router;