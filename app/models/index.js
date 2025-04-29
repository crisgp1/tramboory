const sequelize = require('../config/database');
const { agregarHooksAuditoria } = require('../utils/modelHooks');
const MODEL_SCHEMAS = require('../utils/schemaMap');

// Importar modelos
const Usuario = require('./Usuario');
const Paquete = require('./Paquete');
const PaqueteAlimento = require('./PaqueteAlimento');
const OpcionAlimento = require('./OpcionAlimento');
const Reserva = require('./Reserva');
const Finanza = require('./Finanza');
const Pago = require('./Pago');
const Mampara = require('./Mampara');
const Tematica = require('./Tematica');
const Extra = require('./Extra');
const Categoria = require('./Categoria');
const ReservaExtra = require('./ReservaExtra');
const Auditoria = require('./Auditoria');
const GaleriaHome = require('./GaleriaHome');

// Importar modelos de inventario
const inventoryModels = require('./Inventory');

// Agregar hooks de auditoría a todos los modelos
const modelos = [
  Paquete, PaqueteAlimento, OpcionAlimento, Usuario, Reserva,
  Finanza, Pago, Mampara, Tematica, Extra, Categoria, GaleriaHome
];

modelos.forEach(modelo => {
  agregarHooksAuditoria(modelo);
});

// Asociaciones manteniendo schemas explícitos
Usuario.hasMany(Reserva, { foreignKey: 'id_usuario', as: 'reservas' });
Reserva.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Paquete.hasMany(Reserva, { foreignKey: 'id_paquete', as: 'reservas' });
Reserva.belongsTo(Paquete, { foreignKey: 'id_paquete', as: 'paquete' });

OpcionAlimento.hasMany(Reserva, { foreignKey: 'id_opcion_alimento', as: 'reservasOpcionAlimento' });
Reserva.belongsTo(OpcionAlimento, { foreignKey: 'id_opcion_alimento', as: 'opcionAlimento' });

Reserva.belongsTo(Mampara, { foreignKey: 'id_mampara', as: 'mampara' });

// Asociaciones de Finanza
Usuario.hasMany(Finanza, { foreignKey: 'id_usuario', as: 'finanzasUsuario' });
Finanza.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

Reserva.hasMany(Finanza, { foreignKey: 'id_reserva', as: 'finanzas' });
Finanza.belongsTo(Reserva, { foreignKey: 'id_reserva', as: 'reserva' });

Categoria.hasMany(Finanza, { foreignKey: 'id_categoria', as: 'finanzas' });
Finanza.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'categoria' });

// Asociaciones de Pago
Reserva.hasMany(Pago, { foreignKey: 'id_reserva', as: 'pagos' });
Pago.belongsTo(Reserva, { foreignKey: 'id_reserva', as: 'reservaPago' });

// Asociaciones de Tematica
Tematica.hasMany(Reserva, { foreignKey: 'id_tematica', as: 'reservasTematica' });
Reserva.belongsTo(Tematica, { foreignKey: 'id_tematica', as: 'tematicaReserva' });

Tematica.hasMany(Mampara, { foreignKey: 'id_tematica', as: 'mamparas' });
Mampara.belongsTo(Tematica, { foreignKey: 'id_tematica', as: 'tematicaMampara' });

// Relación entre Reserva y Extra usando ReservaExtras como tabla intermedia
Reserva.belongsToMany(Extra, {
  through: ReservaExtra,
  foreignKey: 'id_reserva',
  otherKey: 'id_extra',
  as: 'extras'
});

Extra.belongsToMany(Reserva, {
  through: ReservaExtra,
  foreignKey: 'id_extra',
  otherKey: 'id_reserva',
  as: 'reservas'
});

// Asociación entre OpcionAlimento y modelos de inventario
if (inventoryModels.MateriaPrima) {
  OpcionAlimento.belongsToMany(inventoryModels.MateriaPrima, {
    through: {
      model: 'recetas_insumos',
      schema: 'main' // Especificar el schema para la tabla intermedia
    },
    foreignKey: 'id_opcion_alimento',
    otherKey: 'id_materia_prima',
    as: 'materiasPrimas'
  });
}

// Exportar todos los modelos
module.exports = {
  sequelize,
  Paquete,
  PaqueteAlimento,
  OpcionAlimento,
  Usuario,
  Reserva,
  Finanza,
  Pago,
  Mampara,
  Tematica,
  Extra,
  Categoria,
  ReservaExtra,
  Auditoria,
  GaleriaHome,
  ...inventoryModels
};