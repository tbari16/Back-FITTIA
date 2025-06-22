const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require ('../middlewares/uploadMiddleware');

router.get('/users/me/my-services', authMiddleware, contractController.getMyContracts);
router.post('/contracts', authMiddleware, contractController.createContract);
router.get('/contracts/:contractId', authMiddleware, contractController.getContractById);
router.patch('/contracts/:contractId/cancel', authMiddleware, contractController.cancelContract);
router.post('/contracts/recontract', authMiddleware, contractController.recontractContract);
router.patch('/contracts/:contractId/changeTime', authMiddleware, contractController.updateContractTime);
router.patch('/contracts/:contractId/trainerAnswer', authMiddleware, contractController.updateContractStatus);

router.post('/contracts/:contractId/materials', authMiddleware, upload.single('file'), contractController.uploadMaterial);
router.get('/contracts/:contractId/materials', authMiddleware, contractController.getContractMaterials);
router.get('/materials/:materialId', authMiddleware, contractController.downloadMaterial);

module.exports = router;