const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const MODEL_SCHEMAS = require('../../utils/schemaMap');
const Lote = sequelize.define('Lotes', {
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
  codigo_lote: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Código único del lote'
  },
  fecha_produccion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  fecha_caducidad: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isAfterProduccion(value) {
        if (this.fecha_produccion && value && value <= this.fecha_produccion) {
          throw new Error('La fecha de caducidad debe ser posterior a la fecha de producción');
        }
      }
    }
  },
  prioridad_uso: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 100,
    comment: 'Prioridad de uso (menor número = mayor prioridad)'
  },
  en_uso: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si el lote está actualmente en uso'
  },
  cantidad_inicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  cantidad_actual: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      noMayorQueInicial(value) {
        if (parseFloat(value) > parseFloat(this.cantidad_inicial)) {
          throw new Error('La cantidad actual no puede ser mayor que la cantidad inicial');
        }
      }
    }
  },
  costo_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
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
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  }
}, {
  tableName: 'lotes',
  schema: MODEL_SCHEMAS.Lote,
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      unique: true,
      fields: ['id_materia_prima', 'codigo_lote'],
      name: 'uq_lote_materia_codigo'
    }
  ]
});

// Asociaciones
Lote.associate = (models) => {
  Lote.belongsTo(models.MateriaPrima, {
    foreignKey: 'id_materia_prima',
    as: 'materiaPrima'
  });

  Lote.hasMany(models.MovimientoInventario, {
    foreignKey: 'id_lote',
    as: 'movimientos'
  });
};

// Métodos de clase
Lote.findProximosACaducar = function(diasLimite = 7) {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + diasLimite);

  return this.findAll({
    where: {
      activo: true,
      cantidad_actual: {
        [sequelize.Op.gt]: 0
      },
      fecha_caducidad: {
        [sequelize.Op.lte]: fechaLimite,
        [sequelize.Op.gt]: new Date()
      }
    },
    include: [{
      model: sequelize.models.MateriaPrima,
      as: 'materiaPrima',
      attributes: ['nombre', 'id_unidad_medida']
    }],
    order: [['fecha_caducidad', 'ASC']]
  });
};

// Método para obtener lotes con existencias ordenados por FIFO y caducidad
Lote.findConExistencias = function() {
  return this.findAll({
    where: {
      activo: true,
      cantidad_actual: {
        [sequelize.Op.gt]: 0
      }
    },
    include: [{
      model: sequelize.models.MateriaPrima,
      as: 'materiaPrima',
      attributes: ['nombre', 'id_unidad_medida']
    }],
    order: [
      ['fecha_caducidad', 'ASC'],
      ['fecha_produccion', 'ASC'],
      ['prioridad_uso', 'ASC']
    ]
  });
};

// Método para obtener lotes disponibles para una materia prima ordenados por FIFO y caducidad
Lote.findLotesDisponiblesPorMateriaPrima = function(idMateriaPrima) {
  return this.findAll({
    where: {
      id_materia_prima: idMateriaPrima,
      activo: true,
      cantidad_actual: {
        [sequelize.Op.gt]: 0
      }
    },
    order: [
      ['fecha_caducidad', 'ASC'],
      ['fecha_produccion', 'ASC'],
      ['prioridad_uso', 'ASC']
    ]
  });
};

// Métodos de instancia
Lote.prototype.actualizarCantidad = async function(cantidad, tipo) {
  if (tipo === 'entrada') {
    const nuevaCantidad = parseFloat(this.cantidad_actual) + parseFloat(cantidad);
    if (nuevaCantidad > this.cantidad_inicial) {
      throw new Error('La cantidad resultante excede la cantidad inicial del lote');
    }
    this.cantidad_actual = nuevaCantidad;
  } else if (tipo === 'salida') {
    const nuevaCantidad = parseFloat(this.cantidad_actual) - parseFloat(cantidad);
    if (nuevaCantidad < 0) {
      throw new Error('Stock insuficiente en el lote');
    }
    this.cantidad_actual = nuevaCantidad;
  }
  return this.save();
};

// Método para calcular días para caducidad
Lote.prototype.diasParaCaducidad = function() {
  if (!this.fecha_caducidad) return null;
  
  const hoy = new Date();
  const fechaCaducidad = new Date(this.fecha_caducidad);
  const diferencia = fechaCaducidad.getTime() - hoy.getTime();
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

// Método para marcar un lote como en uso
Lote.prototype.marcarEnUso = async function() {
  this.en_uso = true;
  return this.save();
};

// Método para establecer prioridad de uso
Lote.prototype.establecerPrioridad = async function(prioridad) {
  this.prioridad_uso = prioridad;
  return this.save();
};

module.exports = Lote;
