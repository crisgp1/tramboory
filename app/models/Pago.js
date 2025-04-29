const { Model, DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');
const MODEL_SCHEMAS = require('../utils/schemaMap');

class Pago extends Model {
  static async validarPagosPendientes() {
    try {
      const TIMEOUT_MINUTOS = 30;
      const pagosExpirados = await this.findAll({
        where: {
          estado: 'pendiente',
          fecha_creacion: {
            [Op.lt]: new Date(Date.now() - TIMEOUT_MINUTOS * 60000)
          }
        }
      });

      console.log(`Validando ${pagosExpirados.length} pagos pendientes expirados`);

      for (const pago of pagosExpirados) {
        await pago.update({ estado: 'fallido' });
      }
    } catch (error) {
      console.error('Error en validarPagosPendientes:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async validarMontoTotal() {
    try {
      const reserva = await this.getReservaPago();
      if (!reserva) {
        console.error('Reserva no encontrada para el pago:', {
          pagoId: this.id,
          reservaId: this.id_reserva,
          timestamp: new Date().toISOString()
        });
        throw new Error('Reserva no encontrada');
      }

      // Para pagos nuevos, no sumamos nada
      let pagosCompletados = 0;
      
      if (this.id) {
        // Para pagos existentes, sumamos todos los pagos completados excepto este
        pagosCompletados = parseFloat(await Pago.sum('monto', {
          where: {
            id_reserva: this.id_reserva,
            estado: 'completado',
            id: { [Op.ne]: this.id }
          }
        }) || 0);
      } else {
        // Para pagos nuevos, sumamos todos los pagos completados existentes
        pagosCompletados = parseFloat(await Pago.sum('monto', {
          where: {
            id_reserva: this.id_reserva,
            estado: 'completado'
          }
        }) || 0);
      }

      const montoActual = this.estado === 'completado' ? parseFloat(this.monto) : 0;
      const nuevoTotal = pagosCompletados + montoActual;
      const totalReserva = parseFloat(reserva.total);

      console.log('Desglose de validación:', {
        pagoId: this.id || 'nuevo',
        pagosCompletadosAnteriores: pagosCompletados,
        montoActual,
        nuevoTotal,
        totalReserva,
        esNuevo: !this.id
      });
      
      console.log('Validación de monto total:', {
        pagoId: this.id,
        reservaId: this.id_reserva,
        pagosCompletados,
        nuevoTotal,
        totalReserva: reserva.total
      });

      if (nuevoTotal > reserva.total) {
        throw new Error(`El monto total de pagos (${nuevoTotal}) excede el total de la reserva (${reserva.total})`);
      }
    } catch (error) {
      console.error('Error en validarMontoTotal:', {
        error: error.message,
        stack: error.stack,
        pagoId: this.id,
        reservaId: this.id_reserva,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

Pago.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'reservas',
      key: 'id'
    }
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0.01],
        msg: 'El monto debe ser mayor a 0'
      }
    }
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  metodo_pago: {
    type: DataTypes.ENUM('transferencia', 'efectivo', 'tarjeta_debito', 'tarjeta_credito'),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completado', 'fallido'),
    allowNull: false,
    defaultValue: 'pendiente'
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
  sequelize,
  tableName: 'pagos',
  schema: MODEL_SCHEMAS.Pago,
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      name: 'idx_pagos_reserva',
      fields: ['id_reserva']
    },
    {
      name: 'idx_pagos_compuesto',
      fields: ['id_reserva', 'estado', 'fecha_pago']
    }
  ],
  hooks: {
    beforeSave: async (pago) => {
      try {
        if (pago.estado === 'completado') {
          await pago.validarMontoTotal();
        }
      } catch (error) {
        console.error('Error en hook beforeSave:', {
          error: error.message,
          stack: error.stack,
          pagoId: pago.id,
          estado: pago.estado,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    },
    afterCreate: async (pago) => {
      try {
        if (pago.estado === 'pendiente') {
          console.log('Programando validación de timeout para pago:', {
            pagoId: pago.id,
            timestamp: new Date().toISOString()
          });
          
          setTimeout(async () => {
            try {
              const pagoActual = await Pago.findByPk(pago.id);
              if (pagoActual && pagoActual.estado === 'pendiente') {
                console.log('Actualizando pago expirado a fallido:', {
                  pagoId: pago.id,
                  timestamp: new Date().toISOString()
                });
                await pagoActual.update({ estado: 'fallido' });
              }
            } catch (error) {
              console.error('Error en timeout de pago:', {
                error: error.message,
                stack: error.stack,
                pagoId: pago.id,
                timestamp: new Date().toISOString()
              });
            }
          }, 30 * 60000); // 30 minutos
        }
      } catch (error) {
        console.error('Error en hook afterCreate:', {
          error: error.message,
          stack: error.stack,
          pagoId: pago.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    }
  }
});

module.exports = Pago;
