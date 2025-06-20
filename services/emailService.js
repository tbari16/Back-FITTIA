const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendRecoveryEmail = async (to, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Recuperación de contraseña',
        text: `Tu código de recuperación es: ${code}`
    };

    await transporter.sendMail(mailOptions);
};