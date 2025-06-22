const Comment = require('../models/Comment');
const Contract = require('../models/Contract');
const User = require('../models/User');

exports.replyToComment = async(req,res) => {
    const {commentId} = req.params;
    const {reply} = req.body;
    const userId = req.user.id;

    if(!reply || reply.length > 500) {
        return res.status(400).json({error: "Texto inválido o muy largo."})
    }

    try {
        const comment = await Comment.findById(commentId).populate('trainer');

        if(!comment) {
            return res.status(404).json({error: "Comentario no encontrado."})
        }

        comment.reply = reply;
        await comment.save();

        return res.status(200).json({message: "Respuesta enviada correctamente."})
    } catch(err) {
        return res.status(500).json({error: "Error al responder el comentario."})
    }
};

exports.addComment = async (req, res) => {
    try{
        const trainerId = req.params.trainerId;
        const clientId = req.user.id;
        const {text} = req.body;

        if(!text || text.length > 500) {
            return res.status(400).json({error: "Comentario inválido"});
        }

        const trainer = await User.findById(trainerId);
        if(!trainer || trainer.role !== 'trainer') {
            return res.status(404).json({error: "Entrenador no ecnontrado"});
        }

        const contract = await Contract.findOne({
            client: clientId,
            status: 'aceptado'
        }).populate('service');

        if(!contract || contract.service.trainer.toString() !== trainerId) {
            return res.status(403).json({error: "No encontrado"});
        }

        const existing = await Comment.findOne({client: clientId, trainer: trainerId});
        if (existing && existing.text) {
            return res.status(400).json({error:"Ya comentaste al entrenador"})
        }

        if(existing) {
            existing.text = text;
            await existing.save();
            return res.status(201).json({commentId: existing._id, message: "Comentario publicado correctamente."});
        }

        const comment = new Comment({
            client: clientId,
            trainer: trainerId,
            text
        });

        await comment.save();
        return res.status(201).json({
            commentId: comment._id,
            message: "comentario publicado correctamente"
        });
    } catch(err) {
        res.status(500).json({error:"Error interno"});
    }
};
