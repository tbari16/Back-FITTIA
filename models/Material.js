const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    contract: {type: mongoose.Schema.Types.ObjectId, ref: 'Contract', require: true},
    fileName: {type: String, required: true},
    fileUrl: {type: String, required: true}
}, { timestamps: true});

module.exports = mongoose.model('Material', materialSchema);