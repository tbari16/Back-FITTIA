const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/users/:userId/my-services', authMiddleware, contractController.getMyContracts);

module.exports = router;