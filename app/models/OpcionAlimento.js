const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OpcionAlimento = sequelize.define('OpcionAlimento', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    precio_extra: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    disponible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    turno: {
        type: DataTypes.ENUM('matutino', 'vespertino', 'ambos'),
        allowNull: false,
        defaultValue: 'ambos'
    },
    platillo_adulto: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    platillo_nino: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    opcion_papas: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    precio_papas: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 19.00
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'opciones_alimentos',
    timestamps: false
});

module.exports = OpcionAlimento;