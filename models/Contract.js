const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    status: {
        type: String,
        enum: ['pendiente', 'aceptado', 'rechazado', 'completado'],
        default: 'pendiente'
    },
    selectedSchema: [{
        day: {type: String, required: true},
        time: {type: String, required: true}
    }],
    remainingClasses: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);