const express = require('express');
const router = express.Router();
const {rateTrainer} = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/reviews', authMiddleware, rateTrainer);

module.exports = router;