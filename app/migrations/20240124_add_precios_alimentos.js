const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Primero agregamos las nuevas columnas con valores por defecto
      await queryInterface.addColumn('opciones_alimentos', 'precio_adulto', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      });

      await queryInterface.addColumn('opciones_alimentos', 'precio_nino', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      });

      // 2. Actualizamos los registros existentes
      // Para los registros existentes, dividimos el precio_extra:
      // 60% para adultos y 40% para niños
      await queryInterface.sequelize.query(`
        UPDATE opciones_alimentos 
        SET 
          precio_adulto = ROUND(precio_extra * 0.6, 2),
          precio_nino = ROUND(precio_extra * 0.4, 2)
        WHERE precio_adulto = 0 AND precio_nino = 0
      `);

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('opciones_alimentos', 'precio_adulto');
      await queryInterface.removeColumn('opciones_alimentos', 'precio_nino');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};