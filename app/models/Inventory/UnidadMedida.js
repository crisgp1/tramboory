const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const UnidadMedida = sequelize.define('UnidadesMedida', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  abreviatura: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  tipo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['masa', 'volumen', 'unidad', 'longitud', 'area']]
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
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'unidades_medida',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Método para obtener unidades de medida por tipo
UnidadMedida.findByTipo = function(tipo) {
  return this.findAll({
    where: {
      tipo,
      activo: true
    },
    order: [['nombre', 'ASC']]
  });
};

module.exports = UnidadMedida;