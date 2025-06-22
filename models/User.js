const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: {type: String, required: true},
    email: { type: String, required: true , unique: true, match: /.+\@.+\..+/},
    password: { type: String, required: true },
    birthDate: { type: Date, required: true },
    role: { type: String, enum: ['client', 'trainer'], required: true },
    
    // Sirve para las metricas
    views: { type: Number, default: 0},

    // atributos para el perfil público del entrenador
    bio: {type: String, default: ''},
    specialties:[{type: String}],
    location: {type: String, default: ''},
    profileImage: { type: String, default: ''},

    // Contratación del lado del cliente
    contractedServices: [{
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        status: { type: String, enum: ['pendiente', 'aceptado', 'cancelado'], default: 'pendiente' },
        rating: { type: Number }
    }],

    // Estos campos sirven para reestablecer la contraseña
    passwordResetCode: String,
    passwordResetExpires: Date

}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);
