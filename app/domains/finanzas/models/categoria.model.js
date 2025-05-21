const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MODEL_SCHEMAS = require('../utils/schemaMap');
const Categoria = sequelize.define('Categorias', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            name: 'uq_categorias_nombre',
            msg: 'El nombre de la categoría ya existe'
        }
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: '#000000'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'categorias',
    schema: MODEL_SCHEMAS.Categoria,
    timestamps: false
});

module.exports = Categoria;