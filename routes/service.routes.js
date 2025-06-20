const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.get('/', serviceController.getAllPublishedServices);
router.get('/search', serviceController.searchServices);
router.get('/trainers/:trainerId/services', authMiddleware, roleMiddleware('trainer'), serviceController.getTrainerServices);
router.post('/', authMiddleware, roleMiddleware('trainer'), serviceController.createService);
router.patch('/:serviceId/status', authMiddleware, roleMiddleware('trainer'), serviceController.updateServiceStatus);
router.delete('/:serviceId', authMiddleware, roleMiddleware('trainer'), serviceController.deleteService);

module.exports = router;
