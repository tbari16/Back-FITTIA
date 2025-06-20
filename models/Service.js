const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: { type: Number, required: true},
    duration: { type: Number, required: true},
    location:{ type: String, required: true},
    language: { type: String, required: true},
    mode: { type: String, enum: ['presencial', 'virtual'], required: true},
    category: { type: String, required: true},
    sessionPerWeek: { type: Number, required: true},
    intensity: { type: String, required: true},
    status: { type: String, enum: ['publicado', 'despublicado'], default: 'despublicado'},
    imageUrl: {type: String},
    rating: { type: Number, default: 0},
    trainer: {
        id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        name: {type: String, required: true}
    }
}, {timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);