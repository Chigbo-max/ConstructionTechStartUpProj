const express = require('express');
const { authenticateToken } =  require('../middleware/auth')
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/projects', authenticateToken, userController.getUserProjects);

module.exports = router;