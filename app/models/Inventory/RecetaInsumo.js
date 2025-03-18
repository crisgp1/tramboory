const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const RecetaInsumo = sequelize.define('RecetasInsumos', {
  id_opcion_alimento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'opciones_alimentos',
      key: 'id'
    }
  },
  id_materia_prima: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'materias_primas',
      key: 'id'
    }
  },
  cantidad_requerida: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    validate: {
      min: 0,
      notZero(value) {
        if (parseFloat(value) === 0) {
          throw new Error('La cantidad requerida no puede ser cero');
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
  tableName: 'recetas_insumos',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Asociaciones
RecetaInsumo.associate = (models) => {
  RecetaInsumo.belongsTo(models.OpcionAlimento, {
    foreignKey: 'id_opcion_alimento',
    as: 'opcionAlimento'
  });

  RecetaInsumo.belongsTo(models.MateriaPrima, {
    foreignKey: 'id_materia_prima',
    as: 'materiaPrima'
  });

  RecetaInsumo.belongsTo(models.UnidadMedida, {
    foreignKey: 'id_unidad_medida',
    as: 'unidadMedida'
  });
};

// Métodos de clase
RecetaInsumo.findByOpcionAlimento = function(idOpcionAlimento) {
  return this.findAll({
    where: {
      id_opcion_alimento: idOpcionAlimento,
      activo: true
    },
    include: [
      {
        model: sequelize.models.MateriaPrima,
        as: 'materiaPrima',
        attributes: ['nombre', 'stock_actual']
      },
      {
        model: sequelize.models.UnidadMedida,
        as: 'unidadMedida',
        attributes: ['nombre', 'abreviatura']
      }
    ]
  });
};

// Método para verificar disponibilidad de insumos
RecetaInsumo.verificarDisponibilidad = async function(idOpcionAlimento, cantidad = 1) {
  const insumos = await this.findAll({
    where: {
      id_opcion_alimento: idOpcionAlimento,
      activo: true
    },
    include: [
      {
        model: sequelize.models.MateriaPrima,
        as: 'materiaPrima',
        attributes: ['id', 'nombre', 'stock_actual']
      },
      {
        model: sequelize.models.UnidadMedida,
        as: 'unidadMedida',
        attributes: ['id', 'nombre']
      }
    ]
  });

  const faltantes = [];
  for (const insumo of insumos) {
    const cantidadNecesaria = parseFloat(insumo.cantidad_requerida) * cantidad;
    const stockDisponible = parseFloat(insumo.materiaPrima.stock_actual);

    if (stockDisponible < cantidadNecesaria) {
      faltantes.push({
        materiaPrima: insumo.materiaPrima.nombre,
        cantidadNecesaria,
        stockDisponible,
        unidad: insumo.unidadMedida.nombre,
        faltante: cantidadNecesaria - stockDisponible
      });
    }
  }

  return {
    disponible: faltantes.length === 0,
    faltantes
  };
};

// Método para calcular costo total de insumos
RecetaInsumo.calcularCostoTotal = async function(idOpcionAlimento) {
  const insumos = await this.findAll({
    where: {
      id_opcion_alimento: idOpcionAlimento,
      activo: true
    },
    include: [
      {
        model: sequelize.models.MateriaPrima,
        as: 'materiaPrima',
        attributes: ['nombre', 'costo_unitario']
      }
    ]
  });

  return insumos.reduce((total, insumo) => {
    const costoInsumo = parseFloat(insumo.cantidad_requerida) * parseFloat(insumo.materiaPrima.costo_unitario);
    return total + costoInsumo;
  }, 0);
};

module.exports = RecetaInsumo;