const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
    id: {
        type: DataTypes.STRING,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#000000' // Color negro por defecto
    }
}, {
    tableName: 'Categorias',
    timestamps: false
});

module.exports = Categoria;