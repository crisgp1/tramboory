import React, { useState, useEffect, useCallback } from 'react';
import { FiUpload, FiCheck, FiX, FiImage, FiEye, FiGrid, FiSearch, FiExternalLink } from 'react-icons/fi';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { format } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';
import { uploadImageToCloudinary, getImagenesCarouselAdmin } from '../../services/galeriaService';

const CloudinaryImageSelector = ({ 
  value, 
  onChange, 
  placeholder = "Selecciona o sube una imagen",
  previewSize = "small", // small, medium, large
  showBrowseOption = true
}) => {
  const [selectedImage, setSelectedImage] = useState(value || '');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [cloudinary, setCloudinary] = useState(null);
  const [cloudinaryImg, setCloudinaryImg] = useState(null);
  const [cloudinaryImgError, setCloudinaryImgError] = useState(false);
  const [showExistingImages, setShowExistingImages] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredImages, setFilteredImages] = useState([]);

  // Definir el tamaño de la vista previa según la prop
  const previewSizes = {
    small: { width: 120, height: 80, containerClass: "h-20" },
    medium: { width: 240, height: 160, containerClass: "h-40" },
    large: { width: 300, height: 200, containerClass: "h-52" }
  };
  
  const currentPreviewSize = previewSizes[previewSize] || previewSizes.small;

  // Inicializar Cloudinary
  useEffect(() => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dswklswqw';
    setCloudinary(new Cloudinary({
      cloud: { cloudName }
    }));
  }, []);

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value) {
      setSelectedImage(value);
      setImagePreview(value);
    }
  }, [value]);

  // Actualizar la vista previa cuando cambia la URL de la imagen
  useEffect(() => {
    if (selectedImage) {
      setImagePreview(selectedImage);
    }
  }, [selectedImage]);

  // Procesar la imagen de Cloudinary para previsualización
  useEffect(() => {
    if (!cloudinary || !imagePreview) return;
    
    try {
      const cldImg = getCloudinaryImage(imagePreview);
      setCloudinaryImg(cldImg);
      setCloudinaryImgError(false);
    } catch (err) {
      console.error('Error procesando imagen de Cloudinary:', err);
      setCloudinaryImgError(true);
    }
  }, [cloudinary, imagePreview]);
  
  // Filtrar imágenes basadas en el término de búsqueda
  useEffect(() => {
    if (!existingImages || existingImages.length === 0) return;
    
    if (!searchTerm) {
      setFilteredImages(existingImages);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = existingImages.filter(img => 
      (img.descripcion && img.descripcion.toLowerCase().includes(term)) ||
      (img.cloudinary_id && img.cloudinary_id.toLowerCase().includes(term))
    );
    setFilteredImages(filtered);
  }, [searchTerm, existingImages]);

  // Función para procesar URLs de Cloudinary
  const getCloudinaryImage = (publicId) => {
    if (!publicId || typeof publicId !== 'string' || !cloudinary) {
      return null;
    }
    
    try {
      // Si es una URL completa, extraemos el ID
      if (publicId.includes('cloudinary.com')) {
        // Procesar correctamente las URLs de Cloudinary
        const url = new URL(publicId);
        const pathSegments = url.pathname.split('/');
        
        // Buscar versión e ID
        let versionIndex = -1;
        let idIndex = -1;
        
        for (let i = 0; i < pathSegments.length; i++) {
          if (pathSegments[i].startsWith('v') && /^v\d+$/.test(pathSegments[i])) {
            versionIndex = i;
            idIndex = i + 1;
            break;
          }
        }
        
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
                .width(currentPreviewSize.width)
                .height(currentPreviewSize.height)
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
            .width(currentPreviewSize.width)
            .height(currentPreviewSize.height)
        );
    } catch (error) {
      console.error('Error al procesar URL de Cloudinary:', error);
      return null;
    }
  };

  // Simular progreso de carga
  const simulateProgressAnimation = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + (Math.random() * 10);
      });
    }, 200);
    return interval;
  };

  // Manejar la selección de archivos para subir
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setUploading(true);
      setError('');
      setUploadSuccess(false);
      
      // Iniciamos animación de progreso
      const progressInterval = simulateProgressAnimation();
      
      // Crear URL para previsualizar la imagen
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Subir la imagen a Cloudinary
      const result = await uploadImageToCloudinary(file);
      
      // Actualizar el campo
      setSelectedImage(result.url);
      onChange(result.url);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
    } catch (err) {
      console.error('Error al subir la imagen:', err);
      setError('Error al subir la imagen. Por favor, intenta de nuevo.');
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 500);
    }
  };

  // Cargar imágenes existentes
  const loadExistingImages = useCallback(async () => {
    if (showExistingImages) return; // Si ya están visibles, solo cambiar el estado
    
    setLoadingImages(true);
    try {
      // Usar el servicio para cargar imágenes de la galería
      const images = await getImagenesCarouselAdmin();
      setExistingImages(images);
      setFilteredImages(images);
      setShowExistingImages(true);
    } catch (error) {
      console.error('Error al cargar imágenes existentes:', error);
      setError('No se pudieron cargar las imágenes existentes.');
    } finally {
      setLoadingImages(false);
    }
  }, [showExistingImages]);

  // Seleccionar una imagen existente
  const selectExistingImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    onChange(imageUrl);
    setShowExistingImages(false);
  };

  return (
    <div className="space-y-3">
      {/* Campo de URL y botón de subida */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={selectedImage}
              onChange={(e) => {
                setSelectedImage(e.target.value);
                onChange(e.target.value);
              }}
              className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={placeholder}
            />
            <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <label className="flex-shrink-0 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
            <FiUpload className="mr-2" />
            Subir
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          {showBrowseOption && (
            <button
              type="button"
              onClick={loadExistingImages}
              className="flex-shrink-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={loadingImages}
            >
              {loadingImages ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FiGrid className="mr-2" />
              )}
              Explorar
            </button>
          )}
        </div>
      </div>
      
      {/* Barra de progreso */}
      {(uploading || uploadProgress > 0) && (
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-indigo-100">
            <div 
              style={{ width: `${uploadProgress}%` }} 
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ease-out ${
                uploadSuccess ? 'bg-green-500' : 'bg-indigo-500'
              }`}
            ></div>
          </div>
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="text-sm text-red-500 mt-1 flex items-center">
          <FiX className="mr-1" />
          {error}
        </div>
      )}
      
      {/* Vista previa de la imagen */}
      {imagePreview && (
        <div className="mt-2">
          <div className="text-sm text-gray-500 mb-1 flex items-center">
            <FiImage className="mr-1" />
            Vista previa:
          </div>
          <div className={`relative group border border-gray-200 rounded-lg overflow-hidden ${currentPreviewSize.containerClass}`}>
            {cloudinaryImg && !cloudinaryImgError ? (
              <AdvancedImage 
                cldImg={cloudinaryImg}
                className="w-full h-full object-cover rounded-lg transition-all duration-300 hover:scale-105"
                alt="Vista previa"
              />
            ) : (
              <img 
                src={imagePreview} 
                alt="Vista previa" 
                className="w-full h-full object-cover rounded-lg transition-all duration-300 hover:scale-105"
                onError={() => setCloudinaryImgError(true)}
              />
            )}
            
            {/* Botón para ver imagen completa */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
              <a
                href={imagePreview}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/90 rounded-full text-blue-600 hover:bg-white"
                title="Ver imagen completa"
              >
                <FiEye size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Selector de imágenes existentes */}
      {showExistingImages && (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 shadow-sm p-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Imágenes disponibles</h3>
            <button
              type="button"
              onClick={() => setShowExistingImages(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={18} />
            </button>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar imágenes..."
              className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {loadingImages ? (
            <div className="flex justify-center items-center p-6">
              <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {searchTerm ? 'No se encontraron imágenes con ese término' : 'No hay imágenes disponibles'}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-60 overflow-y-auto p-1">
              {filteredImages.map((image, index) => (
                <div 
                  key={index} 
                  className="relative group cursor-pointer border border-gray-200 rounded-md overflow-hidden hover:border-indigo-500 transition-all"
                  onClick={() => selectExistingImage(image.imagen_url)}
                >
                  {cloudinary ? (
                    <AdvancedImage 
                      cldImg={cloudinary.image(image.imagen_url)
                        .format(autoFormat())
                        .quality(auto())
                        .resize(fill().gravity(autoGravity()).width(120).height(80))}
                      className="w-full h-20 object-cover"
                      alt={image.descripcion || `Imagen ${index + 1}`}
                    />
                  ) : (
                    <img 
                      src={image.imagen_url} 
                      alt={image.descripcion || `Imagen ${index + 1}`}
                      className="w-full h-20 object-cover" 
                    />
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center p-1">
                      <FiExternalLink size={16} className="mx-auto mb-1" />
                      <span className="text-xs">Seleccionar</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageSelector;