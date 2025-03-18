import React, { useState, useMemo } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiX, FiMaximize } from 'react-icons/fi';
import { formatNumber } from '../../utils/formatters';

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

const MamparaTable = ({ mamparas, tematicas, handleEditItem, handleDeleteItem }) => {
  // Estado para el lightbox
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeMamparas = useMemo(() => {
    return Array.isArray(mamparas) ? mamparas.filter(mampara => mampara.activo) : [];
  }, [mamparas]);

  const getTematicaNombre = (id_tematica) => {
    if (Array.isArray(tematicas)) {
      const tematica = tematicas.find(t => t.id === id_tematica);
      return tematica ? tematica.nombre : 'No especificada';
    }
    return 'No especificada';
  };

  // Función para abrir el lightbox con la imagen seleccionada
  const openLightbox = (imageUrl) => {
    setSelectedImage(imageUrl);
    setLightboxOpen(true);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Imagen</th>
            <th className="px-4 py-2 text-left">Piezas</th>
            <th className="px-4 py-2 text-left">Precio</th>
            <th className="px-4 py-2 text-left">Temática</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {activeMamparas.map((mampara) => (
            <tr key={mampara.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-2">{mampara.id}</td>
              <td className="px-4 py-2">
                {mampara.foto ? (
                  <div className="relative group w-14 h-14">
                    <img
                      src={mampara.foto}
                      alt={`Mampara de ${mampara.piezas} piezas`}
                      className="w-14 h-14 object-cover rounded-md border border-gray-200 cursor-pointer"
                      onClick={() => openLightbox(mampara.foto)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/60x60?text=Error';
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded-md"
                      onClick={() => openLightbox(mampara.foto)}
                    >
                      <div className="p-1 bg-white bg-opacity-80 rounded-full">
                        <FiMaximize className="text-indigo-600" size={14} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Sin imagen</span>
                )}
              </td>
              <td className="px-4 py-2">{mampara.piezas}</td>
              <td className="px-4 py-2">{formatNumber(mampara.precio)}</td>
              <td className="px-4 py-2">{getTematicaNombre(mampara.id_tematica)}</td>
              <td className="px-4 py-2 flex justify-center space-x-2">
                <button
                  onClick={() => handleEditItem(mampara)}
                  className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                  title="Editar"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteItem(mampara.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="Eliminar"
                >
                  <FiTrash2 size={18} />
                </button>
                {mampara.foto && (
                  <button
                    onClick={() => openLightbox(mampara.foto)}
                    className="p-1 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors"
                    title="Ver imagen"
                  >
                    <FiEye size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Lightbox para vista ampliada de imágenes */}
      <ImageLightbox 
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={selectedImage || ''}
        alt="Imagen de mampara"
      />
    </div>
  );
};

export default MamparaTable;
