const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const models = require('./models'); // Importar todos los modelos y sus asociaciones
const paqueteRoutes = require('./routes/paqueteRoutes');
const opcionAlimentoRoutes = require('./routes/opcionAlimentoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const finanzaRoutes = require('./routes/finanzaRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const auditMiddleware = require('./middlewares/auditMiddleware');
const cookieParser = require('cookie-parser');
const categoriaRoutes = require('./routes/categoriaRoutes');
const tematicaRoutes = require('./routes/tematicaRoutes');
const extraRoutes = require('./routes/extraRoutes');
const mamparaRoutes = require('./routes/mamparaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');
const fs = require('fs');
const cors = require('cors');

const app = express();

require('dotenv').config();

app.use(express.json());

// Enable CORS with environment variable
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(cookieParser());

// Crear el directorio 'uploads' si no existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas públicas (sin autenticación ni auditoría)
app.use('/api/auth', authRoutes);

// Aplicar middleware de autenticación y auditoría para rutas protegidas
const protectedRoute = (route) => {
    return [authMiddleware, auditMiddleware, route];
};

// Definir rutas protegidas
app.use('/api/usuarios', protectedRoute(usuarioRoutes));
app.use('/api/finanzas', protectedRoute(finanzaRoutes));
app.use('/api/reservas', protectedRoute(reservaRoutes));
app.use('/api/pagos', protectedRoute(pagoRoutes));
app.use('/api/auditoria', protectedRoute(auditoriaRoutes));

// Rutas semi-protegidas (solo auditoría)
app.use('/api/paquetes', auditMiddleware, paqueteRoutes);
app.use('/api/opciones-alimentos', auditMiddleware, opcionAlimentoRoutes);
app.use('/api/categorias', auditMiddleware, categoriaRoutes);
app.use('/api/tematicas', auditMiddleware, tematicaRoutes);
app.use('/api/extras', auditMiddleware, extraRoutes);
app.use('/api/mamparas', auditMiddleware, mamparaRoutes);

// Manejar solicitudes preflight
app.options('*', cors());

// Sincronizar la base de datos
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        
        // Crear el esquema si no existe
        await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.SCHEMA}`);
        console.log('Esquema verificado correctamente.');

        // Crear los tipos ENUM si no existen
        await sequelize.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_usuarios_tipo_usuario') THEN
                    CREATE TYPE ${process.env.SCHEMA}.enum_usuarios_tipo_usuario AS ENUM ('cliente', 'admin');
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reservas_estado') THEN
                    CREATE TYPE ${process.env.SCHEMA}.enum_reservas_estado AS ENUM ('pendiente', 'confirmada', 'cancelada');
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_finanzas_tipo') THEN
                    CREATE TYPE ${process.env.SCHEMA}.enum_finanzas_tipo AS ENUM ('ingreso', 'gasto');
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_pagos_estado') THEN
                    CREATE TYPE ${process.env.SCHEMA}.enum_pagos_estado AS ENUM ('pendiente', 'completado', 'fallido');
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_turno') THEN
                    CREATE TYPE ${process.env.SCHEMA}.enum_turno AS ENUM ('manana', 'tarde', 'ambos');
                END IF;
            END $$;
        `);
        console.log('Tipos ENUM verificados correctamente.');
        
        // Sincronizar los modelos
        await sequelize.sync({ force: false });
        console.log('Modelos sincronizados correctamente.');
    } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
        process.exit(1);
    }
};

// Iniciar el servidor después de sincronizar la base de datos
const startServer = async () => {
    await initializeDatabase();
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
};

startServer();

module.exports = app;
