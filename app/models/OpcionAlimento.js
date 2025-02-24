const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class OpcionAlimento extends Model {
    static associate(models) {
        OpcionAlimento.hasMany(models.Reserva, {
            foreignKey: 'id_opcion_alimento',
            as: 'reservas'
        });
    }
}

OpcionAlimento.init({
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
    precio_adulto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    precio_nino: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    precio_extra: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    disponible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    turno: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'ambos',
        validate: {
            isIn: {
                args: [['manana', 'tarde', 'ambos']],
                msg: 'El turno debe ser manana, tarde o ambos'
            }
        }
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
        defaultValue: 19.00,
        validate: {
            min: 0
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    fecha_actualizacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'OpcionAlimento',
    tableName: 'opciones_alimentos',
    schema: 'tramboory',
    timestamps: false
});

module.exports = OpcionAlimento;