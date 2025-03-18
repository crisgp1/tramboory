const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const ConversionMedida = sequelize.define('ConversionMedida', {
  id_unidad_origen: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'unidades_medida',
      key: 'id'
    }
  },
  id_unidad_destino: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'unidades_medida',
      key: 'id'
    }
  },
  factor_conversion: {
    type: DataTypes.DECIMAL(15, 6),
    allowNull: false,
    validate: {
      min: 0,
      notZero(value) {
        if (parseFloat(value) === 0) {
          throw new Error('El factor de conversión no puede ser cero');
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
  tableName: 'conversiones_medida',
  schema: 'tramboory',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Asociaciones
ConversionMedida.associate = (models) => {
  ConversionMedida.belongsTo(models.UnidadMedida, {
    foreignKey: 'id_unidad_origen',
    as: 'unidadOrigen'
  });

  ConversionMedida.belongsTo(models.UnidadMedida, {
    foreignKey: 'id_unidad_destino',
    as: 'unidadDestino'
  });
};

// Métodos de clase
ConversionMedida.findConversion = async function(idUnidadOrigen, idUnidadDestino) {
  return this.findOne({
    where: {
      id_unidad_origen: idUnidadOrigen,
      id_unidad_destino: idUnidadDestino,
      activo: true
    },
    include: [
      {
        model: sequelize.models.UnidadMedida,
        as: 'unidadOrigen',
        attributes: ['nombre', 'abreviatura']
      },
      {
        model: sequelize.models.UnidadMedida,
        as: 'unidadDestino',
        attributes: ['nombre', 'abreviatura']
      }
    ]
  });
};

// Método para convertir una cantidad
ConversionMedida.convertir = async function(cantidad, idUnidadOrigen, idUnidadDestino) {
  const conversion = await this.findConversion(idUnidadOrigen, idUnidadDestino);
  
  if (!conversion) {
    // Intentar buscar conversión inversa
    const conversionInversa = await this.findOne({
      where: {
        id_unidad_origen: idUnidadDestino,
        id_unidad_destino: idUnidadOrigen,
        activo: true
      }
    });

    if (conversionInversa) {
      return cantidad / parseFloat(conversionInversa.factor_conversion);
    }

    throw new Error('No existe conversión entre estas unidades');
  }

  return cantidad * parseFloat(conversion.factor_conversion);
};

// Método para obtener todas las conversiones disponibles para una unidad
ConversionMedida.findConversionesDisponibles = function(idUnidad) {
  return this.findAll({
    where: {
      [sequelize.Op.or]: [
        { id_unidad_origen: idUnidad },
        { id_unidad_destino: idUnidad }
      ],
      activo: true
    },
    include: [
      {
        model: sequelize.models.UnidadMedida,
        as: 'unidadOrigen',
        attributes: ['nombre', 'abreviatura']
      },
      {
        model: sequelize.models.UnidadMedida,
        as: 'unidadDestino',
        attributes: ['nombre', 'abreviatura']
      }
    ]
  });
};

module.exports = ConversionMedida;