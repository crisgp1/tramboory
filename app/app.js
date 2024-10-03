const express = require('express');
const {sequelize} = require('./models');
const paqueteRoutes = require('./routes/paqueteRoutes');
const opcionAlimentoRoutes = require('./routes/opcionAlimentoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const personalizacionRoutes = require('./routes/personalizacionRoutes');
const finanzaRoutes = require('./routes/finanzaRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const cookieParser = require('cookie-parser');

const app = express();

require('dotenv').config();

app.use(express.json());

app.use('/api/paquetes', paqueteRoutes);
app.use('/api/usuarios', authMiddleware, usuarioRoutes);
app.use('/api/finanzas', authMiddleware, finanzaRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/reservas', authMiddleware, reservaRoutes);
app.use('/api/personalizaciones', authMiddleware, personalizacionRoutes);
app.use('/api/opciones-alimentos', opcionAlimentoRoutes);
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
    console.log();
});

module.exports = app;