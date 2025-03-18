const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const AlertaInventario = sequelize.define('AlertasInventario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_materia_prima: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'materias_primas',
      key: 'id'
    }
  },
  tipo_alerta: {
    type: DataTypes.ENUM('stock_bajo', 'caducidad', 'vencimiento_proveedor', 'ajuste_requerido'),
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha_alerta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  leida: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  fecha_lectura: {
    type: DataTypes.DATE,
    allowNull: true
  },
  id_usuario_destinatario: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
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
  tableName: 'alertas_inventario',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Asociaciones
AlertaInventario.associate = (models) => {
  AlertaInventario.belongsTo(models.MateriaPrima, {
    foreignKey: 'id_materia_prima',
    as: 'materiaPrima'
  });

  AlertaInventario.belongsTo(models.Usuario, {
    foreignKey: 'id_usuario_destinatario',
    as: 'usuarioDestinatario'
  });
};

// Métodos de clase
AlertaInventario.findPendientes = function(idUsuario) {
  return this.findAll({
    where: {
      id_usuario_destinatario: idUsuario,
      leida: false,
      activo: true
    },
    include: [{
      model: sequelize.models.MateriaPrima,
      as: 'materiaPrima',
      attributes: ['nombre']
    }],
    order: [['fecha_alerta', 'DESC']]
  });
};

AlertaInventario.findByTipo = function(tipo, idUsuario) {
  return this.findAll({
    where: {
      tipo_alerta: tipo,
      id_usuario_destinatario: idUsuario,
      activo: true
    },
    include: [{
      model: sequelize.models.MateriaPrima,
      as: 'materiaPrima',
      attributes: ['nombre']
    }],
    order: [['fecha_alerta', 'DESC']]
  });
};

// Método para crear alerta de stock bajo
AlertaInventario.crearAlertaStockBajo = async function(materiaPrima, usuariosAdmin) {
  const alertas = await Promise.all(usuariosAdmin.map(usuario => 
    this.create({
      id_materia_prima: materiaPrima.id,
      tipo_alerta: 'stock_bajo',
      mensaje: `La materia prima "${materiaPrima.nombre}" ha llegado a su nivel mínimo de stock (${materiaPrima.stock_actual} unidades)`,
      id_usuario_destinatario: usuario.id
    })
  ));
  return alertas;
};

// Método para crear alerta de caducidad
AlertaInventario.crearAlertaCaducidad = async function(materiaPrima, usuariosAdmin, diasRestantes) {
  const alertas = await Promise.all(usuariosAdmin.map(usuario => 
    this.create({
      id_materia_prima: materiaPrima.id,
      tipo_alerta: 'caducidad',
      mensaje: `La materia prima "${materiaPrima.nombre}" caducará en ${diasRestantes} días`,
      id_usuario_destinatario: usuario.id
    })
  ));
  return alertas;
};

// Métodos de instancia
AlertaInventario.prototype.marcarComoLeida = async function() {
  this.leida = true;
  this.fecha_lectura = new Date();
  return this.save();
};

module.exports = AlertaInventario;