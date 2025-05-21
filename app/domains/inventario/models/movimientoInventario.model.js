const { DataTypes, Op } = require('sequelize');
const sequelize = require('../../config/database');
const MODEL_SCHEMAS = require('../../utils/schemaMap');

const MovimientoInventario = sequelize.define('MovimientosInventario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_materia_prima: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'materias_primas',
      key: 'id'
    }
  },
  id_proveedor: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'proveedores',
      key: 'id'
    }
  },
  id_lote: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'lotes',
      key: 'id'
    }
  },
  id_tipo_ajuste: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tipos_ajuste_inventario',
      key: 'id'
    }
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tipo_movimiento: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['entrada', 'salida']]
    }
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  // Campo activo eliminado por no existir en la tabla
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
  tableName: 'movimientos_inventario',
  schema: MODEL_SCHEMAS.MovimientoInventario,
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Asociaciones
MovimientoInventario.associate = (models) => {
  MovimientoInventario.belongsTo(models.MateriaPrima, {
    foreignKey: 'id_materia_prima',
    as: 'materiaPrima'
  });

  MovimientoInventario.belongsTo(models.Proveedor, {
    foreignKey: 'id_proveedor',
    as: 'proveedor'
  });

  MovimientoInventario.belongsTo(models.Lote, {
    foreignKey: 'id_lote',
    as: 'lote'
  });

  MovimientoInventario.belongsTo(models.TipoAjuste, {
    foreignKey: 'id_tipo_ajuste',
    as: 'tipoAjuste'
  });

  MovimientoInventario.belongsTo(models.Usuario, {
    foreignKey: 'id_usuario',
    as: 'usuario'
  });
};

// Métodos de clase
MovimientoInventario.findByFechas = function(fechaInicio, fechaFin) {
  return this.findAll({
    where: {
      fecha: {
        [Op.between]: [fechaInicio, fechaFin]
      }
      // Condición activo eliminada por no existir en la tabla
    },
    include: [
      {
        model: sequelize.models.MateriaPrima,
        as: 'materiaPrima',
        attributes: ['nombre']
      },
      {
        model: sequelize.models.Usuario,
        as: 'usuario',
        attributes: ['nombre']
      },
      {
        model: sequelize.models.TipoAjuste,
        as: 'tipoAjuste',
        attributes: ['nombre']
      }
    ],
    order: [['fecha', 'DESC']]
  });
};

MovimientoInventario.findByMateriaPrima = function(idMateriaPrima) {
  return this.findAll({
    where: {
      id_materia_prima: idMateriaPrima
      // Condición activo eliminada por no existir en la tabla
    },
    include: [
      {
        model: sequelize.models.Usuario,
        as: 'usuario',
        attributes: ['nombre']
      },
      {
        model: sequelize.models.TipoAjuste,
        as: 'tipoAjuste',
        attributes: ['nombre']
      },
      {
        model: sequelize.models.Lote,
        as: 'lote',
        attributes: ['codigo_lote']
      }
    ],
    order: [['fecha', 'DESC']]
  });
};

module.exports = MovimientoInventario;