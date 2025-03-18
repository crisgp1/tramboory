const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GaleriaHome = sequelize.define('GaleriaHome', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    imagen_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: {
                msg: 'La URL de la imagen es requerida'
            },
            notEmpty: {
                msg: 'La URL de la imagen no puede estar vacía'
            }
        }
    },
    cloudinary_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'ID de la imagen en Cloudinary para facilitar su gestión'
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Controla el orden de aparición en el carrusel'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    es_promocion: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la imagen es una promoción del mes'
    }
}, {
    tableName: 'galeria_home',
    schema: 'tramboory',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

module.exports = GaleriaHome;