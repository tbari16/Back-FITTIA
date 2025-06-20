const Contract = require('../models/Contract');
const Service = require('../models/Service');

exports.getMyContracts = async(req, res) => {
    const userId = req.params.userId;

    if(userId !== req.user.id) {
        return res.status(403).json({error: "Acceso denegado"});
    }

    const contracts = await Contract.find({client: userId}).populate('service');

    if(!contracts.length){
        return res.status(204).send();
    }

    const response = contracts.map(contract => ({
        serviceId: contract.service._id,
        title: contract.service.title,
        description: contract.service.description,
        imageUrl: contract.service.imageUrl,
        trainer: contract.service.trainer,
        rating: contract.service.rating,
        status: contract.status
    }));

    res.status(200).json(response);
}
