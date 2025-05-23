import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthToken } from '@/utils/authUtils';

// Configuración base para axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Añadir timeout para evitar esperas infinitas
  timeout: 15000, // 15 segundos
});

// Interceptor para añadir el token de autenticación a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para determinar si un error es de conexión
const isConnectionError = (error) => {
  return (
    error.code === 'ECONNABORTED' || // Timeout
    error.message.includes('Network Error') || // Error de red
    !error.response || // Sin respuesta
    error.response.status === 503 || // Servicio no disponible
    error.response.status === 504 // Gateway timeout
  );
};

// Interceptor para manejar errores generales
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el error es de autenticación (401), podríamos redirigir a login
    if (error.response && error.response.status === 401) {
      toast.error('Sesión expirada. Por favor, inicie sesión de nuevo.');
      // window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Manejo específico para errores de conexión a la base de datos
    if (error.response && error.response.status === 503) {
      toast.error('Servicio de base de datos no disponible. Reintentando conexión...', {
        autoClose: 5000, // Mostrar por más tiempo
        toastId: 'db-error', // Prevenir duplicados
      });
      
      // Esperar 2 segundos antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reintentar la solicitud
      return apiClient.request(error.config);
    }
    
    // Manejo de errores de conexión
    if (isConnectionError(error) && error.config && !error.config.__isRetry) {
      // Marcar como reintento para evitar bucles infinitos
      error.config.__isRetry = true;
      
      // No mostrar toast para cada reintento para evitar saturar la interfaz
      console.log('Problema de conexión detectado. Reintentando...');
      
      // Esperar 3 segundos antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Reintentar la solicitud
      return apiClient.request(error.config);
    }
    
    // Control de toasts de error para reducir la cantidad mostrada
    // y usar toastId para prevenir duplicados
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (isConnectionError(error) ? 'Error de conexión con el servidor' : 'Error al comunicarse con el servidor');
    
    if (!error.config?.suppressErrorToast) {
      // Usando toastId basado en la URL y el tipo de error para evitar duplicados
      const toastId = `error-${error.config?.url?.split('/').pop() || 'general'}`;
      toast.error(errorMessage, {
        toastId,
        autoClose: 3000,
      });
    }
    
    return Promise.reject(error);
  }
);

