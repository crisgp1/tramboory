import React, { useState, useRef, useEffect } from 'react';
import { FiImage, FiInfo, FiPlus } from 'react-icons/fi';
import GaleriaTable from './GaleriaTable.jsx';
import GaleriaModal from './GaleriaModal.jsx';
import * as galeriaService from '@/services/galeriaService';

const GaleriaManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Referencia a la tabla de galería usando useRef
  const galeriaTableRef = useRef(null);

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Mostrar notificación temporal
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Abrir modal para crear nueva imagen
  const handleNewClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar imagen existente
  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Guardar nueva imagen o actualizar existente
  const handleSave = async (formData, additionalImages = []) => {
    try {
      setIsLoading(true);
      let message = '';
      
      if (editingItem) {
        // Actualizar imagen existente
        await galeriaService.updateImagenCarousel(editingItem.id, formData);
        message = 'Imagen actualizada correctamente';
      } else {
        // Crear nueva imagen principal
        await galeriaService.createImagenCarousel(formData);
        
        // Si hay imágenes adicionales, guardarlas también
        if (additionalImages && additionalImages.length > 0) {
          // Procesamos las imágenes adicionales en paralelo
          const promises = additionalImages.map(imagen => 
            galeriaService.createImagenCarousel({
              imagen_url: imagen.url,
              cloudinary_id: imagen.cloudinary_id,
              descripcion: formData.descripcion,
              activo: formData.activo,
              es_promocion: false, // Por defecto, solo la primera se marca como promoción
              orden: formData.orden
            })
          );
          
          await Promise.all(promises);
          message = `${additionalImages.length + 1} imágenes agregadas correctamente`;
        } else {
          message = 'Imagen agregada correctamente';
        }
      }
      
      // Cerrar modal y limpiar estado
      setIsModalOpen(false);
      setEditingItem(null);
      
      // Mostrar notificación de éxito
      showNotification(message);
      
      // Forzar recarga de tabla usando la referencia de React
      console.log('Intentando recargar imágenes...');
      if (galeriaTableRef.current && typeof galeriaTableRef.current.loadImagenes === 'function') {
        console.log('Recargando imágenes de la galería');
        galeriaTableRef.current.loadImagenes();
      } else {
        console.warn('No se pudo acceder al método loadImagenes en la referencia de la tabla');
      }
    } catch (error) {
      console.error('Error al guardar la(s) imagen(es):', error);
      showNotification(
        `Error al ${editingItem ? 'actualizar' : 'guardar'} la(s) imagen(es). ${error.message || 'Intente nuevamente'}`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full px-2 sm:px-4 py-4 sm:py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Galería</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Administra las imágenes que aparecen en el carrusel de la página principal
          </p>
        </div>
        <div>
          <button
            onClick={handleNewClick}
            className="w-full sm:w-auto flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 shadow-sm"
            disabled={isLoading}
          >
            {isMobile ? (
              <FiPlus className="mr-1" />
            ) : (
              <FiImage className="mr-2" />
            )}
            {isMobile ? 'Agregar' : 'Agregar Imagen'}
          </button>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <div
          className={`mb-4 p-3 sm:p-4 rounded-md ${
            notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          <div className="flex items-center">
            <FiInfo className="mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-2 sm:p-4 md:p-6">
          <GaleriaTable
            onEdit={handleEditClick}
            onNewClick={handleNewClick}
            ref={galeriaTableRef}
          />
        </div>
      </div>

      {/* Modal para crear/editar imagen */}
      <GaleriaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default GaleriaManagement;