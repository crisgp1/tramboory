const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const MODEL_SCHEMAS = require('../../utils/schemaMap');
const OrdenCompra = sequelize.define('OrdenesCompra', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_proveedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'proveedores',
      key: 'id'
    }
  },
  numero_orden: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  fecha_solicitud: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_DATE')
  },
  fecha_entrega_esperada: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'recibida', 'cancelada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  total_estimado: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_usuario_creador: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  id_usuario_autorizador: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  fecha_autorizacion: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'ordenes_compra',
  schema: MODEL_SCHEMAS.OrdenCompra,
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Asociaciones
OrdenCompra.associate = (models) => {
  OrdenCompra.belongsTo(models.Proveedor, {
    foreignKey: 'id_proveedor',
    as: 'proveedor'
  });

  OrdenCompra.belongsTo(models.Usuario, {
    foreignKey: 'id_usuario_creador',
    as: 'usuarioCreador'
  });

  OrdenCompra.belongsTo(models.Usuario, {
    foreignKey: 'id_usuario_autorizador',
    as: 'usuarioAutorizador'
  });

  OrdenCompra.hasMany(models.DetalleOrdenCompra, {
    foreignKey: 'id_orden_compra',
    as: 'detalles'
  });

  OrdenCompra.hasMany(models.MovimientoInventario, {
    foreignKey: 'id_orden_compra',
    as: 'movimientos'
  });
};

// Métodos de clase
OrdenCompra.findPendientes = function() {
  return this.findAll({
    where: {
      estado: 'pendiente',
      activo: true
    },
    include: [
      {
        model: sequelize.models.Proveedor,
        as: 'proveedor',
        attributes: ['nombre']
      },
      {
        model: sequelize.models.Usuario,
        as: 'usuarioCreador',
        attributes: ['nombre']
      }
    ],
    order: [['fecha_solicitud', 'ASC']]
  });
};

// Métodos de instancia
OrdenCompra.prototype.aprobar = async function(idUsuarioAutorizador) {
  if (this.estado !== 'pendiente') {
    throw new Error('Solo se pueden aprobar órdenes pendientes');
  }

  await this.update({
    estado: 'aprobada',
    id_usuario_autorizador: idUsuarioAutorizador,
    fecha_autorizacion: sequelize.literal('CURRENT_TIMESTAMP')
  });
};

OrdenCompra.prototype.recibir = async function() {
  if (this.estado !== 'aprobada') {
    throw new Error('Solo se pueden recibir órdenes aprobadas');
  }

  await this.update({
    estado: 'recibida'
  });
};

OrdenCompra.prototype.cancelar = async function() {
  if (!['pendiente', 'aprobada'].includes(this.estado)) {
    throw new Error('No se puede cancelar una orden que ya fue recibida');
  }

  await this.update({
    estado: 'cancelada'
  });
};

module.exports = OrdenCompra;