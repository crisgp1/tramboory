const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function runMigration() {
  try {
    // Añadir columna cantidad a la tabla ReservaExtras
    await sequelize.query(`
      ALTER TABLE ReservaExtras 
      ADD COLUMN cantidad INT NOT NULL DEFAULT 1;
    `, { type: QueryTypes.RAW });

    console.log('Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
    process.exit(1);
  }
}

runMigration();