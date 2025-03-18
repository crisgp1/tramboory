import axios from 'axios';
import { getAuthHeaders } from '../utils/authUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Materias Primas (Items)
export const getAllItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/materias-primas`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener items:', error);
    throw error;
  }
};

export const getItemById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/inventario/materias-primas/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener item con id ${id}:`, error);
    throw error;
  }
};

export const createItem = async (itemData) => {
  try {
    const response = await axios.post(`${API_URL}/inventario/materias-primas`, itemData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al crear item:', error);
    throw error;
  }
};

export const updateItem = async (id, itemData) => {
  try {
    const response = await axios.put(`${API_URL}/inventario/materias-primas/${id}`, itemData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar item con id ${id}:`, error);
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/inventario/materias-primas/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar item con id ${id}:`, error);
    throw error;
  }
};

export const getLowStockItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/materias-primas-bajo-stock`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener items con bajo stock:', error);
    throw error;
  }
};

// Proveedores
export const getAllProviders = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/proveedores`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    throw error;
  }
};

export const getProviderById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/inventario/proveedores/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener proveedor con id ${id}:`, error);
    throw error;
  }
};

export const createProvider = async (providerData) => {
  try {
    const response = await axios.post(`${API_URL}/inventario/proveedores`, providerData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    throw error;
  }
};

export const updateProvider = async (id, providerData) => {
  try {
    const response = await axios.put(`${API_URL}/inventario/proveedores/${id}`, providerData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar proveedor con id ${id}:`, error);
    throw error;
  }
};

export const deleteProvider = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/inventario/proveedores/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar proveedor con id ${id}:`, error);
    throw error;
  }
};

// Movimientos de Inventario
export const getAllMovements = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/movimientos`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    throw error;
  }
};

export const getMovementById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/inventario/movimientos/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener movimiento con id ${id}:`, error);
    throw error;
  }
};

export const createMovement = async (movementData) => {
  try {
    const response = await axios.post(`${API_URL}/inventario/movimientos`, movementData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    throw error;
  }
};

export const updateMovement = async (id, movementData) => {
  try {
    const response = await axios.put(`${API_URL}/inventario/movimientos/${id}`, movementData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar movimiento con id ${id}:`, error);
    throw error;
  }
};

export const deleteMovement = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/inventario/movimientos/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar movimiento con id ${id}:`, error);
    throw error;
  }
};

// Unidades de Medida
export const getAllUnits = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/unidades-medida`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener unidades de medida:', error);
    throw error;
  }
};

// Lotes
export const getAllLots = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/lotes`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener lotes:', error);
    throw error;
  }
};

// Alertas de Inventario
export const getActiveAlerts = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/alertas-activas`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener alertas activas:', error);
    throw error;
  }
};

// Tipos de Ajuste
export const getAllAdjustmentTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/inventario/tipos-ajuste`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de ajuste:', error);
    throw error;
  }
};

// Estadísticas e informes
export const getInventoryStats = async () => {
  try {
    const [items, providers, movements, alerts] = await Promise.all([
      getAllItems(),
      getAllProviders(),
      getAllMovements(),
      getActiveAlerts()
    ]);

    return {
      totalItems: items.length,
      totalProviders: providers.length,
      movementsToday: movements.filter(m => {
        const today = new Date().toISOString().split('T')[0];
        return m.fecha.startsWith(today);
      }).length,
      activeAlerts: alerts.length
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de inventario:', error);
    throw error;
  }
};
