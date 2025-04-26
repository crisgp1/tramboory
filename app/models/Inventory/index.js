const sequelize = require('../../config/database');
const { agregarHooksAuditoria } = require('../../utils/modelHooks');

// Importar modelos del directorio principal
const Usuario = require('../Usuario');
const OpcionAlimento = require('../OpcionAlimento');
const Reserva = require('../Reserva');
const Extra = require('../Extra');
const Pago = require('../Pago');
const Paquete = require('../Paquete');

// Importar modelos
const AlertaInventario = require('./AlertaInventario');
const ConversionMedida = require('./ConversionMedida');
const DetalleOrdenCompra = require('./DetalleOrdenCompra');
const Lote = require('./Lote');
const MateriaPrima = require('./MateriaPrima');
const MovimientoInventario = require('./MovimientoInventario');
const OrdenCompra = require('./OrdenCompra');
const Proveedor = require('./Proveedor');
const RecetaInsumo = require('./RecetaInsumo');
const TipoAjuste = require('./TipoAjuste');
const UnidadMedida = require('./UnidadMedida');

// Reunir todos los modelos en un objeto
const models = {
  AlertaInventario,
  ConversionMedida,
  DetalleOrdenCompra,
  Lote,
  MateriaPrima,
  MovimientoInventario,
  OrdenCompra,
  Proveedor,
  RecetaInsumo,
  TipoAjuste,
  UnidadMedida,
  Usuario, // Añadir el modelo Usuario para las asociaciones
  OpcionAlimento, // Añadir el modelo OpcionAlimento para las asociaciones
  Reserva, // Añadir el modelo Reserva para las asociaciones
  Extra, // Añadir el modelo Extra para las asociaciones
  Pago, // Añadir el modelo Pago para las asociaciones
  Paquete // Añadir el modelo Paquete para las asociaciones
};

// Configurar hooks de auditoría
Object.values(models).forEach(model => {
  agregarHooksAuditoria(model);
});

// Configurar asociaciones solo para modelos de inventario
// Evitamos ejecutar associate() en los modelos principales para prevenir duplicación de asociaciones
const modelosInventario = [
  AlertaInventario, ConversionMedida, DetalleOrdenCompra, Lote, 
  MateriaPrima, MovimientoInventario, OrdenCompra, Proveedor, 
  RecetaInsumo, TipoAjuste, UnidadMedida
];

modelosInventario.forEach(model => {
  if (model.associate && typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = models;