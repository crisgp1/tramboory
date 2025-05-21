const sequelize = require('../config/database');
const os = require('os');

/**
 * Controlador para verificar el estado de salud de los servicios
 * Este controlador ahora aprovecha la información mejorada del middleware de conexión a la base de datos
 */
exports.checkDatabaseConnection = async (req, res) => {
  try {
    // El middleware databaseConnectionCheck ya ha hecho la verificación y ha añadido el estado a res.locals
    const dbStatus = res.locals.dbConnectionStatus || { connected: false };
    
    // Obtener información adicional del pool de conexiones
    const connectionPoolInfo = {
      size: sequelize.connectionManager.pool ? {
        total: sequelize.connectionManager.pool.size,
        available: sequelize.connectionManager.pool.available,
        pending: sequelize.connectionManager.pool.pending
      } : 'Pool no inicializado'
    };
    
    // Respuesta con información detallada
    res.json({
      connected: dbStatus.connected,
      status: dbStatus.connected ? 'healthy' : 'unhealthy',
      reconnection: dbStatus.reconnected ? {
        successful: true,
        attempts: dbStatus.attempts,
        lastAttempt: dbStatus.lastReconnectAttempt
      } : dbStatus.lastReconnectAttempt ? {
        successful: false,
        attempts: dbStatus.attempts,
        maxAttempts: dbStatus.maxAttempts,
        lastAttempt: dbStatus.lastReconnectAttempt
      } : null,
      connectionPool: connectionPoolInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al verificar la conexión a la base de datos:', error);
    res.status(500).json({
      connected: false,
      status: 'error',
      error: 'Error al verificar la conexión a la base de datos',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Verificación general de salud del sistema
 * Ahora incluye métricas del sistema y estado detallado de base de datos
 */
exports.checkHealth = async (req, res) => {
  try {
    // El middleware databaseConnectionCheck ya ha hecho la verificación y ha añadido el estado a res.locals
    const dbStatus = res.locals.dbConnectionStatus || { connected: false };
    
    // Obtener información del sistema
    const systemInfo = {
      uptime: Math.floor(process.uptime()),
      memory: {
        total: Math.round(os.totalmem() / (1024 * 1024)),
        free: Math.round(os.freemem() / (1024 * 1024)),
        usage: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
      },
      cpu: os.loadavg()
    };
    
    // Respuesta con información detallada
    res.json({
      status: dbStatus.connected ? 'ok' : 'degraded',
      services: {
        database: {
          connected: dbStatus.connected,
          status: dbStatus.connected ? 'healthy' : 'unhealthy',
          reconnection: dbStatus.attempts ? {
            attempts: dbStatus.attempts,
            maxAttempts: dbStatus.maxAttempts || 5,
            lastAttempt: dbStatus.lastReconnectAttempt
          } : null
        },
        api: {
          status: 'healthy'
        }
        // Otros servicios pueden añadirse aquí
      },
      system: systemInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al verificar la salud del sistema:', error);
    res.status(500).json({
      status: 'error',
      error: 'Error al verificar la salud del sistema',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Nueva ruta para intentar reconexión manual a la base de datos
 * Útil para administradores o en casos de fallos prolongados
 */
exports.attemptDatabaseReconnection = async (req, res) => {
  try {
    console.log('Intentando reconexión manual a la base de datos...');
    
    // Cerrar pools existentes
    await sequelize.connectionManager.close();
    
    // Reinicializar pools
    await sequelize.connectionManager.initPools();
    
    // Probar la conexión
    await sequelize.authenticate();
    
    console.log('Reconexión manual exitosa');
    
    res.json({
      success: true,
      message: 'Reconexión a la base de datos exitosa',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en reconexión manual a la base de datos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al intentar reconexión manual',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
};