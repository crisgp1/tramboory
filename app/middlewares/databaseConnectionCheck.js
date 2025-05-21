const sequelize = require('../config/database');

// Variables para tracking de intentos de reconexión
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let lastReconnectTime = null;
let connectionRestored = true; // Inicialmente asumimos que la conexión está bien

module.exports = async (req, res, next) => {
  try {
    // Si la última reconexión fue exitosa, reseteamos el contador de intentos
    if (connectionRestored) {
      reconnectAttempts = 0;
    }

    // Verificar si la base de datos está conectada
    await sequelize.authenticate();
    
    // Si llegamos aquí, la conexión está bien
    if (!connectionRestored) {
      console.log('Conexión a la base de datos restaurada después de fallo previo');
      connectionRestored = true;
    }
    
    // Añadir estado de conexión al objeto res para uso en controladores
    res.locals.dbConnectionStatus = {
      connected: true,
      lastReconnectAttempt: lastReconnectTime
    };
    
    next();
  } catch (error) {
    console.error('Error de conexión a la base de datos en middleware:', error);
    connectionRestored = false;
    
    // Verificar si debemos intentar reconectar basado en intentos previos
    const shouldAttemptReconnect = reconnectAttempts < MAX_RECONNECT_ATTEMPTS;
    
    // Registrar intento de reconexión
    reconnectAttempts++;
    lastReconnectTime = new Date();
    
    // Intentar reconectar si no hemos excedido el límite de intentos
    if (shouldAttemptReconnect) {
      try {
        console.log(`Intento de reconexión #${reconnectAttempts} de ${MAX_RECONNECT_ATTEMPTS}`);
        
        // Forzar cierre de pools existentes si hay errores persistentes
        if (reconnectAttempts > 2) {
          await sequelize.connectionManager.close();
        }
        
        // Inicializar nuevos pools
        await sequelize.connectionManager.initPools();
        
        // Si llegamos aquí, la conexión se restableció
        console.log('Conexión a la base de datos restablecida con éxito');
        connectionRestored = true;
        
        // Añadir estado de conexión al objeto res
        res.locals.dbConnectionStatus = {
          connected: true,
          reconnected: true,
          attempts: reconnectAttempts,
          lastReconnectAttempt: lastReconnectTime
        };
        
        next();
      } catch (reconnectError) {
        console.error(`Falló el intento de reconexión #${reconnectAttempts}:`, reconnectError);
        
        // Añadir estado de conexión al objeto res
        res.locals.dbConnectionStatus = {
          connected: false,
          attempts: reconnectAttempts,
          maxAttempts: MAX_RECONNECT_ATTEMPTS,
          lastReconnectAttempt: lastReconnectTime
        };
        
        // Si es una solicitud de verificación de salud, devolver estado sin error 500
        if (req.path.includes('/health')) {
          return res.status(200).json({
            connected: false,
            status: 'error',
            message: 'Error de conexión a la base de datos',
            reconnection: {
              attempts: reconnectAttempts,
              maxAttempts: MAX_RECONNECT_ATTEMPTS,
              lastAttempt: lastReconnectTime
            }
          });
        }
        
        return res.status(503).json({
          error: 'Servicio de base de datos no disponible. Por favor, intente más tarde.',
          details: 'El sistema está experimentando problemas de conectividad con la base de datos.',
          reconnection: {
            inProgress: reconnectAttempts < MAX_RECONNECT_ATTEMPTS,
            attempts: reconnectAttempts,
            maxAttempts: MAX_RECONNECT_ATTEMPTS
          }
        });
      }
    } else {
      console.error(`Excedido el número máximo de intentos de reconexión (${MAX_RECONNECT_ATTEMPTS})`);
      
      // Si es una solicitud de verificación de salud, devolver estado sin error 500
      if (req.path.includes('/health')) {
        return res.status(200).json({
          connected: false,
          status: 'error',
          message: 'Conexión a la base de datos no disponible después de múltiples intentos',
          reconnection: {
            attempts: reconnectAttempts,
            maxAttempts: MAX_RECONNECT_ATTEMPTS,
            lastAttempt: lastReconnectTime
          }
        });
      }
      
      return res.status(503).json({
        error: 'Servicio de base de datos no disponible después de múltiples intentos de reconexión.',
        details: 'Por favor, contacte al administrador del sistema.',
        reconnection: {
          attempts: reconnectAttempts,
          maxAttempts: MAX_RECONNECT_ATTEMPTS,
          lastAttempt: lastReconnectTime
        }
      });
    }
  }
};