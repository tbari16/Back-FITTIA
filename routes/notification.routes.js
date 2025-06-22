const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.patch('/notifications/:notificationId/read', authMiddleware, notificationController.markAsRead);
router.post('/notifications', notificationController.createNotification);


module.exports = router;