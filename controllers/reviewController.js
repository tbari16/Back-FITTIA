const Comment = require('../models/Comment');
const Contract = require('../models/Contract');
const Service = require('../models/Service');
const User = require('../models/User');

exports.rateTrainer = async(req,res) => {
    const {trainerId, rating} = req.body;
    const clientId = req.user.id;

    try {
        if(!trainerId || !rating || rating < 1 || rating > 5){
            return res.status(400).json({error: "Datos inválidos"});
        }

        const trainer = await User.findById(trainerId);
        if(!trainer || trainer.role !== 'trainer') {
            return res.status(404).json({error: "Entrenador no econtrado"});
        }

        const services = await Service.find({trainer: trainerId});
        const serviceIds = services.map(s => s._id);

        const contract = await Contract.findOne({
            client: clientId,
            service: {$in: serviceIds},
            status: {$in:['aceptado', 'completado']}
        });

        if(!contract) {
            return res.status(403).json({error:"No contrataste al entrenador"});
        }

        const existing = await Comment.findOne({client: clientId, trainer: trainerId});

        if(existing) {
            existing.rating = rating;
            await existing.save();
            return res.status(200).json({message: "Calificación actualizada correctamente"});
        }

        const comment = new Comment({
            client: clientId,
            trainer: trainerId,
            text: '',
            rating
        });
        await comment.save();

        return res.status(200).json({message: "Calificación registrada correctamente."});
    } catch (err){
        return res.status(500).json({error: "Error al calificar"});
    }
};