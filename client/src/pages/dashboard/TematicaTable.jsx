import React, { useMemo, useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiImage, FiAlertCircle, FiX, FiMaximize, FiEye } from 'react-icons/fi';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { format } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';

// Componente para mostrar imágenes a pantalla completa
const ImageLightbox = ({ isOpen, onClose, imageUrl, alt }) => {
  if (!isOpen) return null;

  // Handler para detectar clics en el fondo
  const handleBackdropClick = (e) => {
    // Cerrar el lightbox al hacer clic en cualquier parte
    onClose();
  };

  // Handler para evitar que los clics en la imagen cierren el lightbox
  const handleImageClick = (e) => {
    e.stopPropagation(); // Evita que el clic se propague al fondo
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300"
      onClick={handleBackdropClick} // Cerrar al hacer clic en cualquier parte
    >
      <div className="relative w-full h-full flex flex-col">
        {/* Barra superior con botón de cierre */}
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Contenedor de la imagen */}
        <div className="flex-1 flex items-center justify-center p-4">
          <img 
            src={imageUrl}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={handleImageClick}
          />
        </div>
      </div>
    </div>
  );
};

const TematicaTable = ({ tematicas, handleEditItem, handleDeleteItem }) => {
  const [cloudinary, setCloudinary] = useState(null);
  const [cloudinaryImages, setCloudinaryImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  
  // Estados para el lightbox
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeTematicas = useMemo(() => {
    return tematicas.filter(tematica => tematica.activo);
  }, [tematicas]);

  // Inicializar Cloudinary
  useEffect(() => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dswklswqw';
    setCloudinary(new Cloudinary({
      cloud: { cloudName }
    }));
  }, []);

  // Procesar imágenes de Cloudinary
  useEffect(() => {
    if (!cloudinary || activeTematicas.length === 0) return;
    
    const newCloudinaryImages = {};
    const newImageErrors = {};
    
    activeTematicas.forEach(tematica => {
      try {
        if (!tematica.foto) {
          return;
        }
        
        const cldImg = getCloudinaryImage(tematica.foto);
        if (cldImg) {
          newCloudinaryImages[tematica.id] = cldImg;
        } else {
          newImageErrors[tematica.id] = "Error al procesar la imagen";
        }
      } catch (err) {
        console.error(`Error procesando imagen ${tematica.id}:`, err);
        newImageErrors[tematica.id] = "Error al procesar la imagen";
      }
    });
    
    setCloudinaryImages(newCloudinaryImages);
    setImageErrors(newImageErrors);
  }, [cloudinary, activeTematicas]);

  // Función para procesar URLs de Cloudinary
  const getCloudinaryImage = (publicId) => {
    if (!publicId || typeof publicId !== 'string' || !cloudinary) {
      return null;
    }
    
    try {
      // Si es una URL completa, extraemos el ID y la versión
      if (publicId.includes('cloudinary.com')) {
        // Para URLs de Cloudinary, procesamos correctamente
        const url = new URL(publicId);
        const pathSegments = url.pathname.split('/');
        
        // Buscar si hay una versión (v1234567)
        let versionIndex = -1;
        let idIndex = -1;
        
        for (let i = 0; i < pathSegments.length; i++) {
          if (pathSegments[i].startsWith('v') && /^v\d+$/.test(pathSegments[i])) {
            versionIndex = i;
            idIndex = i + 1;
            break;
          }
        }
        
        // Si encontramos versión e ID
        if (versionIndex >= 0 && idIndex < pathSegments.length) {
          const version = pathSegments[versionIndex];
          let imageId = pathSegments[idIndex];
          
          // Quitar extensión si existe
          if (imageId.includes('.')) {
            imageId = imageId.substring(0, imageId.lastIndexOf('.'));
          }
          
          // Configurar imagen con Cloudinary SDK
          return cloudinary.image(imageId)
            .format(autoFormat())
            .quality(auto())
            .resize(
              fill()
                .gravity(autoGravity())
                .width(80)
                .height(60)
            );
        }
      }
      
      // Si el ID ya es simple, usarlo directamente
      return cloudinary.image(publicId)
        .format(autoFormat())
        .quality(auto())
        .resize(
          fill()
            .gravity(autoGravity())
            .width(80)
            .height(60)
        );
    } catch (error) {
      console.error('Error al procesar URL de Cloudinary:', error);
      return null;
    }
  };

  // Función para abrir el lightbox
  const openLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    setLightboxOpen(true);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">Imagen</th>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Descripción</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activeTematicas.map((tematica) => (
            <tr key={tematica.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-2 w-24">
                <div className="flex items-center justify-center h-16 w-20 bg-gray-100 rounded overflow-hidden group relative">
                  {tematica.foto && cloudinaryImages[tematica.id] ? (
                    <div className="w-full h-full relative group cursor-pointer" onClick={() => openLightbox(tematica.foto)}>
                      <AdvancedImage 
                        cldImg={cloudinaryImages[tematica.id]}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        alt={tematica.nombre || 'Imagen de temática'}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="p-1 bg-white bg-opacity-80 rounded-full">
                          <FiMaximize className="text-indigo-600" size={14} />
                        </div>
                      </div>
                    </div>
                  ) : tematica.foto ? (
                    <div className="w-full h-full relative group cursor-pointer" onClick={() => openLightbox(tematica.foto)}>
                      <img 
                        src={tematica.foto} 
                        alt={tematica.nombre}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null; 
                          setImageErrors(prev => ({...prev, [tematica.id]: true}));
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = `<div class="flex flex-col items-center justify-center text-red-500 p-2 text-center">
                            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <span class="text-xs">Error</span>
                          </div>`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="p-1 bg-white bg-opacity-80 rounded-full">
                          <FiMaximize className="text-indigo-600" size={14} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 p-2">
                      <FiImage size={18} className="mb-1" />
                      <span className="text-xs">Sin imagen</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-2">{tematica.nombre}</td>
              <td className="px-4 py-2">{tematica.descripcion}</td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => handleEditItem(tematica)}
                  className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                  title="Editar"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteItem(tematica.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="Eliminar"
                >
                  <FiTrash2 size={18} />
                </button>
                {tematica.foto && (
                  <button
                    onClick={() => openLightbox(tematica.foto)}
                    className="p-1 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Ver imagen"
                  >
                    <FiEye size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {activeTematicas.length === 0 && (
            <tr>
              <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  <FiAlertCircle className="w-6 h-6 mb-2" />
                  <p>No hay temáticas disponibles</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Lightbox para vista ampliada de imágenes */}
      <ImageLightbox 
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={selectedImage || ''}
        alt="Imagen de temática"
      />
    </div>
  );
};

export default TematicaTable;