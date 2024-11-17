const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Primero verificamos si la columna hora_fin existe
      const tableInfo = await queryInterface.describeTable('Reservas');
      
      // Modificar hora_inicio a TIME
      await queryInterface.changeColumn('Reservas', 'hora_inicio', {
        type: DataTypes.TIME,
        allowNull: false
      });

      // Solo añadir hora_fin si no existe
      if (!tableInfo.hora_fin) {
        await queryInterface.addColumn('Reservas', 'hora_fin', {
          type: DataTypes.TIME,
          allowNull: false
        });
      }
    } catch (error) {
      console.error('Error en la migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Revertir hora_inicio a ENUM
      await queryInterface.changeColumn('Reservas', 'hora_inicio', {
        type: DataTypes.ENUM('mañana', 'tarde'),
        allowNull: true
      });

      // Intentar eliminar hora_fin si existe
      const tableInfo = await queryInterface.describeTable('Reservas');
      if (tableInfo.hora_fin) {
        await queryInterface.removeColumn('Reservas', 'hora_fin');
      }
    } catch (error) {
      console.error('Error en la migración down:', error);
      throw error;
    }
  }
};