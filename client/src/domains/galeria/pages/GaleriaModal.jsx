import React, { useState, useEffect, useCallback } from 'react';
import { FiUpload, FiLink, FiAlignLeft, FiImage, FiX, FiCheck, FiPlusCircle, FiCamera, FiToggleRight, FiStar, FiCopy } from 'react-icons/fi';
import Modal from '@shared/components/Modal';
import { uploadImageToCloudinary, uploadMultipleImagesToCloudinary } from '@domains/galeria/services/galeriaService';

const GaleriaModal = ({ isOpen, onClose, onSave, editingItem }) => {
  const [formData, setFormData] = useState({
    imagen_url: '',
    cloudinary_id: '',
    descripcion: '',
    activo: true,
    orden: 0,
    es_promocion: false
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filesSelected, setFilesSelected] = useState([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [additionalImageResults, setAdditionalImageResults] = useState([]);

  // Inicializar el formulario con los datos del item a editar
  useEffect(() => {
    if (editingItem) {
      setFormData({
        imagen_url: editingItem.imagen_url || '',
        cloudinary_id: editingItem.cloudinary_id || '',
        descripcion: editingItem.descripcion || '',
        activo: editingItem.activo !== undefined ? editingItem.activo : true,
        orden: editingItem.orden || 0,
        es_promocion: editingItem.es_promocion || false
      });
      setImagePreview(editingItem.imagen_url || '');
      setFilesSelected([]);
    } else {
      resetForm();
    }
  }, [editingItem, isOpen]);

  // Resetear el formulario
  const resetForm = useCallback(() => {
    setFormData({
      imagen_url: '',
      cloudinary_id: '',
      descripcion: '',
      activo: true,
      orden: 0,
      es_promocion: false
    });
    setImagePreview('');
    setFilesSelected([]);
    setSelectedImageIndex(0);
    setError('');
    setUploadProgress(0);
    setUploadSuccess(false);
  }, []);

  // Manejar cambios en los campos del formulario
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Actualizar la previsualización si es la URL de la imagen
    if (name === 'imagen_url') {
      setImagePreview(value);
    }
  }, []);

  // Manejar la selección de archivos para subir
  const handleFileChange = useCallback((e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0) {
      setFilesSelected(prev => [...prev, ...newFiles]);
      
      // Crear URLs para previsualizar las imágenes
      const previewUrl = URL.createObjectURL(newFiles[0]);
      setImagePreview(previewUrl);
      setSelectedImageIndex(filesSelected.length);
    }
  }, [filesSelected.length]);

  // Manejar eventos de arrastrar y soltar
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const newFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );

    if (newFiles.length === 0) {
      setError('Por favor, arrastra solo archivos de imagen.');
      return;
    }

    setFilesSelected(prev => {
      const updatedFiles = [...prev, ...newFiles];
      
      // Crear URL para previsualizar la primera imagen nueva
      if (newFiles.length > 0) {
        const previewUrl = URL.createObjectURL(newFiles[0]);
        setImagePreview(previewUrl);
        setSelectedImageIndex(prev.length);
      }
      
      return updatedFiles;
    });
  }, []);

  // Cambiar la imagen seleccionada para vista previa
  const handleSelectImage = useCallback((index) => {
    if (filesSelected[index]) {
      const previewUrl = URL.createObjectURL(filesSelected[index]);
      setImagePreview(previewUrl);
      setSelectedImageIndex(index);
    }
  }, [filesSelected]);

  // Eliminar una imagen de la selección
  const handleRemoveFile = useCallback((index) => {
    setFilesSelected(prev => {
      const updatedFiles = [...prev];
      updatedFiles.splice(index, 1);
      
      if (updatedFiles.length === 0) {
        setImagePreview('');
        setSelectedImageIndex(-1);
      } else if (selectedImageIndex >= updatedFiles.length) {
        // Si eliminamos la imagen seleccionada y era la última, mostramos la nueva última
        const newIndex = Math.max(0, updatedFiles.length - 1);
        const previewUrl = URL.createObjectURL(updatedFiles[newIndex]);
        setImagePreview(previewUrl);
        setSelectedImageIndex(newIndex);
      } else if (selectedImageIndex === index) {
        // Si eliminamos la imagen seleccionada, mostramos la que está en la misma posición
        const previewUrl = URL.createObjectURL(updatedFiles[selectedImageIndex]);
        setImagePreview(previewUrl);
      }
      
      return updatedFiles;
    });
  }, [selectedImageIndex]);

  // Simular progreso de carga
  const simulateProgressAnimation = useCallback(() => {
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
  }, []);

  // Manejar la subida de imágenes a Cloudinary
  const handleUpload = useCallback(async () => {
    if (filesSelected.length === 0) {
      setError('Por favor selecciona al menos una imagen para subir.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadSuccess(false);
      
      // Iniciamos animación de progreso
      const progressInterval = simulateProgressAnimation();

      let result;
      if (filesSelected.length === 1) {
        // Si hay un solo archivo, usamos la función original
        result = await uploadImageToCloudinary(filesSelected[0]);
        
        setFormData(prev => ({
          ...prev,
          imagen_url: result.url,
          cloudinary_id: result.cloudinary_id
        }));
        
        setImagePreview(result.url);
      } else {
        // Si hay múltiples archivos, usamos la función de carga múltiple
        const results = await uploadMultipleImagesToCloudinary(filesSelected);
        result = results[0]; // Usamos el primero para el formulario actual
        
        setFormData(prev => ({
          ...prev,
          imagen_url: result.url,
          cloudinary_id: result.cloudinary_id
        }));
        
        setImagePreview(result.url);
        
        // Guardar las imágenes adicionales para procesarlas al guardar
        if (results.length > 1) {
          // Guardamos todas las imágenes adicionales excepto la primera que ya se usó
          const additionalImages = results.slice(1).map(img => ({
            url: img.url,
            cloudinary_id: img.cloudinary_id
          }));
          setAdditionalImageResults(additionalImages);
          console.log(`Se subieron ${results.length} imágenes. ${additionalImages.length} adicionales disponibles.`);
        }
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      setFilesSelected([]);
      
    } catch (err) {
      console.error('Error al subir la(s) imagen(es):', err);
      setError('Error al subir la(s) imagen(es). Por favor, intenta de nuevo.');
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 500);
    }
  }, [filesSelected, simulateProgressAnimation]);

  // Manejar el envío del formulario
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.imagen_url) {
      setError('La URL de la imagen es requerida.');
      return;
    }
    
    // Enviar datos al componente padre, incluyendo imágenes adicionales
    onSave(formData, additionalImageResults);
    
    // Limpiar estado de imágenes adicionales después de guardar
    setAdditionalImageResults([]);
  }, [formData, onSave, additionalImageResults]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Editar Imagen' : 'Agregar Nueva Imagen'}
    >
      <form onSubmit={handleSubmit} className="space-y-8 max-h-[80vh] overflow-y-auto px-1 py-2">
        {/* Mensajes de error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 shadow-sm animate-fadeIn">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Layout de dos columnas en pantallas medianas y grandes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna izquierda - Subida y previsualización */}
          <div className="space-y-6">
            {/* Tarjeta de subida de imágenes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <FiCamera className="mr-2 text-blue-500" /> 
                  Subir Imágenes
                </h3>
              </div>
              
              {/* Zona de arrastrar y soltar */}
              <div className="p-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-5 transition-all duration-300 ease-in-out
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50 shadow-inner' 
                      : 'border-gray-300 hover:border-blue-400 bg-white'
                    }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center py-4">
                    <div className="mx-auto h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                      <FiUpload className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {isDragging 
                        ? 'Suelta para añadir imágenes' 
                        : 'Arrastra imágenes aquí'
                      }
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
                      Soporta JPG, PNG y GIF hasta 10MB
                    </p>
                    <div className="mt-4">
                      <label className="inline-flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all duration-200 transform hover:scale-105">
                        <FiPlusCircle className="mr-2" />
                        Seleccionar imágenes
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Botón de carga */}
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={filesSelected.length === 0 || uploading}
                  className={`mt-4 w-full flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-all duration-200 ${
                    filesSelected.length === 0 || uploading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : uploadSuccess 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02]'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02]'
                  }`}
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando imágenes...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <FiCheck className="mr-2" />
                      Subida completada
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      {filesSelected.length > 1 ? `Subir ${filesSelected.length} imágenes` : 'Subir imagen'}
                    </>
                  )}
                </button>
                
                {/* Barra de progreso */}
                {(uploading || uploadProgress > 0) && (
                  <div className="mt-3 relative">
                    <div className="overflow-hidden h-2 text-xs flex rounded-full bg-blue-100">
                      <div 
                        style={{ width: `${uploadProgress}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ease-out ${
                          uploadSuccess ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                        }`}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Progreso</span>
                      <span className="text-xs font-medium text-gray-800">{Math.round(uploadProgress)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          
            {/* Previsualización de la imagen */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <FiImage className="mr-2 text-gray-600" /> 
                  Previsualización
                </h3>
              </div>
              <div className="p-4">
                <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg shadow-inner bg-gray-100">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Previsualización" 
                      className="w-full h-full object-contain transition-all duration-300 ease-in-out hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="mx-auto h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                          <FiImage className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400">Sin previsualización disponible</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Indicador de imágenes seleccionadas */}
                {filesSelected.length > 0 && (
                  <div className="mt-3 bg-blue-50 p-2 rounded-md border border-blue-100">
                    <p className="text-xs text-blue-700 text-center">
                      {filesSelected.length === 1 
                        ? '1 imagen seleccionada'
                        : `${filesSelected.length} imágenes seleccionadas • Mostrando ${selectedImageIndex + 1} de ${filesSelected.length}`
                      }
                    </p>
                  </div>
                )}

                {/* Miniaturas de imágenes seleccionadas */}
                {filesSelected.length > 1 && (
                  <div className="mt-3">
                    <div className="flex overflow-x-auto space-x-2 pb-2 px-1">
                      {filesSelected.map((file, index) => (
                        <div 
                          key={index} 
                          className={`relative flex-shrink-0 group cursor-pointer
                            ${selectedImageIndex === index 
                              ? 'ring-2 ring-blue-500 transform scale-105' 
                              : 'ring-1 ring-gray-200 opacity-70 hover:opacity-100'
                            }`}
                          onClick={() => handleSelectImage(index)}
                        >
                          <div className="h-14 w-14 overflow-hidden rounded-md">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Miniatura ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(index);
                            }}
                            className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md border border-red-100 text-red-500 transition-opacity hover:bg-red-500 hover:text-white hover:border-red-500"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Columna derecha - Información y configuración */}
          <div className="space-y-6">
            {/* URL de la imagen */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <FiLink className="mr-2 text-gray-600" /> 
                  URL de la Imagen
                </h3>
              </div>
              <div className="p-4">
                <div className="relative">
                  <input
                    id="imagen_url"
                    name="imagen_url"
                    type="text"
                    value={formData.imagen_url}
                    onChange={handleChange}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="https://res.cloudinary.com/..."
                  />
                  {formData.imagen_url && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(formData.imagen_url)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copiar URL"
                      >
                        <FiCopy size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Esta URL se actualiza automáticamente al subir una imagen
                </p>
              </div>
            </div>
            
            {/* Descripción */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <FiAlignLeft className="mr-2 text-gray-600" /> 
                  Descripción
                </h3>
              </div>
              <div className="p-4">
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Agrega una descripción para esta imagen..."
                />
              </div>
            </div>
            
            {/* Estado y configuración */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                  <FiToggleRight className="mr-2 text-gray-600" /> 
                  Configuración
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {/* Estado (activo/inactivo) */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg transition-all hover:shadow-sm">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiCheck className={`h-5 w-5 ${formData.activo ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="activo" className="block text-sm font-medium text-gray-700">
                          Imagen activa
                        </label>
                        <span className="text-xs text-gray-500">
                          Determina si la imagen se mostrará en el sitio
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div 
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors ease-in-out duration-200 focus:outline-none ${
                          formData.activo 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'bg-gray-200 border-gray-200'
                        }`}
                      >
                        <span 
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ease-in-out duration-200 ${
                            formData.activo ? 'translate-x-5' : 'translate-x-0'
                          }`} 
                        />
                        <input
                          id="activo"
                          name="activo"
                          type="checkbox"
                          checked={formData.activo}
                          onChange={handleChange}
                          className="absolute opacity-0 h-0 w-0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Promoción */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg transition-all hover:shadow-sm">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-yellow-100 flex items-center justify-center">
                        <FiStar className={`h-5 w-5 ${formData.es_promocion ? 'text-yellow-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="es_promocion" className="block text-sm font-medium text-gray-700">
                          Promoción destacada
                        </label>
                        <span className="text-xs text-gray-500">
                          Destaca esta imagen en la sección de promociones
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div 
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors ease-in-out duration-200 focus:outline-none ${
                          formData.es_promocion 
                            ? 'bg-yellow-500 border-yellow-500' 
                            : 'bg-gray-200 border-gray-200'
                        }`}
                      >
                        <span 
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ease-in-out duration-200 ${
                            formData.es_promocion ? 'translate-x-5' : 'translate-x-0'
                          }`} 
                        />
                        <input
                          id="es_promocion"
                          name="es_promocion"
                          type="checkbox"
                          checked={formData.es_promocion}
                          onChange={handleChange}
                          className="absolute opacity-0 h-0 w-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-gray-200 mt-6 -mx-6 px-6">
          <div className="flex flex-col sm:flex-row-reverse sm:justify-between sm:space-x-3 sm:space-x-reverse space-y-3 sm:space-y-0">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
            >
              {editingItem ? 'Actualizar imagen' : 'Guardar imagen'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default GaleriaModal;