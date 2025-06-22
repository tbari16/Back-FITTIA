const Contract = require('../models/Contract');
const Service = require('../models/Service');
const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

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

exports.createContract = async(req,res) => {
    const {serviceId, selectedSchedule} = req.body;
    const clientId = req.user.id;

    if(!serviceId || !Array.isArray(selectedSchedule) || selectedSchedule.length === 0){
        return res.status(400).json({error: "Faltan datos o formato inválido"});
    }

    try {
        const service = await Service.findById(serviceId).populate('trainer');
        if(!service) {
            return res.status(404).json({error: "Servicio no encontrado."});
        }

        const existing = await Contract.findOne({client: clientId, service: serviceId, status: {$ne:'cancelado'}});
        if(existing){
            return res.status(403).json({error: "Ya existe una contratación activa de este servicio."})
        }

        const newContract = new Contract({
            client: clientId,
            trainer: service.trainer._id,
            service: serviceId,
            selectedSchedule,
            status: 'pendiente'
        })

        await newContract.save();

        return res.status(201).json({
            contractId: newContract._id,
            status: newContract.status
        });
    } catch(err){
        return res.status(500).json({error: "Error al crear contrato"});
    }
    
};

exports.getContractById = async(req,res) => {
    const { contractId } = req.params;
    const userId = req.user.id;

    try {
        const contract = await Contract.findById(contractId).populate({path: 'service',select: 'title price',}).populate({path: 'trainer',select: 'firstName lastName',}).populate({path: 'client',select: '_id',});

        if (!contract) {
            return res.status(404).json({ error: 'Contrato no encontrado.' });
        }

        // Solo el cliente o el entrenador puede acceder
        if (contract.client._id.toString() !== userId && contract.trainer._id.toString() !== userId) {
            return res.status(403).json({ error: 'No tenés permiso para ver este contrato.' });
        }

        const response = {
            contractId: contract._id,
            service: {
                id: contract.service._id,
                title: contract.service.title,
                price: contract.service.price,
            },
            trainer: {
                id: contract.trainer._id,
                name: `${contract.trainer.firstName} ${contract.trainer.lastName}`,
            },
            schedule: contract.schedule || [],
            status: contract.status,
            remainingClasses: contract.remainingClasses || 0,
        };

        return res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Error del servidor.' });
    }
};

exports.cancelContract = async(req,res) => {
    const userId = req.user.id;
    const contractId = req.params.contractId;

    try {
        const contract = await Contract.findById(contractId);

        if (!contract) {
            return res.status(404).json({ error: 'Contrato no encontrado.' });
        }

        if (contract.client.toString() !== userId) {
            return res.status(403).json({ error: 'No tenés permiso para cancelar este contrato.' });
        }

        if (contract.status === 'cancelado') {
            return res.status(404).json({ error: 'El contrato ya fue cancelado.' });
        }

        contract.status = 'cancelado';
        await contract.save();

        res.status(200).json({ message: 'Contrato cancelado correctamente.' });
    } catch (err) {
        res.status(500).json({ error: 'Error al cancelar el contrato.' });
    }
};

