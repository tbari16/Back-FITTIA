const User = require('../models/User');
const Contract = require('../models/Contract');
const Service = require('../models/Service')
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

exports.getTrainerStats = async (req, res) => {
    const {trainerId} = req.params;

    if(!mongoose.Types.ObjectId.isValid(trainerId)) {
        return res.status(400).json({error: "ID de entrenador inválido."});
    }

    const trainer = await User.findById(trainerId);
    if(!trainer || trainer.role !== 'trainer'){
        return res.status(404).json({error: "Entrenador no encontrado."});
    }

    try {
        const views = trainer.views || 0;

        const contracts = await Contract.find({trainer: trainerId, status: 'aceptado'});
        const totalContracts = contracts.length;

        const avgContractRate = views > 0 ? parseFloat(((totalContracts / views) * 100).toFixed(1)) : 0;

        const ratingStats = await Comment.aggregate([
            {$match: {trainer: new mongoose.Types.ObjectId.createFromHexString(trainerId)}},
            {$group: {_id: '$rating', count: {$sum: 1}}}
        ]);

        let totalRatings = 0;
        let sumRatings = 0;
        const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

        ratingStats.forEach(stat => {
            distribution[stat._id] = stat.count;
            totalRatings += stat.count;
            sumRatings += stat._id * stat.count;
        });

        const average = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

        return res.status(200).json({
            views,
            avgContractRate,
            ratings: {
                count: totalRatings,
                average: parseFloat(average),
                distribution
            }
        });
    } catch (err) {
        return res.status(500).json({error: "Error al obtener estadísticas del entrenador."})
    }
};

exports.getTrainerComments = async(req, res) => {
    const {trainerId} = req.params;

    try {
        const comments = await Comment.find({trainer: trainerId}).populate('client', 'name').sort({date: -1});

        if(!comments.length){
            return res.status(204).send();
        }

        const formatted = comments.map(comment => ({
            id: comment._id,
            clientName: comment.client.name,
            date: comment.date,
            text: comment.text,
            reply: comment.reply
        }));

        return res.status(200).json(formatted);
    } catch(err) {
        return res.status(500).json({error: "Error al obtener comentarios del entrenador"})
    }
};

exports.getPublicTrainerProfile = async (req, res) => {
    const {trainerId} = req.params;

    try {
        const trainer = await User.findById(trainerId);

        if(!trainer || trainer.role !== 'trainer') {
            return res.status(404).json({error: "No se encontro al entrendador"})
        }

        const contractCount = await Contract.countDocuments({
            service: {$in: await Service.find({trainer: trainerId}).distinct('_id')},
            status: {$in: ['aceptado', 'completado']}
        });

        const comments = await Comment.find({trainer: trainerId});
        const commentCount = comments.length;
        const avgRating = commentCount > 0 ? (comments.reduce((sum, c) => sum + c.rating, 0) / commentCount).toFixed(1) : null;

        const publishedServices = await Service.find({trainer: trainerId, status: 'publicado'}).select('title description price imageUrl rating');

        const profile = {
            name: `${trainer.firstName} ${trainer.lastName}`,
            bio: trainer.bio,
            specialties: trainer.specialties,
            location: trainer.location,
            profileImage: trainer.profileImage,
            averageRating: avgRating ? parseFloat(avgRating) : null,
            contractCount,
            commentCount,
            services: publishedServices
        };

        return res.status(200).json(profile);
    } catch(err) {
        return res.status(500).json({error: "Error al obtener el perfil público del entrenador"});
    }
};