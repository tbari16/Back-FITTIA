const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');

router.get('/:trainerId/stats', trainerController.getTrainerStats);
router.get('/:trainerId/comments', trainerController.getTrainerComments);

module.exports = router;

