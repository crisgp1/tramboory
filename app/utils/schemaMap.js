/**
 * Mapeo de modelos a sus schemas correspondientes
 */
const MODEL_SCHEMAS = {
  // Schema main
  Paquete: 'main',
  PaqueteAlimento: 'main',
  OpcionAlimento: 'main',
  Reserva: 'main',
  PreReserva: 'main',
  Mampara: 'main',
  Tematica: 'main',
  Extra: 'main',
  ReservaExtra: 'main',
  GaleriaHome: 'main',
  RecetaInsumo: 'main',
  
  // Schema usuarios
  Usuario: 'usuarios',
  Auditoria: 'usuarios',
  RegistroAuditoria: 'usuarios',
  
  // Schema finanzas
  Finanza: 'finanzas',
  Pago: 'finanzas',
  Categoria: 'finanzas',
  
  // Schema inventario
  MateriaPrima: 'inventario',
  Proveedor: 'inventario',
  UnidadMedida: 'inventario',
  ConversionMedida: 'inventario',
  Lote: 'inventario',
  TipoAjuste: 'inventario',
  MovimientoInventario: 'inventario',
  OrdenCompra: 'inventario',
  DetalleOrdenCompra: 'inventario',
  AlertaInventario: 'inventario'
};

module.exports = MODEL_SCHEMAS;