import axios from 'axios';
import { axiosInstance } from '@/components/axiosConfig';

// Servicio para la gestión del carrusel de imágenes en el Home
const API_PATH = '/galeria-home';

// Obtener todas las imágenes activas (para uso público)
export const getImagenesCarousel = async () => {
  try {
    const response = await axiosInstance.get(`${API_PATH}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener imágenes del carrusel:', error);
    throw error;
  }
};

// Obtener todas las promociones activas (para uso público)
export const getPromocionesCarousel = async () => {
  try {
    const response = await axiosInstance.get(`${API_PATH}/promociones`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener promociones del mes:', error);
    throw error;
  }
};

// Obtener todas las imágenes (activas e inactivas) para administración
export const getImagenesCarouselAdmin = async () => {
  try {
    const response = await axiosInstance.get(`${API_PATH}/admin`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener imágenes del carrusel (admin):', error);
    throw error;
  }
};

// Obtener una imagen específica por ID
export const getImagenCarouselById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la imagen con ID ${id}:`, error);
    throw error;
  }
};

// Crear una nueva imagen para el carrusel
export const createImagenCarousel = async (imagenData) => {
  try {
    const response = await axiosInstance.post(`${API_PATH}`, imagenData);
    return response.data;
  } catch (error) {
    console.error('Error al crear la imagen del carrusel:', error);
    throw error;
  }
};

// Actualizar una imagen existente
export const updateImagenCarousel = async (id, imagenData) => {
  try {
    const response = await axiosInstance.put(`${API_PATH}/${id}`, imagenData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la imagen con ID ${id}:`, error);
    throw error;
  }
};

// Actualizar el orden de múltiples imágenes
export const updateImagenesOrden = async (ordenData) => {
  try {
    const response = await axiosInstance.put(`${API_PATH}/orden/actualizar`, ordenData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el orden de las imágenes:', error);
    throw error;
  }
};

// Desactivar una imagen (eliminación lógica)
export const deleteImagenCarousel = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar la imagen con ID ${id}:`, error);
    throw error;
  }
};

// Eliminar permanentemente una imagen
export const purgeImagenCarousel = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_PATH}/purge/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar permanentemente la imagen con ID ${id}:`, error);
    throw error;
  }
};

// Función auxiliar para subir una imagen a Cloudinary
export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
  
  try {
    // Asegurar que el cloud name esté en minúsculas para evitar problemas de sensibilidad a mayúsculas/minúsculas
    const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'tramboory').toLowerCase();
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );
    return {
      url: response.data.secure_url,
      cloudinary_id: response.data.public_id
    };
  } catch (error) {
    console.error('Error al subir imagen a Cloudinary:', error);
    throw error;
  }
};

// Función para subir archivos (PDF, XML, etc.) a Cloudinary
export const uploadFileToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
  
  try {
    // Asegurar que el cloud name esté en minúsculas para evitar problemas
    const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'tramboory').toLowerCase();
    
    // Determina si es un archivo PDF o XML para usar el endpoint correcto
    const resourceType = file.type.includes('pdf') || file.type.includes('xml') ? 'raw' : 'auto';
    
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      formData
    );
    
    return {
      url: response.data.secure_url,
      cloudinary_id: response.data.public_id
    };
  } catch (error) {
    console.error('Error al subir archivo a Cloudinary:', error);
    throw error;
  }
};

// Función para subir múltiples imágenes a Cloudinary
export const uploadMultipleImagesToCloudinary = async (files) => {
  try {
    // Realizar las subidas en paralelo
    const uploadPromises = files.map(file => uploadImageToCloudinary(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error al subir múltiples imágenes a Cloudinary:', error);
    throw error;
  }
};

export default {
  getImagenesCarousel,
  getPromocionesCarousel,
  getImagenesCarouselAdmin,
  getImagenCarouselById,
  createImagenCarousel,
  updateImagenCarousel,
  updateImagenesOrden,
  deleteImagenCarousel,
  purgeImagenCarousel,
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  uploadFileToCloudinary
};