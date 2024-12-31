const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tematica = sequelize.define('Tematicas', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'El nombre es requerido'
            },
            notEmpty: {
                msg: 'El nombre no puede estar vacío'
            }
        }
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    foto: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'tematicas',
    schema: 'tramboory',
    timestamps: false
});

// Las relaciones se definen en los modelos que tienen las claves foráneas
// Mampara y Reserva tienen la referencia a Tematica

module.exports = Tematica;