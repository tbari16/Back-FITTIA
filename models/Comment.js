const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    client: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    text: {type: String, required: true},
    rating: {type: Number, min: 1, max: 5, required: true},
    reply: { type: String, default: ''},
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);