const User = require('../models/User');
const generateCode = require('../utils/generateCodes');
const { sendRecoveryEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');

exports.requestPasswordReset = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.status(400).json({ error: "El mail es oblogatorio"});
    }

    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({error: "No existe un usuario con ese email"});
    }

    const code = generateCode();
    const expiration = new Date(Date.now() + 15 * 60 * 1000);

    user.passwordResetCode = code;
    user.passwordResetExpires = expiration;
    await user.save();

    await sendRecoveryEmail(email, code);

    res.status(200).json({message: "Codigo de recuperación enviado al correo electrónico."});

};

exports.validateResetCode = async (req, res) => {
    const {email, code} = req.body;

    if(!email || !code){
        return res.status(400).json({error: "El email y código son obligatorios"});
    }

    const user = await User.findOne({email});

    if(!user || user.passwordResetCode !== code) {
        return res.status(400).json({error: "Código inválido."});
    }

    if(!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return res.status(400).json({error: "El código expiró."});
    }

    res.status(200).json({message: "Código válido."});
}

exports.confirmPasswordReset = async (req, res) => {
    const {email, newPassword} = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({error: "El email y la nueva contraseña son requeridos"});
    }

    const passwordRequisitos = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRequisitos.test(newPassword)) {
        return res.status(400).json({error: "La contraseña debe cumplir los requerimientos."});
    }

    const user = await User.findOne({email});
    
    if(!user || !user.passwordResetCode || !user.passwordResetExpires || user.passwordResetExpires < new Date()){
        return res.status(404).json({error: "Recuperación invalido o expirado"});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({massage: "Contraseña actualizada con éxito"});

}