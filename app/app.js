const express = require('express');
const path = require('path');
const { sequelize } = require('./models');
const paqueteRoutes = require('./routes/paqueteRoutes');
const opcionAlimentoRoutes = require('./routes/opcionAlimentoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const finanzaRoutes = require('./routes/finanzaRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const cookieParser = require('cookie-parser');
const categoriaRoutes = require('./routes/categoriaRoutes');
const tematicaRoutes = require('./routes/tematicaRoutes');
const extraRoutes = require('./routes/extraRoutes');
const mamparaRoutes = require('./routes/mamparaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const fs = require('fs');
const cors = require('cors');

const app = express();

require('dotenv').config();

app.use(express.json());

// Enable CORS with environment variable
app.use(
    cors({
        origin: process.env.FRONTEND_URL, // Utiliza la URL del frontend desde el .env
        credentials: true,
    })
);

//Script de producción

// app.use(express.static(path.join(__dirname, 'client/build')));
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname + '/client/build/index.html'));
// }
// );

// Mover cookieParser antes de las rutas
app.use(cookieParser());

// Crear el directorio 'uploads' si no existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Definir tus rutas
app.use('/api/paquetes', paqueteRoutes);
app.use('/api/usuarios', authMiddleware, usuarioRoutes);
app.use('/api/finanzas', authMiddleware, finanzaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservas', authMiddleware, reservaRoutes);
app.use('/api/opciones-alimentos', opcionAlimentoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/tematicas', tematicaRoutes);
app.use('/api/extras', extraRoutes);
app.use('/api/mamparas', mamparaRoutes);
app.use('/api/pagos', authMiddleware, pagoRoutes);

// Manejar solicitudes preflight
app.options('*', cors());

// Sincronizar la base de datos
sequelize
    .sync({ force: false })
    .then(() => {
        console.log('Conexión a la base de datos establecida y modelos sincronizados.');
    })
    .catch((err) => {
        console.error('Error al sincronizar con la base de datos:', err);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