exports.recontractContract = async(req, res) => {
    const userId = req.user.id;
    const { previousContractId } = req.body;

    try {
        const oldContract = await Contract.findById(previousContractId);

        if (!oldContract) {
            return res.status(404).json({ error: 'Contrato original no encontrado.' });
        }

        if (oldContract.client.toString() !== userId) {
            return res.status(403).json({ error: 'No tenés permiso para recontratar este servicio.' });
        }

        if (oldContract.status !== 'completado') {
            return res.status(400).json({ error: 'Solo se pueden recontratar servicios completados.' });
        }

        const newContract = new Contract({
            client: oldContract.client,
            trainer: oldContract.trainer,
            service: oldContract.service,
            selectedSchedule: oldContract.selectedSchedule,
            status: 'pendiente'
        });

        await newContract.save();

        res.status(201).json({
            newContractId: newContract._id,
            status: newContract.status
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al recontratar el servicio.' });
    }
};

exports.updateContractTime = async(req,res) => {
    const userId = req.user.id;
    const {contractId} = req.params;
    const {newSchedule} = req.body;

    if (!Array.isArray(newSchedule) || newSchedule.length === 0) {
        return res.status(400).json({ error: 'Horarios inválidos.' });
    }

    try {
        const contract = await Contract.findById(contractId);

        if (!contract) {
            return res.status(404).json({ error: 'Contrato no encontrado.' });
        }

        if (contract.client.toString() !== userId) {
            return res.status(403).json({ error: 'No autorizado para modificar este contrato.' });
        }

        if (contract.status !== 'aceptado') {
            return res.status(409).json({ error: 'No se puede modificar un contrato no aceptado.' });
        }

        contract.selectedSchedule = newSchedule;
        await contract.save();

        res.status(200).json({ message: 'Horarios actualizados correctamente.' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar los horarios.' });
    }
};

exports.updateContractStatus = async(req, res) => {
    const trainerId = req.user.id;
    const { contractId } = req.params;
    const { status } = req.body;

    if (!['aceptado', 'rechazado'].includes(status)) {
        return res.status(400).json({ error: 'Estado inválido.' });
    }

    try {
        const contract = await Contract.findById(contractId).populate('trainer');

        if (!contract) {
            return res.status(404).json({ error: 'Contrato no encontrado.' });
        }

        if (contract.trainer._id.toString() !== trainerId) {
            return res.status(403).json({ error: 'No sos el entrenador de este contrato.' });
        }

        if (contract.status !== 'pendiente') {
            return res.status(409).json({ error: 'El contrato no se encuentra en estado pendiente.' });
        }

        contract.status = status;
        await contract.save();

        res.status(200).json({ status });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el contrato.' });
    }
};

exports.uploadMaterial = async(req, res) => {
    const {contractId} = req.params;
    const {fileName} = req.body;
    const trainerId = req.user.id;

    if (!req.file || !fileName) {
        return res.status(400).json({ error: 'Archivo o nombre faltante.' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract || contract.status !== 'aceptado') {
        return res.status(404).json({ error: 'Contrato no válido.' });
    }

    if (contract.trainer.toString() !== trainerId) {
        return res.status(403).json({ error: 'No autorizado para subir material.' });
    }

    const material = await Material.create({
        contract: contractId,
        fileName,
        fileUrl: `/uploads/${req.file.filename}`
    });

    res.status(201).json({
        materialId: material._id,
        message: 'Material agregado correctamente.'
    });

}

exports.getContractMaterials = async(req, res) => {
    const contractId = req.params.contractId;
    const userId = req.user.id;

    try {
        const contract = await Contract.findById(contract);

        if(!contract) {
            return res.status(404).json({error: "Contrato no encontrado"});
        }

        const isOwner = contract.client.equals(userId) || contract.trainer.equals(userId);
        if(!isOwner){
            return res.status(403).json({error: "No estas autorizado para ver este contrato"});
        }

        const materials = await Material.find({ contract: contractId });

        const response = materials.map(mat => ({
            materialId: mat._id,
            fileName: mat.fileName,
            downloadUrl: mat.fileUrl
        }));

        return res.status(200).json(response);

    } catch(err) {
        return res.status(500).json({error: "Error al obtener los materiales."})
    }
};

exports.downloadMaterial = async(req, res) => {
    const materialId = req.params.materialId;
    const userId = req.user.id;

    try {
        const material = await Material.findById(materialId).populate('contract');

        if (!material) {
            return res.status(404).json({ error: 'Material no encontrado.' });
        }

        const contract = material.contract;

        // Verifica que el usuario sea el cliente o el entrenador
        if (!contract.client.equals(userId) && !contract.trainer.equals(userId)) {
            return res.status(403).json({ error: 'No estás autorizado para acceder a este material.' });
        }

        const filePath = path.join(__dirname, '..', material.fileUrl); // fileUrl = /uploads/archivo.pdf

        // Verifica si el archivo realmente existe en el sistema de archivos
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Archivo no encontrado en el servidor.' });
        }

        res.download(filePath, material.fileName); // descarga con nombre original
    } catch (err) {
        res.status(500).json({ error: 'Error al descargar el material.' });
    }
};