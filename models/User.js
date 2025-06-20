const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: {type: String, required: true},
    email: { type: String, required: true , unique: true, match: /.+\@.+\..+/},
    password: { type: String, required: true },
    birthDate: { type: Date, required: true },
    role: { type: String, enum: ['client', 'trainer'], required: true },

    // Estos campos sirven para reestablecer la contraseña
    passwordResetCode: String,
    passwordResetExpires: Date

}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);
