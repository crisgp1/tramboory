const { Sequelize } = require('sequelize');
const path = require('path');
const migration = require('../migrations/20240316_update_reserva_hours');
const sequelize = require('../config/database');

async function runMigration() {
  try {
    console.log('Iniciando migración para actualizar los campos de hora...');
    
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('Migración completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
    process.exit(1);
  }
}

runMigration();