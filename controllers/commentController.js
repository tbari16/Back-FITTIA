const Comment = require('../models/Comment');

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
