const express = require('express');
const path = require('path');
const { sequelize } = require('./models');
const paqueteRoutes = require('./routes/paqueteRoutes');
const opcionAlimentoRoutes = require('./routes/opcionAlimentoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const personalizacionRoutes = require('./routes/personalizacionRoutes');
const finanzaRoutes = require('./routes/finanzaRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const cookieParser = require('cookie-parser');
const categoriaRoutes = require('./routes/categoriaRoutes');
const fs = require('fs');

const app = express();

require('dotenv').config();

app.use(express.json());

// Crear el directorio 'uploads' si no existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/paquetes', paqueteRoutes);
app.use('/api/usuarios', authMiddleware, usuarioRoutes);
app.use('/api/finanzas', authMiddleware, finanzaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservas', authMiddleware, reservaRoutes);
app.use('/api/personalizaciones', authMiddleware, personalizacionRoutes);
app.use('/api/opciones-alimentos', opcionAlimentoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use(cookieParser());

sequelize.sync({force: false})
    .then(() => {
        console.log('Conexión a la base de datos establecida y modelos sincronizados.');
    })
    .catch(err => {
        console.error('Error al sincronizar con la base de datos:', err);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;