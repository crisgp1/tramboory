const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const databaseConnectionCheck = require('../../middleware/databaseConnectionCheck');

// Aplicar middleware de verificación de conexión a la base de datos a todas las rutas
router.use(databaseConnectionCheck);

// Importar controladores
const UnidadMedidaController = require('../../controllers/Inventory/UnidadMedidaController');
const MateriaPrimaController = require('../../controllers/Inventory/MateriaPrimaController');
const ProveedorController = require('../../controllers/Inventory/ProveedorController');
const MovimientoInventarioController = require('../../controllers/Inventory/MovimientoInventarioController');
const LoteController = require('../../controllers/Inventory/LoteController');
const AlertaInventarioController = require('../../controllers/Inventory/AlertaInventarioController');
const ConversionMedidaController = require('../../controllers/Inventory/ConversionMedidaController');
const TipoAjusteController = require('../../controllers/Inventory/TipoAjusteController');
const ProyeccionInventarioController = require('../../controllers/Inventory/ProyeccionInventarioController');

// Rutas para Unidades de Medida
// Nota: La autenticación ya se maneja globalmente en app.js
router.get('/unidades-medida', UnidadMedidaController.getAllUnidadesMedida);
router.get('/unidades-medida/:id', UnidadMedidaController.getUnidadMedidaById);
router.post('/unidades-medida', UnidadMedidaController.createUnidadMedida);
router.put('/unidades-medida/:id', UnidadMedidaController.updateUnidadMedida);
router.delete('/unidades-medida/:id', UnidadMedidaController.deleteUnidadMedida);
router.get('/unidades-medida/tipo/:tipo', UnidadMedidaController.getUnidadesByTipo);

// Rutas para Materias Primas
router.get('/materias-primas', MateriaPrimaController.getAllMateriasPrimas);
// Rutas específicas deben ir antes de rutas con parámetros dinámicos
router.get('/materias-primas/bajo-stock', MateriaPrimaController.getBajoStock);
router.get('/materias-primas/proximos-caducar', MateriaPrimaController.getProximosACaducar);
router.get('/materias-primas/:id', MateriaPrimaController.getMateriaPrimaById);
router.post('/materias-primas', MateriaPrimaController.createMateriaPrima);
router.put('/materias-primas/:id', MateriaPrimaController.updateMateriaPrima);
router.delete('/materias-primas/:id', MateriaPrimaController.deleteMateriaPrima);

// Rutas para Proveedores
router.get('/proveedores', ProveedorController.getAllProveedores);
router.get('/proveedores/:id', ProveedorController.getProveedorById);
router.post('/proveedores', ProveedorController.createProveedor);
router.put('/proveedores/:id', ProveedorController.updateProveedor);
router.delete('/proveedores/:id', ProveedorController.deleteProveedor);

// Rutas para Movimientos de Inventario
router.get('/movimientos', MovimientoInventarioController.getAllMovimientos);
router.get('/movimientos/:id', MovimientoInventarioController.getMovimientoById);
router.post('/movimientos', MovimientoInventarioController.createMovimiento);
router.put('/movimientos/:id', MovimientoInventarioController.updateMovimiento);
router.delete('/movimientos/:id', MovimientoInventarioController.deleteMovimiento);
router.get('/movimientos/materia-prima/:id', MovimientoInventarioController.getMovimientosByMateriaPrima);
// Nueva ruta para manejo FIFO de salidas de inventario
router.post('/movimientos/salida', MovimientoInventarioController.registrarSalida);
// Ruta para estadísticas de consumo
router.get('/movimientos/estadisticas/consumo', MovimientoInventarioController.obtenerEstadisticasConsumo);

// Rutas para Lotes
router.get('/lotes', LoteController.getAllLotes);
router.get('/lotes/:id', LoteController.getLoteById);
router.post('/lotes', LoteController.createLote);
router.put('/lotes/:id', LoteController.updateLote);
router.delete('/lotes/:id', LoteController.deleteLote);
router.get('/lotes/materia-prima/:id', LoteController.getLotesByMateriaPrima);

// Rutas para Alertas de Inventario
router.get('/alertas', AlertaInventarioController.getAllAlertas);
router.get('/alertas/:id', AlertaInventarioController.getAlertaById);
router.post('/alertas', AlertaInventarioController.createAlerta);
router.put('/alertas/:id', AlertaInventarioController.updateAlerta);
router.delete('/alertas/:id', AlertaInventarioController.deleteAlerta);
router.get('/alertas/activas', AlertaInventarioController.getAlertasActivas);

// Rutas para Conversiones de Medida
router.get('/conversiones', ConversionMedidaController.getAllConversiones);
router.get('/conversiones/:id', ConversionMedidaController.getConversionById);
router.post('/conversiones', ConversionMedidaController.createConversion);
router.put('/conversiones/:id', ConversionMedidaController.updateConversion);
router.delete('/conversiones/:id', ConversionMedidaController.deleteConversion);
router.get('/conversiones/unidad-origen/:id', ConversionMedidaController.getConversionesByUnidadOrigen);
router.get('/conversiones/unidad-destino/:id', ConversionMedidaController.getConversionesByUnidadDestino);

// Rutas para Tipos de Ajuste
router.get('/tipos-ajuste', TipoAjusteController.getAllTiposAjuste);
router.get('/tipos-ajuste/:id', TipoAjusteController.getTipoAjusteById);
router.post('/tipos-ajuste', TipoAjusteController.createTipoAjuste);
router.put('/tipos-ajuste/:id', TipoAjusteController.updateTipoAjuste);
router.delete('/tipos-ajuste/:id', TipoAjusteController.deleteTipoAjuste);

// Rutas para Proyecciones de Inventario
router.get('/proyecciones', ProyeccionInventarioController.obtenerProyeccion);
router.get('/proyecciones/materia-prima/:id', ProyeccionInventarioController.obtenerProyeccionMateriaPrima);
router.get('/proyecciones/reabastecimiento', ProyeccionInventarioController.generarInformeReabastecimiento);
router.get('/proyecciones/caducidad', ProyeccionInventarioController.generarAlertasCaducidad);

module.exports = router;