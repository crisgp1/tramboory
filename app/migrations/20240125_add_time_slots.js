'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, remove the ENUM constraint from hora_inicio
    await queryInterface.sequelize.query('ALTER TABLE "Reservas" DROP CONSTRAINT IF EXISTS "Reservas_hora_inicio_check"');

    // Change hora_inicio to TIME type
    await queryInterface.changeColumn('Reservas', 'hora_inicio', {
      type: Sequelize.TIME,
      allowNull: false
    });

    // Add hora_fin column
    await queryInterface.addColumn('Reservas', 'hora_fin', {
      type: Sequelize.TIME,
      allowNull: false,
      defaultValue: '16:00:00' // Default to afternoon end time
    });

    // Update existing records
    await queryInterface.sequelize.query(`
      UPDATE "Reservas"
      SET hora_inicio = 
        CASE 
          WHEN hora_inicio = 'mañana' THEN '11:00:00'
          WHEN hora_inicio = 'tarde' THEN '17:00:00'
          ELSE '11:00:00'
        END,
      hora_fin = 
        CASE 
          WHEN hora_inicio = 'mañana' THEN '16:00:00'
          WHEN hora_inicio = 'tarde' THEN '22:00:00'
          ELSE '16:00:00'
        END
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove hora_fin column
    await queryInterface.removeColumn('Reservas', 'hora_fin');

    // Convert hora_inicio back to ENUM type
    await queryInterface.sequelize.query(`
      UPDATE "Reservas"
      SET hora_inicio = 
        CASE 
          WHEN hora_inicio::time = '11:00:00' THEN 'mañana'
          WHEN hora_inicio::time = '17:00:00' THEN 'tarde'
          ELSE 'mañana'
        END
    `);

    await queryInterface.changeColumn('Reservas', 'hora_inicio', {
      type: Sequelize.ENUM('mañana', 'tarde'),
      allowNull: true
    });
  }
};