import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { FiEdit, FiTrash2, FiEye, FiImage, FiArrowUp, FiArrowDown, FiLink, FiCopy, FiCheck, FiAlertCircle, FiX, FiMenu } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import * as galeriaService from '@shared/services/galeriaService';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { format } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { contrast } from '@cloudinary/url-gen/actions/adjust';

const GaleriaTable = forwardRef(({ onEdit, onNewClick }, ref) => {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [cloudinaryImages, setCloudinaryImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const cloudinaryRef = useRef(null);
  const tooltipTimeout = useRef(null);
  
  // Exponer el método loadImagenes a través de la referencia
  useImperativeHandle(ref, () => ({
    loadImagenes
  }));

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

  // Inicializar Cloudinary
  useEffect(() => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dswklswqw';
    cloudinaryRef.current = new Cloudinary({
      cloud: { cloudName }
    });
  }, []);

  // Cargar las imágenes al montar el componente
  useEffect(() => {
    loadImagenes();
  }, []);

  // Procesar las imágenes de Cloudinary
  useEffect(() => {
    if (!cloudinaryRef.current || imagenes.length === 0) return;
    
    const newCloudinaryImages = {};
    const newImageErrors = {};
    
    imagenes.forEach(imagen => {
      try {
        if (!imagen.imagen_url) {
          newImageErrors[imagen.id] = "URL de imagen no disponible";
          return;
        }
        
        const cldImg = getCloudinaryImage(imagen.imagen_url);
        if (cldImg) {
          newCloudinaryImages[imagen.id] = cldImg;
        } else {
          newImageErrors[imagen.id] = "Error al procesar la imagen";
        }
      } catch (err) {
        console.error(`Error procesando imagen ${imagen.id}:`, err);
        newImageErrors[imagen.id] = "Error al procesar la imagen";
      }
    });
    
    setCloudinaryImages(newCloudinaryImages);
    setImageErrors(newImageErrors);
  }, [imagenes]);
  
  // Función para procesar URLs de Cloudinary
  const getCloudinaryImage = (publicId) => {
    if (!publicId || typeof publicId !== 'string' || !cloudinaryRef.current) {
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
          return cloudinaryRef.current.image(imageId)
            .format(autoFormat())
            .quality(auto())
            .resize(
              fill()
                .gravity(autoGravity())
                .width(150)
                .height(100)
            )
            .adjust(contrast(0))
            .setVersion(version.substring(1)); // Quitar la "v" inicial
        }
      }
      
      // Si el ID ya es simple, usarlo directamente
      return cloudinaryRef.current.image(publicId)
        .format(autoFormat())
        .quality(auto())
        .resize(
          fill()
            .gravity(autoGravity())
            .width(150)
            .height(100)
        )
        .adjust(contrast(0));
    } catch (error) {
      console.error('Error al procesar URL de Cloudinary:', error);
      return null;
    }
  };
  
  // Mostrar vista previa ampliada
  const handleImageHover = (imagen) => {
    if (isMobile) return; // No mostrar vista previa en móvil
    
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
    tooltipTimeout.current = setTimeout(() => {
      setPreviewImage(imagen);
    }, 300);
  };
  
  // Ocultar vista previa
  const handleImageLeave = () => {
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
    tooltipTimeout.current = setTimeout(() => {
      setPreviewImage(null);
    }, 300);
  };
  
  // Copiar URL al portapapeles
  const copyImageUrl = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        // Mostrar notificación temporal
        const notification = document.createElement('div');
        notification.className = 'fixed top-16 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
        notification.textContent = 'URL copiada al portapapeles';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 2000);
      })
      .catch(err => {
        console.error('Error al copiar URL:', err);
      });
  };

  // Función para cargar las imágenes
  const loadImagenes = async () => {
    try {
      setLoading(true);
      console.log('Cargando imágenes...');
      const data = await galeriaService.getImagenesCarouselAdmin();
      console.log('Imágenes recibidas:', data);
      if (data && Array.isArray(data)) {
        // Ordenar por el campo orden
        const sortedData = data.sort((a, b) => a.orden - b.orden);
        console.log('Imágenes ordenadas:', sortedData);
        setImagenes(sortedData);
        setError(null);
      } else {
        console.error('Datos recibidos no son un array:', data);
        setImagenes([]);
        setError('Formato de datos incorrecto. Por favor, contacte al administrador.');
      }
    } catch (err) {
      console.error('Error al cargar las imágenes:', err);
      setError('Error al cargar las imágenes. Por favor, intenta de nuevo.');
      setImagenes([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar la eliminación de una imagen
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta imagen? Esta acción eliminará la imagen permanentemente de Cloudinary y no se podrá recuperar.')) {
      try {
        await galeriaService.purgeImagenCarousel(id);
        // Recargar las imágenes
        loadImagenes();
      } catch (err) {
        console.error('Error al eliminar la imagen:', err);
        setError('Error al eliminar la imagen. Por favor, intenta de nuevo.');
      }
    }
  };

  // Manejar cambios en el orden de las imágenes
  const handleOrderChange = async (id, direction) => {
    try {
      const currentIndex = imagenes.findIndex(img => img.id === id);
      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === imagenes.length - 1)
      ) {
        return; // No hacer nada si ya está en el extremo
      }

      // Crear una copia de las imágenes
      const newImagenes = [...imagenes];
      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Intercambiar posiciones
      [newImagenes[currentIndex], newImagenes[swapIndex]] = 
      [newImagenes[swapIndex], newImagenes[currentIndex]];
      
      // Actualizar órdenes
      const updateData = newImagenes.map((img, index) => ({
        id: img.id,
        orden: index
      }));
      
      // Actualizar en el servidor
      await galeriaService.updateImagenesOrden(updateData);
      
      // Actualizar estado local
      setImagenes(newImagenes);
    } catch (err) {
      console.error('Error al cambiar el orden:', err);
      setError('Error al cambiar el orden. Por favor, intenta de nuevo.');
    }
  };

  // Manejar el arrastre y soltar para reordenar
  const handleDragEnd = async (result) => {
    if (!result.destination) return; // Si no hay destino, no hacer nada
    
    try {
      const items = Array.from(imagenes);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      // Actualizar órdenes
      const updateData = items.map((img, index) => ({
        id: img.id,
        orden: index
      }));
      
      // Actualizar en el servidor
      await galeriaService.updateImagenesOrden(updateData);
      
      // Actualizar estado local
      setImagenes(items);
    } catch (err) {
      console.error('Error al reordenar mediante drag and drop:', err);
      setError('Error al reordenar. Por favor, intenta de nuevo.');
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      header: 'Orden',
      accessor: 'orden',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <button 
            onClick={() => handleOrderChange(row.id, 'up')}
            className="p-1 text-blue-500 hover:text-blue-700"
            title="Mover arriba"
          >
            <FiArrowUp />
          </button>
          <button 
            onClick={() => handleOrderChange(row.id, 'down')}
            className="p-1 text-blue-500 hover:text-blue-700"
            title="Mover abajo"
          >
            <FiArrowDown />
          </button>
          <span className="ml-2">{row.orden + 1}</span>
        </div>
      )
    },
    {
      header: 'Imagen',
      accessor: 'imagen_url',
      cell: ({ value, row }) => (
        <div 
          className="relative group"
          onMouseEnter={() => handleImageHover(row)}
          onMouseLeave={handleImageLeave}
        >
          <div className="flex items-center justify-center h-[100px] w-[150px] bg-gray-100 rounded overflow-hidden border border-gray-200">
            {value && cloudinaryImages[row.id] ? (
              <AdvancedImage 
                cldImg={cloudinaryImages[row.id]}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                alt={row.descripcion || 'Imagen de galería'}
              />
            ) : imageErrors[row.id] ? (
              <div className="flex flex-col items-center justify-center text-red-500 p-2 text-center">
                <FiAlertCircle size={24} className="mb-1" />
                <span className="text-xs">Error de imagen</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-2">
                <FiImage size={24} className="mb-1" />
                <span className="text-xs">Sin imagen</span>
              </div>
            )}
          </div>
          
          {/* Acciones rápidas para la imagen */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded">
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(value, '_blank');
                }}
                className="p-1 bg-white/90 rounded-full text-blue-600 hover:bg-white"
                title="Ver imagen completa"
              >
                <FiEye size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyImageUrl(value);
                }}
                className="p-1 bg-white/90 rounded-full text-green-600 hover:bg-white"
                title="Copiar URL"
              >
                <FiCopy size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
                className="p-1 bg-white/90 rounded-full text-purple-600 hover:bg-white"
                title="Editar imagen"
              >
                <FiEdit size={16} />
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Descripción',
      accessor: 'descripcion',
      cell: ({ value, row }) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-800 mb-1 truncate">
            {value || <span className="text-gray-400 italic">Sin descripción</span>}
          </div>
          <div className="text-xs text-gray-500 flex items-center flex-wrap">
            {row.es_promocion && (
              <span className="inline-flex items-center px-2 py-1 mr-2 mb-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                <FiCheck className="mr-1" /> Promoción
              </span>
            )}
            <span className="text-xs text-gray-500">ID: {row.cloudinary_id || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: 'activo',
      cell: ({ value }) => (
        <div className="flex flex-col items-start">
          <span className={`px-2 py-1 rounded-full text-xs ${
            value 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {value ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      )
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <button
            onClick={() => onEdit(row)}
            className="p-1 text-blue-500 hover:text-blue-700"
            title="Editar"
          >
            <FiEdit />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-500 hover:text-red-700"
            title="Eliminar"
          >
            <FiTrash2 />
          </button>
          <a
            href={row.imagen_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-gray-500 hover:text-gray-700"
            title="Ver imagen"
          >
            <FiEye />
          </a>
          <button
            onClick={() => copyImageUrl(row.imagen_url)}
            className="p-1 text-green-500 hover:text-green-700"
            title="Copiar URL"
          >
            <FiCopy />
          </button>
        </div>
      )
    }
  ];

  // Renderizar tarjeta para vista móvil
  const renderMobileCard = (imagen, index) => (
    <Draggable 
      key={imagen.id.toString()} 
      draggableId={imagen.id.toString()} 
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Imagen y orden */}
            <div className="relative w-full sm:w-1/3">
              <div className="flex items-center justify-center h-[180px] bg-gray-100 overflow-hidden">
                {imagen.imagen_url && cloudinaryImages[imagen.id] ? (
                  <AdvancedImage 
                    cldImg={cloudinaryImages[imagen.id]}
                    className="w-full h-full object-cover"
                    alt={imagen.descripcion || 'Imagen de galería'}
                  />
                ) : imageErrors[imagen.id] ? (
                  <div className="flex flex-col items-center justify-center text-red-500 p-2 text-center">
                    <FiAlertCircle size={36} className="mb-1" />
                    <span className="text-sm">Error de imagen</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-2">
                    <FiImage size={36} className="mb-1" />
                    <span className="text-sm">Sin imagen</span>
                  </div>
                )}
                
                {/* Orden */}
                <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-1 text-xs font-bold shadow-sm">
                  #{imagen.orden + 1}
                </div>
              </div>
            </div>
            
            {/* Información */}
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-800 mb-1">
                    {imagen.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      imagen.activo 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {imagen.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    
                    {imagen.es_promocion && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        <FiCheck className="mr-1" /> Promoción
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">ID: {imagen.cloudinary_id || 'N/A'}</p>
                </div>
              </div>
              
              {/* Controles de orden */}
              <div className="flex items-center mb-3 border-t border-b border-gray-100 py-2">
                <span className="text-xs text-gray-500 mr-2">Cambiar orden:</span>
                <button 
                  onClick={() => handleOrderChange(imagen.id, 'up')}
                  className="p-1 text-blue-500 hover:text-blue-700 mr-1"
                  title="Mover arriba"
                  disabled={imagen.orden === 0}
                >
                  <FiArrowUp />
                </button>
                <button 
                  onClick={() => handleOrderChange(imagen.id, 'down')}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title="Mover abajo"
                  disabled={imagen.orden === imagenes.length - 1}
                >
                  <FiArrowDown />
                </button>
              </div>
              
              {/* Acciones */}
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(imagen)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    <FiEdit className="mr-1" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(imagen.id)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                  >
                    <FiTrash2 className="mr-1" /> Eliminar
                  </button>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={imagen.imagen_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
                  >
                    <FiEye className="mr-1" /> Ver
                  </a>
                  <button
                    onClick={() => copyImageUrl(imagen.imagen_url)}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  >
                    <FiCopy className="mr-1" /> Copiar URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-gray-600">Cargando imágenes de la galería...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
        <p>{error}</p>
        <button 
          onClick={loadImagenes}
          className="mt-2 text-sm text-red-800 underline hover:text-red-900"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Galería de Imágenes</h2>
      </div>
      
      {/* Vista previa ampliada al hacer hover (solo para desktop) */}
      {previewImage && !isMobile && (
        <div 
          className="fixed z-50 shadow-xl rounded-lg overflow-hidden border-2 border-white"
          style={{ 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}
          onMouseLeave={handleImageLeave}
        >
          {previewImage.imagen_url && cloudinaryImages[previewImage.id] && (
            <AdvancedImage 
              cldImg={cloudinaryRef.current.image(previewImage.imagen_url)
                .format(autoFormat())
                .quality(auto())
                .resize(fill().gravity(autoGravity()).width(800).height(600))}
              className="max-w-full max-h-full object-contain"
              alt={previewImage.descripcion || 'Vista previa'}
            />
          )}
        </div>
      )}
      
      {/* Mensaje cuando no hay imágenes */}
      {imagenes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
          <FiImage size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 mb-2">No hay imágenes disponibles en la galería</p>
          <button
            onClick={onNewClick}
            className="px-4 py-2 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm"
          >
            Agregar primera imagen
          </button>
        </div>
      ) : (
        <>
          {/* Vista de tarjetas para móvil usando Drag and Drop */}
          {isMobile ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="imagenes-galeria">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {imagenes.map((imagen, index) => (
                      renderMobileCard(imagen, index)
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            /* Vista de tabla para escritorio */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column, index) => (
                      <th 
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {imagenes.map((imagen) => (
                    <tr key={imagen.id} className="hover:bg-gray-50">
                      {columns.map((column, index) => (
                        <td key={index} className="px-6 py-4 whitespace-nowrap">
                          {column.cell({ 
                            value: imagen[column.accessor], 
                            row: imagen 
                          })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default GaleriaTable;
