const sequelize = require('../../config/database');
const MODEL_SCHEMAS = require('../../utils/schemaMap');
const { DataTypes } = require('sequelize');

// Importar los modelos
const MateriaPrima = require('./MateriaPrima');
const Proveedor = require('./Proveedor');
const UnidadMedida = require('./UnidadMedida');
const ConversionMedida = require('./ConversionMedida');
const Lote = require('./Lote');
const TipoAjuste = require('./TipoAjuste');
const MovimientoInventario = require('./MovimientoInventario');
const OrdenCompra = require('./OrdenCompra');
const DetalleOrdenCompra = require('./DetalleOrdenCompra');
const AlertaInventario = require('./AlertaInventario');
const RecetaInsumo = require('./RecetaInsumo');

// Establecer asociaciones internas al schema de inventario
MateriaPrima.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
MateriaPrima.belongsTo(UnidadMedida, { foreignKey: 'id_unidad_medida', as: 'unidadMedida' });

// Asociaciones de MovimientoInventario
MovimientoInventario.belongsTo(TipoAjuste, { foreignKey: 'id_tipo_ajuste', as: 'tipoAjuste' });
MovimientoInventario.belongsTo(MateriaPrima, { foreignKey: 'id_materia_prima', as: 'materiaPrima' });

// Asociaciones de Lote
Lote.belongsTo(MateriaPrima, { foreignKey: 'id_materia_prima', as: 'materiaPrima' });
Lote.belongsTo(OrdenCompra, { foreignKey: 'id_orden_compra', as: 'ordenCompra' });

// Asociaciones de ConversionMedida
ConversionMedida.belongsTo(UnidadMedida, { foreignKey: 'id_unidad_origen', as: 'unidadOrigen' });
ConversionMedida.belongsTo(UnidadMedida, { foreignKey: 'id_unidad_destino', as: 'unidadDestino' });

// Asociaciones de OrdenCompra
OrdenCompra.belongsTo(Proveedor, { foreignKey: 'id_proveedor', as: 'proveedor' });
OrdenCompra.hasMany(DetalleOrdenCompra, { foreignKey: 'id_orden_compra', as: 'detalles' });

// Asociaciones de DetalleOrdenCompra
DetalleOrdenCompra.belongsTo(OrdenCompra, { foreignKey: 'id_orden_compra', as: 'ordenCompra' });
DetalleOrdenCompra.belongsTo(MateriaPrima, { foreignKey: 'id_materia_prima', as: 'materiaPrima' });

// Asociaciones de AlertaInventario
AlertaInventario.belongsTo(MateriaPrima, { foreignKey: 'id_materia_prima', as: 'materiaPrima' });

// Exportar todos los modelos de inventario
module.exports = {
  MateriaPrima,
  Proveedor,
  UnidadMedida,
  ConversionMedida,
  Lote,
  TipoAjuste,
  MovimientoInventario,
  OrdenCompra,
  DetalleOrdenCompra,
  AlertaInventario,
  RecetaInsumo
};