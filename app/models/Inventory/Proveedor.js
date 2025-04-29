const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const MODEL_SCHEMAS = require('../../utils/schemaMap');
const Proveedor = sequelize.define('Proveedores', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // Eliminado campo razon_social que no existe en la base de datos
  rfc: {
    type: DataTypes.STRING(13),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  productos_servicios: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Descripción de los productos o servicios que provee'
  },
  condiciones_pago: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Términos y condiciones de pago acordados'
  },
  tiempo_entrega_promedio: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Tiempo promedio de entrega en días'
  },
  notas: {
    type: DataTypes.TEXT,
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
  tableName: 'proveedores',
  schema: MODEL_SCHEMAS.Proveedor,
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Asociaciones
Proveedor.associate = (models) => {
  Proveedor.hasMany(models.OrdenCompra, {
    foreignKey: 'id_proveedor',
    as: 'ordenesCompra'
  });

  Proveedor.hasMany(models.MovimientoInventario, {
    foreignKey: 'id_proveedor',
    as: 'movimientos'
  });
};

// Métodos de clase
Proveedor.findActivos = function() {
  return this.findAll({
    where: { activo: true },
    order: [['nombre', 'ASC']]
  });
};

// Método para buscar proveedores por producto/servicio
Proveedor.findByProducto = function(termino) {
  return this.findAll({
    where: {
      activo: true,
      productos_servicios: {
        [sequelize.Op.iLike]: `%${termino}%`
      }
    },
    order: [['nombre', 'ASC']]
  });
};

module.exports = Proveedor;