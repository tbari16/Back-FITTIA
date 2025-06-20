const Service = require ('../models/Service');

exports.getAllPublishedServices = async (req, res) => {
    try {
        const services = await Service.find({ status: 'publicado'})

        if(services.length === 0) {
            return res.status(204).send(); // Esto es que no hay contenido
        }

        const response = services.map(service => ({
            id: service._id,
            title: service.title,
            description: service.description,
            price: service.price,
            imageUrl: service.imageUrl,
            rating: service.rating,
            trainer: {
                id: service.trainer.id,
                name: service.trainer.name
            }
        }));

        res.status(200).json(response);
    } catch(err){
        res.status(500).json({error: "Error para obtener datos del servidor"});
    }
};