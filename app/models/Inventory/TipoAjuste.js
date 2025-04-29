const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const MODEL_SCHEMAS = require('../../utils/schemaMap');
const TipoAjuste = sequelize.define('TiposAjusteInventario', {
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
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  afecta_costos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si el ajuste afecta el costo del inventario'
  },
  requiere_autorizacion: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si el ajuste requiere aprobación de un administrador'
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
  tableName: 'tipos_ajuste_inventario',
  schema: MODEL_SCHEMAS.TipoAjuste,
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Asociaciones
TipoAjuste.associate = (models) => {
  TipoAjuste.hasMany(models.MovimientoInventario, {
    foreignKey: 'id_tipo_ajuste',
    as: 'movimientos'
  });
};

// Métodos de clase
TipoAjuste.findActivos = function() {
  return this.findAll({
    where: { activo: true },
    order: [['nombre', 'ASC']]
  });
};

TipoAjuste.findRequierenAutorizacion = function() {
  return this.findAll({
    where: {
      activo: true,
      requiere_autorizacion: true
    },
    order: [['nombre', 'ASC']]
  });
};

// Método para obtener tipos de ajuste por su efecto en costos
TipoAjuste.findPorEfectoCostos = function(afectaCostos) {
  return this.findAll({
    where: {
      activo: true,
      afecta_costos: afectaCostos
    },
    order: [['nombre', 'ASC']]
  });
};

module.exports = TipoAjuste;