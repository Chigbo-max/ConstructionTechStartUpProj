const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authenticateToken, notificationController.getNotifications);
router.patch('/:notificationId/read', authenticateToken, notificationController.markAsRead);
router.patch('/mark-all-read', authenticateToken, notificationController.markAllAsRead);


module.exports = router;