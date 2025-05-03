const express = require('express');
const path = require('path');
const http = require('http');
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
const inventoryRoutes = require('./routes/inventory');
const errorHandler = require('./middlewares/errorMiddleware');
const fs = require('fs');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

require('dotenv').config();

// Enable CORS with multiple origins support
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:80',
    'http://localhost:5173', // Vite development server
    'http://localhost:3000'  // Optional: React default development server
];

// Crear instancia de Socket.IO
const io = new Server(server, {
    cors: {
        origin: function(origin, callback) {
            // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                callback(null, true);
            } else {
                console.log(`Origin ${origin} not allowed by CORS for Socket.IO`);
                callback(null, false);
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Exportar io para que pueda ser utilizado en otros archivos
global.io = io;

// Configurar eventos de Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

app.use(express.json());

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
app.use('/api/inventory', protectedRoute(inventoryRoutes));

// Manejar solicitudes preflight
app.options('*', cors());

// Middleware global de manejo de errores (debe ir después de todas las rutas)
app.use(errorHandler);

// Sincronizar la base de datos
const { runMigrations } = require('./utils/dbMigrations');
const initializeDatabase = async () => {
    try {
        // Primer intento de conexión
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');
        
        // Ejecutar las migraciones SQL con mejor manejo de errores
        try {
            await runMigrations();
            console.log('Migraciones SQL ejecutadas correctamente.');
        } catch (migrationError) {
            console.error('Error durante las migraciones, pero continuando:', migrationError.message);
            // Continuamos a pesar del error en migraciones
        }
        
        // Sincronizar los modelos con {force: false} para no sobrescribir datos
        await sequelize.sync({ force: false });
        console.log('Modelos sincronizados correctamente.');
    } catch (err) {
        console.error('Error al conectar con la base de datos:', err);
        
        // Si no estamos en producción, ayuda para desarrolladores
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n--- SUGERENCIAS PARA RESOLVER EL PROBLEMA ---');
            console.log('1. Asegúrate de que PostgreSQL esté corriendo');
            console.log('2. Verifica las credenciales en el archivo .env');
            console.log('3. Verifica que la base de datos "tramboory_db" exista');
            console.log('4. Si usas Docker, asegúrate de que los contenedores estén corriendo');
            console.log('   - Ejecuta: docker ps');
            console.log('   - Para iniciar los servicios: ./start-docker.sh');
        }
        
        process.exit(1);
    }
};

// Iniciar el servidor después de sincronizar la base de datos
const startServer = async () => {
    await initializeDatabase();
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
        console.log(`Socket.IO configurado y escuchando`);
    });
};

startServer();

module.exports = app;
