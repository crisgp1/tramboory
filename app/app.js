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
const galeriaHomeRoutes = require('./routes/galeriaHomeRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const fs = require('fs');
const cors = require('cors');

const app = express();

require('dotenv').config();

app.use(express.json());

// Enable CORS with multiple origins support
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:80',
    'http://localhost:5173', // Vite development server
    'http://localhost:3000'  // Optional: React default development server
];

app.use(
    cors({
        origin: function(origin, callback) {
            // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                console.log(`Origin ${origin} not allowed by CORS`);
                callback(null, false);
            }
        },
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
app.use('/api/galeria-home', auditMiddleware, galeriaHomeRoutes);

// Manejar solicitudes preflight
app.options('*', cors());

// Middleware global de manejo de errores (debe ir después de todas las rutas)
app.use(errorHandler);

// Sincronizar la base de datos
const { runMigrations } = require('./utils/dbMigrations');

const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        
        // Ejecutar las migraciones SQL
        await runMigrations();
        console.log('Migraciones SQL ejecutadas correctamente.');
        
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
