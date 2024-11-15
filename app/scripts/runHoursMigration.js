const sequelize = require('../config/database');

async function runMigration() {
  try {
    console.log('Iniciando migración de horas...');
    console.log('Conectando a la base de datos...');
    
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    const queryInterface = sequelize.getQueryInterface();
    
    console.log('Ejecutando migración...');
    
    // Primero eliminamos la columna hora_inicio existente
    await queryInterface.removeColumn('Reservas', 'hora_inicio');
    console.log('Columna hora_inicio eliminada.');
    
    // Agregamos la nueva columna hora_inicio como TIME
    await queryInterface.addColumn('Reservas', 'hora_inicio', {
      type: sequelize.Sequelize.TIME,
      allowNull: false,
      defaultValue: '11:00:00'
    });
    console.log('Nueva columna hora_inicio agregada.');
    
    // Agregamos la nueva columna hora_fin
    await queryInterface.addColumn('Reservas', 'hora_fin', {
      type: sequelize.Sequelize.TIME,
      allowNull: false,
      defaultValue: '16:00:00'
    });
    console.log('Nueva columna hora_fin agregada.');

    console.log('Migración completada exitosamente.');
    
    await sequelize.close();
    console.log('Conexión cerrada.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

runMigration();