require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: console.log, // Habilitamos logging temporalmente para debug
    timezone: '-06:00', // Configuración explícita de timezone para Ciudad de México
    dialectOptions: {
      useUTC: false, // Deshabilitar el uso de UTC
      dateStrings: true,
      typeCast: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      schema: process.env.SCHEMA // Agregamos el schema por defecto
    },
    hooks: {
      afterConnect: async (connection) => {
        try {
          // Establecer el search_path
          await connection.query(`SET search_path TO ${process.env.SCHEMA}, public;`);
          console.log('Search path establecido correctamente');
          
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

module.exports = sequelize;