// Función para reintentar una operación con un número máximo de intentos y datos de fallback
const retryOperation = async (operation, maxRetries = 2, delay = 2000, fallbackData = null) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Si no es un error de conexión o es el último intento, no reintentar
      if (!isConnectionError(error) || attempt === maxRetries) {
        // Si es el último intento y tenemos datos de fallback, regresarlos
        if (attempt === maxRetries && fallbackData !== null) {
          console.warn('Usando datos de fallback para', operation.name || 'operación desconocida');
          return fallbackData;
        }
        throw error;
      }
      
      console.log(`Intento ${attempt} fallido, reintentando en ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Aumentar el delay para el próximo intento (backoff exponencial)
      delay = Math.min(delay * 1.5, 10000); // Máximo 10 segundos
    }
  }
  
  // Si tenemos datos de fallback y llegamos aquí, usarlos
  if (fallbackData !== null) {
    console.warn('Usando datos de fallback después de agotar intentos');
    return fallbackData;
  }
  
  throw lastError;
};

// Funciones auxiliares para simplificar las llamadas API con reintentos
const get = (url, fallbackData = []) => 
  retryOperation(
    () => apiClient.get(url).then(response => response.data),
    2, // Máximo 2 reintentos
    2000, // Delay inicial
    fallbackData // Datos de fallback
  );
const post = (url, data) => retryOperation(() => apiClient.post(url, data).then(response => response.data));
const put = (url, data) => retryOperation(() => apiClient.put(url, data).then(response => response.data));
const del = (url) => retryOperation(() => apiClient.delete(url).then(response => response.data));

// ==================== SERVICIOS PARA DASHBOARD ====================

/**
 * Obtiene estadísticas generales para el dashboard
 */
export const getInventoryStats = async () => {
  try {
    // Intentamos obtener datos reales, pero proporcionamos fallbacks para cada llamada
    let materiasPrimas = [];
    let proveedores = [];
    let movimientos = [];
    let alertas = [];
    
    try {
      materiasPrimas = await get('/inventory/materias-primas', []);
    } catch (error) {
      console.warn('Error al obtener materias primas, usando datos fallback:', error);
      materiasPrimas = [];
    }
    
    try {
      proveedores = await get('/inventory/proveedores', []);
    } catch (error) {
      console.warn('Error al obtener proveedores, usando datos fallback:', error);
      proveedores = [];
    }
    
    try {
      movimientos = await get('/inventory/movimientos', []);
    } catch (error) {
      console.warn('Error al obtener movimientos, usando datos fallback:', error);
      movimientos = [];
    }
    
    try {
      alertas = await get('/inventory/alertas?leida=false', []);
    } catch (error) {
      console.warn('Error al obtener alertas, usando datos fallback:', error);
      alertas = [];
    }
    
    // Filtramos movimientos de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const movimientosHoy = movimientos.filter(m => 
      m?.fecha?.startsWith?.(hoy) || false
    ).length;
    
    return {
      totalItems: materiasPrimas.length,
      totalProviders: proveedores.length,
      movementsToday: movimientosHoy,
      activeAlerts: alertas.filter(a => !a?.leida || false).length
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de inventario:', error);
    // Retornamos datos fallback básicos en caso de error
    return {
      totalItems: 0,
      totalProviders: 0,
      movementsToday: 0,
      activeAlerts: 0,
      isUsingFallbackData: true
    };
  }
};

/**
 * Obtiene elementos con stock bajo
 */
export const getLowStockItems = async () => {
  try {
    return await get('/inventory/materias-primas/bajo-stock', []);
  } catch (error) {
    console.error('Error al obtener elementos con bajo stock:', error);
    // Retornar arreglo vacío en lugar de lanzar excepción
    return [];
  }
};

/**
 * Obtiene alertas activas del sistema
 */
export const getActiveAlerts = async () => {
  try {
    return await get('/inventory/alertas?leida=false', []);
  } catch (error) {
    console.error('Error al obtener alertas activas:', error);
    // Retornar arreglo vacío en lugar de lanzar excepción
    return [];
  }
};

// ==================== MATERIAS PRIMAS ====================

/**
 * Obtiene todas las materias primas
 */
export const getAllItems = async () => {
  try {
    return await get('/inventory/materias-primas');
  } catch (error) {
    console.error('Error al obtener materias primas:', error);
    throw error;
  }
};

/**
 * Obtiene una materia prima por ID
 */
export const getItemById = async (id) => {
  try {
    return await get(`/inventory/materias-primas/${id}`);
  } catch (error) {
    console.error(`Error al obtener materia prima con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva materia prima
 */
export const createItem = async (itemData) => {
  try {
    return await post('/inventory/materias-primas', itemData);
  } catch (error) {
    console.error('Error al crear materia prima:', error);
    throw error;
  }
};

/**
 * Actualiza una materia prima existente
 */
export const updateItem = async (id, itemData) => {
  try {
    return await put(`/inventory/materias-primas/${id}`, itemData);
  } catch (error) {
    console.error(`Error al actualizar materia prima con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una materia prima
 */
export const deleteItem = async (id) => {
  try {
    return await del(`/inventory/materias-primas/${id}`);
  } catch (error) {
    console.error(`Error al eliminar materia prima con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene elementos próximos a caducar
 * @param {number} dias - Días límite para considerar próximo a caducar
 */
export const getProximosACaducar = async (dias = 7) => {
  try {
    return await get(`/inventory/materias-primas/proximos-caducar?dias=${dias}`, []);
  } catch (error) {
    console.error('Error al obtener elementos próximos a caducar:', error);
    // Retornar arreglo vacío en lugar de lanzar excepción
    return [];
  }
};

/**
 * Obtiene los movimientos de una materia prima
 */
export const getMovimientosByItem = async (id, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/inventory/materias-primas/${id}/movimientos${queryParams ? `?${queryParams}` : ''}`;
    return await get(url);
  } catch (error) {
    console.error(`Error al obtener movimientos de materia prima ${id}:`, error);
    throw error;
  }
};

// ==================== UNIDADES DE MEDIDA ====================

/**
 * Obtiene todas las unidades de medida
 */
export const getAllUnits = async () => {
  try {
    return await get('/inventory/unidades-medida');
  } catch (error) {
    console.error('Error al obtener unidades de medida:', error);
    throw error;
  }
};

/**
 * Obtiene una unidad de medida por ID
 */
export const getUnitById = async (id) => {
  try {
    return await get(`/inventory/unidades-medida/${id}`);
  } catch (error) {
    console.error(`Error al obtener unidad de medida con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva unidad de medida
 */
export const createUnit = async (unitData) => {
  try {
    return await post('/inventory/unidades-medida', unitData);
  } catch (error) {
    console.error('Error al crear unidad de medida:', error);
    throw error;
  }
};

/**
 * Actualiza una unidad de medida existente
 */
export const updateUnit = async (id, unitData) => {
  try {
    return await put(`/inventory/unidades-medida/${id}`, unitData);
  } catch (error) {
    console.error(`Error al actualizar unidad de medida con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una unidad de medida
 */
export const deleteUnit = async (id) => {
  try {
    return await del(`/inventory/unidades-medida/${id}`);
  } catch (error) {
    console.error(`Error al eliminar unidad de medida con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene unidades de medida por tipo
 */
export const getUnitsByType = async (tipo) => {
  try {
    return await get(`/inventory/unidades-medida/tipo/${tipo}`);
  } catch (error) {
    console.error(`Error al obtener unidades de medida de tipo ${tipo}:`, error);
    throw error;
  }
};

// ==================== CONVERSIONES DE MEDIDA ====================

/**
 * Obtiene todas las conversiones de medida
 */
export const getAllConversiones = async () => {
  try {
    return await get('/inventory/conversiones');
  } catch (error) {
    console.error('Error al obtener conversiones:', error);
    throw error;
  }
};

/**
 * Obtiene una conversión por ID de unidades
 */
export const getConversionById = async (idOrigen, idDestino) => {
  try {
    return await get(`/inventory/conversiones/${idOrigen}/${idDestino}`);
  } catch (error) {
    console.error(`Error al obtener conversión entre unidades ${idOrigen} y ${idDestino}:`, error);
    throw error;
  }
};

/**
 * Crea una nueva conversión
 */
export const createConversion = async (conversionData) => {
  try {
    return await post('/inventory/conversiones', conversionData);
  } catch (error) {
    console.error('Error al crear conversión:', error);
    throw error;
  }
};

/**
 * Actualiza una conversión existente
 */
export const updateConversion = async (idOrigen, idDestino, conversionData) => {
  try {
    return await put(`/inventory/conversiones/${idOrigen}/${idDestino}`, conversionData);
  } catch (error) {
    console.error(`Error al actualizar conversión entre unidades ${idOrigen} y ${idDestino}:`, error);
    throw error;
  }
};

/**
 * Elimina una conversión
 */
export const deleteConversion = async (idOrigen, idDestino) => {
  try {
    return await del(`/inventory/conversiones/${idOrigen}/${idDestino}`);
  } catch (error) {
    console.error(`Error al eliminar conversión entre unidades ${idOrigen} y ${idDestino}:`, error);
    throw error;
  }
};

/**
 * Obtiene conversiones disponibles para una unidad
 */
export const getConversionesDisponibles = async (idUnidad) => {
  try {
    return await get(`/inventory/conversiones/unidad/${idUnidad}`);
  } catch (error) {
    console.error(`Error al obtener conversiones disponibles para unidad ${idUnidad}:`, error);
    throw error;
  }
};

/**
 * Convierte una cantidad entre unidades
 */
export const convertirCantidad = async (conversionData) => {
  try {
    return await post('/inventory/conversiones/convertir', conversionData);
  } catch (error) {
    console.error('Error al convertir cantidad:', error);
    throw error;
  }
};

// ==================== LOTES ====================

/**
 * Obtiene todos los lotes
 */
export const getAllLots = async () => {
  try {
    return await get('/inventory/lotes');
  } catch (error) {
    console.error('Error al obtener lotes:', error);
    throw error;
  }
};

/**
 * Obtiene un lote por ID
 */
export const getLotById = async (id) => {
  try {
    return await get(`/inventory/lotes/${id}`);
  } catch (error) {
    console.error(`Error al obtener lote con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo lote
 */
export const createLot = async (lotData) => {
  try {
    return await post('/inventory/lotes', lotData);
  } catch (error) {
    console.error('Error al crear lote:', error);
    throw error;
  }
};

/**
 * Actualiza un lote existente
 */
export const updateLot = async (id, lotData) => {
  try {
    return await put(`/inventory/lotes/${id}`, lotData);
  } catch (error) {
    console.error(`Error al actualizar lote con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un lote
 */
export const deleteLot = async (id) => {
  try {
    return await del(`/inventory/lotes/${id}`);
  } catch (error) {
    console.error(`Error al eliminar lote con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene lotes por materia prima
 */
export const getLotsByMateriaPrima = async (idMateriaPrima, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/inventory/lotes/materia-prima/${idMateriaPrima}${queryParams ? `?${queryParams}` : ''}`;
    return await get(url);
  } catch (error) {
    console.error(`Error al obtener lotes de materia prima ${idMateriaPrima}:`, error);
    throw error;
  }
};

/**
 * Obtiene lotes próximos a caducar
 */
export const getLotesProximosACaducar = async (dias = 7) => {
  try {
    return await get(`/inventory/lotes/proximos-caducar?dias=${dias}`, []);
  } catch (error) {
    console.error('Error al obtener lotes próximos a caducar:', error);
    // Retornar arreglo vacío en lugar de lanzar excepción
    return [];
  }
};

// ==================== MOVIMIENTOS DE INVENTARIO ====================

/**
 * Obtiene todos los movimientos
 */
export const getAllMovements = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/inventory/movimientos${queryParams ? `?${queryParams}` : ''}`;
    return await get(url);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    throw error;
  }
};

/**
 * Obtiene un movimiento por ID
 */
export const getMovementById = async (id) => {
  try {
    return await get(`/inventory/movimientos/${id}`);
  } catch (error) {
    console.error(`Error al obtener movimiento con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo movimiento
 */
export const createMovement = async (movementData) => {
  try {
    return await post('/inventory/movimientos', movementData);
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    throw error;
  }
};

/**
 * Actualiza un movimiento existente (no suele ser común)
 */
export const updateMovement = async (id, movementData) => {
  try {
    return await put(`/inventory/movimientos/${id}`, movementData);
  } catch (error) {
    console.error(`Error al actualizar movimiento con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un movimiento (no suele ser común)
 */
export const deleteMovement = async (id) => {
  try {
    return await del(`/inventory/movimientos/${id}`);
  } catch (error) {
    console.error(`Error al eliminar movimiento con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene movimientos por materia prima
 */
export const getMovimientosByMateriaPrima = async (idMateriaPrima, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/inventory/movimientos/materia-prima/${idMateriaPrima}${queryParams ? `?${queryParams}` : ''}`;
    return await get(url);
  } catch (error) {
    console.error(`Error al obtener movimientos de materia prima ${idMateriaPrima}:`, error);
    throw error;
  }
};

/**
 * Obtiene movimientos por lote
 */
export const getMovimientosByLote = async (idLote, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/inventory/movimientos/lote/${idLote}${queryParams ? `?${queryParams}` : ''}`;
    return await get(url);
  } catch (error) {
    console.error(`Error al obtener movimientos de lote ${idLote}:`, error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de movimientos de inventario (entradas y salidas) por periodo
 */
export const getMovementStats = async () => {
  try {
    return await get('/inventory/movimientos/estadisticas/consumo', {
      // Datos fallback para estadísticas de movimientos
      entradas: [],
      salidas: [],
      periodos: []
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de movimiento:', error);
    // Retornar datos fallback para que la UI pueda mostrar algo
    return {
      entradas: [],
      salidas: [],
      periodos: [],
      isUsingFallbackData: true
    };
  }
};

// ==================== PROVEEDORES ====================

/**
 * Obtiene todos los proveedores
 */
export const getAllProviders = async () => {
  try {
    return await get('/inventory/proveedores');
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

/**
 * Obtiene un proveedor por ID
 */
export const getProviderById = async (id) => {
  try {
    return await get(`/inventory/proveedores/${id}`);
  } catch (error) {
    console.error(`Error al obtener proveedor con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo proveedor
 */
export const createProvider = async (providerData) => {
  try {
    return await post('/inventory/proveedores', providerData);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    throw error;
  }
};

/**
 * Actualiza un proveedor existente
 */
export const updateProvider = async (id, providerData) => {
  try {
    return await put(`/inventory/proveedores/${id}`, providerData);
  } catch (error) {
    console.error(`Error al actualizar proveedor con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un proveedor
 */
export const deleteProvider = async (id) => {
  try {
    return await del(`/inventory/proveedores/${id}`);
  } catch (error) {
    console.error(`Error al eliminar proveedor con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Busca proveedores por término
 */
export const searchProviders = async (termino) => {
  try {
    return await get(`/inventory/proveedores/buscar?termino=${termino}`);
  } catch (error) {
    console.error(`Error al buscar proveedores con término "${termino}":`, error);
    throw error;
  }
};

/**
 * Obtiene órdenes de compra por proveedor
 */
export const getOrdenesCompraByProveedor = async (idProveedor, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/inventory/proveedores/${idProveedor}/ordenes${queryParams ? `?${queryParams}` : ''}`;
    return await get(url);
  } catch (error) {
    console.error(`Error al obtener órdenes de compra de proveedor ${idProveedor}:`, error);
    throw error;
  }
};

// ==================== TIPOS DE AJUSTE ====================

/**
 * Obtiene todos los tipos de ajuste
 */
export const getAllAdjustmentTypes = async () => {
  try {
    return await get('/inventory/tipos-ajuste');
  } catch (error) {
    console.error('Error al obtener tipos de ajuste:', error);
    throw error;
  }
};

/**
 * Obtiene un tipo de ajuste por ID
 */
export const getAdjustmentTypeById = async (id) => {
  try {
    return await get(`/inventory/tipos-ajuste/${id}`);
  } catch (error) {
    console.error(`Error al obtener tipo de ajuste con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo tipo de ajuste
 */
export const createAdjustmentType = async (typeData) => {
  try {
    return await post('/inventory/tipos-ajuste', typeData);
  } catch (error) {
    console.error('Error al crear tipo de ajuste:', error);
    throw error;
  }
};

/**
 * Actualiza un tipo de ajuste existente
 */
export const updateAdjustmentType = async (id, typeData) => {
  try {
    return await put(`/inventory/tipos-ajuste/${id}`, typeData);
  } catch (error) {
    console.error(`Error al actualizar tipo de ajuste con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un tipo de ajuste
 */
export const deleteAdjustmentType = async (id) => {
  try {
    return await del(`/inventory/tipos-ajuste/${id}`);
  } catch (error) {
    console.error(`Error al eliminar tipo de ajuste con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene tipos de ajuste que requieren autorización
 */
export const getTiposAjusteAutorizacion = async () => {
  try {
    return await get('/inventory/tipos-ajuste/autorizacion');
  } catch (error) {
    console.error('Error al obtener tipos de ajuste que requieren autorización:', error);
    throw error;
  }
};

/**
 * Obtiene tipos de ajuste que afectan costos
 */
export const getTiposAjusteCostos = async () => {
  try {
    return await get('/inventory/tipos-ajuste/costos');
  } catch (error) {
    console.error('Error al obtener tipos de ajuste que afectan costos:', error);
    throw error;
  }
};

// ==================== ALERTAS DE INVENTARIO ====================

/**
 * Obtiene todas las alertas
 */
export const getAllAlertas = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/inventory/alertas${queryParams ? `?${queryParams}` : ''}`;
    return await get(url);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    throw error;
  }
};

/**
 * Obtiene una alerta por ID
 */
export const getAlertaById = async (id) => {
  try {
    return await get(`/inventory/alertas/${id}`);
  } catch (error) {
    console.error(`Error al obtener alerta con ID ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene alertas pendientes
 */
export const getAlertasPendientes = async () => {
  try {
    return await get('/inventory/alertas/pendientes');
  } catch (error) {
    console.error('Error al obtener alertas pendientes:', error);
    throw error;
  }
};

/**
 * Marca una alerta como leída
 */
export const marcarComoLeida = async (id) => {
  try {
    return await put(`/inventory/alertas/${id}/leer`, {});
  } catch (error) {
    console.error(`Error al marcar alerta ${id} como leída:`, error);
    throw error;
  }
};

/**
 * Marca todas las alertas como leídas
 */
export const marcarTodasComoLeidas = async (tipo = undefined) => {
  try {
    const url = tipo 
      ? `/inventory/alertas/leer-todas?tipo=${tipo}` 
      : '/inventory/alertas/leer-todas';
    return await put(url, {});
  } catch (error) {
    console.error('Error al marcar todas las alertas como leídas:', error);
    throw error;
  }
};

/**
 * Obtiene alertas por tipo
 */
export const getAlertasPorTipo = async (tipo, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `/inventory/alertas/tipo/${tipo}${queryParams ? `?${queryParams}` : ''}`;
    return await get(url);
  } catch (error) {
    console.error(`Error al obtener alertas de tipo ${tipo}:`, error);
    throw error;
  }
};

/**
 * Obtiene resumen de alertas
 */
export const getResumenAlertas = async () => {
  try {
    return await get('/inventory/alertas/resumen');
  } catch (error) {
    console.error('Error al obtener resumen de alertas:', error);
    throw error;
  }
};

export default {
  // Dashboard
  getInventoryStats,
  getLowStockItems,
  getActiveAlerts,
  
  // Materias Primas
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getProximosACaducar,
  getMovimientosByItem,
  
  // Unidades de Medida
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  getUnitsByType,
  
  // Conversiones
  getAllConversiones,
  getConversionById,
  createConversion,
  updateConversion,
  deleteConversion,
  getConversionesDisponibles,
  convertirCantidad,
  
  // Lotes
  getAllLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  getLotsByMateriaPrima,
  getLotesProximosACaducar,
  
  // Movimientos
  getAllMovements,
  getMovementById,
  createMovement,
  updateMovement,
  deleteMovement,
  getMovimientosByMateriaPrima,
  getMovimientosByLote,
  getMovementStats,
  
  // Proveedores
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  searchProviders,
  getOrdenesCompraByProveedor,
  
  // Tipos de Ajuste
  getAllAdjustmentTypes,
  getAdjustmentTypeById,
  createAdjustmentType,
  updateAdjustmentType,
  deleteAdjustmentType,
  getTiposAjusteAutorizacion,
  getTiposAjusteCostos,
  
  // Alertas
  getAllAlertas,
  getAlertaById,
  getAlertasPendientes,
  marcarComoLeida,
  marcarTodasComoLeidas,
  getAlertasPorTipo,
  getResumenAlertas,
  getMovementStats
};