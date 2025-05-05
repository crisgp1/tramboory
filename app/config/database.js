require('dotenv').config();
const { Sequelize } = require('sequelize');

// Obtener el searchPath como array de los schemas
const schemas = process.env.SCHEMAS ? process.env.SCHEMAS.split(',') : ['main', 'usuarios', 'finanzas', 'inventario', 'public'];
const defaultSchema = process.env.SCHEMA || 'main';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'production' ? false : console.log, // Solo habilitamos logging en desarrollo
    timezone: '-06:00', // Configuración explícita de timezone para Ciudad de México
    dialectOptions: {
      useUTC: false, // Deshabilitar el uso de UTC
      dateStrings: true,
      typeCast: true,
      connectTimeout: 60000 // Aumentar timeout de conexión a 60 segundos
    },
    // Configuración mejorada del pool de conexiones
    pool: {
      max: 10,         // Aumentamos el máximo de conexiones
      min: 2,          // Mantenemos algunas conexiones mínimas
      acquire: 60000,  // Aumentamos el tiempo para adquirir una conexión (60 segundos)
      idle: 30000,     // Aumentamos el tiempo de inactividad (30 segundos)
      evict: 30000     // Verificar conexiones cada 30 segundos
    },
    // Añadir lógica de reintento para fallos de conexión
    retry: {
      max: 5,          // Máximo de intentos de reconexión
      timeout: 10000   // Tiempo entre reintentos (10 segundos)
    },
    define: {
      schema: defaultSchema // Schema por defecto para modelos sin schema específico
    },
    hooks: {
      afterConnect: async (connection) => {
        try {
          // Establecer el search_path para incluir todos los schemas
          const searchPathStr = schemas.join(', ');
          await connection.query(`SET search_path TO ${searchPathStr};`);
          console.log(`Search path establecido correctamente: ${searchPathStr}`);
          
          // Configurar el usuario actual para los triggers de auditoría
          await connection.query(`
            DO $$ 
            BEGIN 
              IF NOT EXISTS (SELECT 1 FROM pg_settings WHERE name = 'app.id_usuario_actual') THEN
                PERFORM set_config('app.id_usuario_actual', '0', false);
              END IF;
            END $$;
          `);
          console.log('Variable de usuario actual configurada');
        } catch (error) {
          console.error('Error al configurar la conexión:', error);
        }
      }
    }
  }
);

// Función para probar la conexión a la base de datos
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    return false;
  }
}

// Exportar tanto sequelize como la función de prueba
module.exports = sequelize;
module.exports.testConnection = testConnection;