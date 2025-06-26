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

exports.searchServices = async (req, res) => {
    try {
        const {category, minPrice, maxPrice, duration, location, language, rating, mode} = req.query;

        const filters = {status: 'publicado'};

        if (category) filters.category = category;
        if (location) filters.location = location;
        if (language) filters.language = language;
        if (mode) filters.mode = mode;
        if (duration) filters.duration = Number(duration);
        if (rating) filters.rating = { $gte: Number(rating) };

        if (minPrice || maxPrice) {
            filters.price = {};
            if(minPrice) filters.price.$gte = Number(minPrice);
            if(maxPrice) filters.price.$lte = Number(maxPrice);
        }

        const results = await Service.find(filters).populate('trainer', 'name');

        if(results.length === 0) {
            return res.status(204).send(); // no existen servicios
        }

        const response = results.map(service => ({
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

    } catch(error) {
        res.status(400).json({error: "Filtros inválidos"});
    }
}

exports.getTrainerServices = async(req, res) => {
    const trainerId = req.params.trainerId;

    if(trainerId !== req.user.id.toString()){
        return res.status(403).json({error: "Acceso denegado."})
    }

    try {
        const services = await Service.find({trainer: trainerId});

        if(!services.length) return res.status(204).send();

        const response = services.map(service => ({
            id: service._id,
            title: service.title,
            description: service.description,
            status: service.status
        }));

        res.status(200).json(response);
    } catch(err){
        return res.status(500).json({error: "Error al buscar los servicios"});
    }
};

exports.createService = async(req,res) => {
    try {
        const {title, description, price, duration, location, language, mode, category, sessionPerWeek, intensity, status, imageUrl} = req.body;

        if(!title || !description || !price || !duration || !location || !language || !mode || !category || !sessionPerWeek || !intensity || !status || !imageUrl) {
            return res.status(400).json({error: "Faltan campos obligatorios."});
        }

        const newService = new Service({
            title,
            description,
            price,
            duration,
            location,
            language,
            mode,
            category,
            sessionPerWeek,
            intensity,
            status: status || 'borrador',
            imageUrl,
            trainer: {
                id: req.user.id,
                name: req.user.name
            }
        });

        const saved = await newService.save();

        res.status(201).json({
            id:saved._id,
            title: saved.title,
            status: saved.status
        });
    } catch(err) {
        console.log("Error en: ", err)
        res.status(500).json({error: "Error al crear el servicio"});
    }
};

exports.updateServiceStatus = async (req, res) => {
    const {serviceId} = req.params;
    const {status} = req.body;

    if(!['publicado', 'borrador'].includes(status)){
        return res.status(400).json({error: "Estado inválido."});
    }

    try {
        const service = await Service.findById(serviceId);

        if(!service){
            return res.status(404).json({error: 'Servicio no encontrado'});
        }

        if(service.trainer.id !== req.user.id){
            return res.status(403).json({error: 'No tenes permiso sobre este servicio'});
        }

        service.status = status;
        await service.save();

        res.status(200).json({message: `Servicio actualizado a estado ${status}.`})
    } catch(err){
        res.status(500).json({error: "Error al actualizar el estado del servicio"})
    }
}

exports.deleteService = async(req, res) => {
    const {serviceId} = req.params;

    try {
        const service = await Service.findById(serviceId);

        if(!service){
            return res.status(404).json({error: "No se encontró el servicio."});
        }

        if(service.trainer.id !== req.user.id) {
            return res.status(403).json({error: "No tienes permiso para eliminar el servicio."});
        }

        await service.deleteOne();

        res.status(204).send();
    } catch(err){
        res.status(500).json({error: "Error al intentar eliminar el servicio."})
    }
};