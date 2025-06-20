const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registro
exports.register = async (req, res) => {
    try {

        const {firstName, lastName, email, password, birthDate, role } = req.body;

        // Sirve para validar que todos los campos se completen en el sign up
        if ( !firstName || !lastName || !email || !password || !birthDate || !role ) {
            return res.status(400).json({ error: "Todos los campos son obligatorios"});
        }
        
        const passwordRequisitos = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRequisitos.test(password)){
            return res.status(400).json({error: "La contraseña no cumple los requisitos necesarios."});
        }

        const exists = await User.findOne({email});
        if (exists) {
            return res.status(409).json({error: "El mail ingresado ya está registrado."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            birthDate,
            role
        });

        const savedUser = await newUser.save();
        const { password: _, ...userData } = savedUser.toObject();
        res.status(201).json(userData);

    } catch(err) {
        res.status(500).json({error: "Error del servidor: ", details: err.message});
    }
};


// Login
exports.login = async(req, res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({error: "Email y contraseña requeridos."});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({error: "Email incorrecto!"});
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword){
            return res.status(401).json({error: "Contraseña incorrecta."});
        }

        const payload = {
            id: user._id,
            role: user.role,
            email: user.email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '2h'});
        const {password: _, ...userData} = user.toObject();

        res.status(200).json({
            accessToken: token,
            user: userData
        });
    } catch (err) {
        res.status(500).json({error: "Error en el servidor", details: err.message});
    }
}