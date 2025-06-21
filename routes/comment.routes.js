const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const {authMiddleware} = require('../middlewares/authMiddleware');

router.post('/:commentId/reply', authMiddleware, commentController.replyToComment);

module.exports = router;