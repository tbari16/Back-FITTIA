const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getNotifications = async(req, res) => {
    const userId = req.user.id;
    const { read, limit } = req.query;

    try {
        const query = { recipient: userId };
        if (read === 'false') query.read = false;

        const notifications = await Notification.find(query).sort({ timestamp: -1 }).limit(Number(limit) || 50);

        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
};

exports.markAsRead = async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }

        if (notification.recipient.toString() !== userId) {
            return res.status(403).json({ error: 'No sos el dueño de esta notificación' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ message: 'Notificación actualizada correctamente.' });
    } catch (err) {
        res.status(500).json({ error: 'Error al marcar como leída la notificación' });
    }
};

exports.createNotification = async (req, res) => {
    const { recipientUserId, message, redirectUrl } = req.body;

    if (!recipientUserId || !message) {
        return res.status(400).json({ error: 'Campos obligatorios faltantes.' });
    }

    try {
        const userExists = await User.findById(recipientUserId);
        if (!userExists) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const newNotification = new Notification({
            recipient: recipientUserId,
            message,
            redirectUrl: redirectUrl || null
        });

        await newNotification.save();

        return res.status(201).json({
            notificationId: newNotification._id,
            message: 'Notificación creada correctamente.'
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error al crear la notificación.' });
    }
};