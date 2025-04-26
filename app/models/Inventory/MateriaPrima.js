const { DataTypes, Op } = require('sequelize');
const sequelize = require('../../config/database');

const MateriaPrima = sequelize.define('MateriasPrimas', {
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
  stock_actual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  stock_minimo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
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
  costo_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  fecha_caducidad: {
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
  tableName: 'materias_primas',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Asociaciones
MateriaPrima.associate = (models) => {
  MateriaPrima.belongsTo(models.UnidadMedida, {
    foreignKey: 'id_unidad_medida',
    as: 'unidadMedida'
  });

  MateriaPrima.hasMany(models.MovimientoInventario, {
    foreignKey: 'id_materia_prima',
    as: 'movimientos'
  });

  MateriaPrima.hasMany(models.Lote, {
    foreignKey: 'id_materia_prima',
    as: 'lotes'
  });

  MateriaPrima.hasMany(models.AlertaInventario, {
    foreignKey: 'id_materia_prima',
    as: 'alertas'
  });

  // Relación con OpcionAlimento a través de RecetaInsumo
  MateriaPrima.belongsToMany(models.OpcionAlimento, {
    through: 'recetas_insumos',
    foreignKey: 'id_materia_prima',
    otherKey: 'id_opcion_alimento',
    as: 'opcionesAlimento'
  });
};

// Métodos de clase
MateriaPrima.findBajoStock = function() {
  return this.findAll({
    where: {
      activo: true,
      stock_actual: {
        [Op.lte]: sequelize.col('stock_minimo')
      }
    },
    include: [{
      model: sequelize.models.UnidadMedida,
      as: 'unidadMedida'
    }]
  });
};

MateriaPrima.findProximosCaducar = function(diasLimite = 7) {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasLimite);

  return this.findAll({
    where: {
      activo: true,
      fecha_caducidad: {
        [Op.lte]: fechaLimite,
        [Op.gt]: new Date()
      }
    },
    include: [{
      model: sequelize.models.UnidadMedida,
      as: 'unidadMedida'
    }]
  });
};

// Métodos de instancia
MateriaPrima.prototype.actualizarStock = async function(cantidad, tipo) {
  if (tipo === 'entrada') {
    this.stock_actual = parseFloat(this.stock_actual) + parseFloat(cantidad);
  } else if (tipo === 'salida') {
    const nuevoStock = parseFloat(this.stock_actual) - parseFloat(cantidad);
    if (nuevoStock < 0) {
      throw new Error('Stock insuficiente');
    }
    this.stock_actual = nuevoStock;
  }
  return this.save();
};

module.exports = MateriaPrima;