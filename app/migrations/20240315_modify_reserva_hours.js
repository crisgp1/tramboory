const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Reservas', 'hora_inicio');
    
    await queryInterface.addColumn('Reservas', 'hora_inicio', {
      type: DataTypes.TIME,
      allowNull: false
    });

    await queryInterface.addColumn('Reservas', 'hora_fin', {
      type: DataTypes.TIME,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Reservas', 'hora_fin');
    await queryInterface.removeColumn('Reservas', 'hora_inicio');
    
    await queryInterface.addColumn('Reservas', 'hora_inicio', {
      type: DataTypes.ENUM('mañana', 'tarde'),
      allowNull: false
    });
  }
};