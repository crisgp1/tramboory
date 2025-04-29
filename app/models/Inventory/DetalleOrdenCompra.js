const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const MODEL_SCHEMAS = require('../../utils/schemaMap');
const DetalleOrdenCompra = sequelize.define('DetalleOrdenCompra', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_orden_compra: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ordenes_compra',
      key: 'id'
    }
  },
  id_materia_prima: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'materias_primas',
      key: 'id'
    }
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      notZero(value) {
        if (parseFloat(value) === 0) {
          throw new Error('La cantidad no puede ser cero');
        }
      }
    }
  },
  id_unidad_medida: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'unidades_medida',
      key: 'id'
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  cantidad_recibida: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      noMayorQueCantidad(value) {
        if (parseFloat(value) > parseFloat(this.cantidad)) {
          throw new Error('La cantidad recibida no puede ser mayor que la cantidad ordenada');
        }
      }
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
  tableName: 'detalle_orden_compra',
  schema: MODEL_SCHEMAS.DetalleOrdenCompra,
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  hooks: {
    beforeValidate: (detalle) => {
      // Calcular subtotal antes de validar
      if (detalle.cantidad && detalle.precio_unitario) {
        detalle.subtotal = parseFloat(detalle.cantidad) * parseFloat(detalle.precio_unitario);
      }
    }
  }
});

// Asociaciones
DetalleOrdenCompra.associate = (models) => {
  DetalleOrdenCompra.belongsTo(models.OrdenCompra, {
    foreignKey: 'id_orden_compra',
    as: 'ordenCompra'
  });

  DetalleOrdenCompra.belongsTo(models.MateriaPrima, {
    foreignKey: 'id_materia_prima',
    as: 'materiaPrima'
  });

  DetalleOrdenCompra.belongsTo(models.UnidadMedida, {
    foreignKey: 'id_unidad_medida',
    as: 'unidadMedida'
  });
};

// Métodos de clase
DetalleOrdenCompra.findByOrdenCompra = function(idOrdenCompra) {
  return this.findAll({
    where: {
      id_orden_compra: idOrdenCompra,
      activo: true
    },
    include: [
      {
        model: sequelize.models.MateriaPrima,
        as: 'materiaPrima',
        attributes: ['nombre']
      },
      {
        model: sequelize.models.UnidadMedida,
        as: 'unidadMedida',
        attributes: ['nombre', 'abreviatura']
      }
    ]
  });
};

// Métodos de instancia
DetalleOrdenCompra.prototype.registrarRecepcion = async function(cantidadRecibida) {
  const nuevaCantidadRecibida = parseFloat(this.cantidad_recibida) + parseFloat(cantidadRecibida);
  
  if (nuevaCantidadRecibida > parseFloat(this.cantidad)) {
    throw new Error('La cantidad total recibida no puede exceder la cantidad ordenada');
  }

  await this.update({
    cantidad_recibida: nuevaCantidadRecibida
  });

  return {
    cantidadPendiente: parseFloat(this.cantidad) - nuevaCantidadRecibida,
    recepcionCompleta: nuevaCantidadRecibida === parseFloat(this.cantidad)
  };
};

module.exports = DetalleOrdenCompra;