const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const passwordResetController = require('../controllers/passwordResetController')

// Registro
router.post('/register', authController.register);
// Login
router.post('/login', authController.login);
// Recuperar contraseña
router.post('/password-reset/request', passwordResetController.requestPasswordReset);
router.post('/password-reset/validate', passwordResetController.validateResetCode);
router.post('/password-reset/confirm', passwordResetController.confirmPasswordReset);

module.exports = router;