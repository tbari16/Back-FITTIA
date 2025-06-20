const User = require('../models/User');

exports.getMyServices = async (req,res) => {
    const {userId} = req.params;

    if(req.user.id !== userId){
        return res.status(401).json({error: "No autorizado"});
    }

    const user = await User.findById(userId).populate('contractedServices.serviceId');

    if(!user || user.contractedServices.length === 0){
        return res.status(204).send();
    }

    const response = user.contractedServices.map(entry => ({
        serviceId: entry.serviceId._id,
        title: entry.serviceId.title,
        description: entry.serviceId.description,
        imageUrl: entry.serviceId.imageUrl,
        trainer: entry.serviceId.trainer,
        rating: entry.rating,
        status: entry.status
    }));

    res.status(200).json(response);
}
