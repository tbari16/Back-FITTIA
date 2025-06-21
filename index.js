const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/fittia')
    .then(() => console.log("Conectado a MongoDB"))
    .catch(err => console.error("Error al conectar a MongoDB: ", err));

// Rutas
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes);

// Servicios
const serviceRouter = require('./routes/service.routes');
app.use('/api/v1/services', serviceRouter);

const contractRoutes = require('./routes/contract.routes');
app.use('/api/v1', contractRoutes);

const trainerRoutes = require('./routes/trainer.routes');
app.use('/api/v1/trainers', trainerRoutes);

const commentsRoutes = require('./routes/comment.routes');
app.use('/api/v1/comments', commentsRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
