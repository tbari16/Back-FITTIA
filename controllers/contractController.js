const Contract = require('../models/Contract');
const Service = require('../models/Service');

exports.getMyContracts = async(req, res) => {
    const userId = req.user.id;

    const contracts = await Contract.find({client: userId}).populate({
        path: 'service',
        populate: { path: 'trainer', select: 'name' }
    });

    if(!contracts.length){
        return res.status(204).send();
    }

    const response = contracts.map(contract => ({
        serviceId: contract.service._id,
        title: contract.service.title,
        description: contract.service.description,
        imageUrl: contract.service.imageUrl,
        trainer: {
            id: contract.service.trainer._id,
            name: contract.service.trainer.name
        },
        rating: contract.service.rating,
        status: contract.status
    }));

    res.status(200).json(response);
}
