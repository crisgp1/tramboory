import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiFile, FiExternalLink, FiDownload, FiSearch, FiMaximize, FiMinimize } from 'react-icons/fi';
import { uploadFileToCloudinary } from '../../services/galeriaService';

const CloudinaryFileSelector = ({ 
  value, 
  onChange, 
  placeholder = "Selecciona o sube un archivo",
  acceptTypes = "application/pdf",
  label = "Archivo",
  icon = FiFile,
  readOnly = false,
  showPreview = true
}) => {
  const [selectedFile, setSelectedFile] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [fileType, setFileType] = useState('unknown');

  // Detectar tipo de archivo basado en URL o aceptTypes
  const detectFileType = (url) => {
    if (!url) return 'unknown';
    
    if (url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('/pdf/')) {
      return 'pdf';
    } else if (url.toLowerCase().includes('.xml') || url.toLowerCase().includes('/xml/')) {
      return 'xml';
    } else if (url.toLowerCase().includes('.jp') || url.toLowerCase().includes('.png') || 
              url.toLowerCase().includes('/image/')) {
      return 'image';
    } else if (acceptTypes.includes('pdf')) {
      return 'pdf';
    } else if (acceptTypes.includes('xml')) {
      return 'xml';
    } else if (acceptTypes.includes('image')) {
      return 'image';
    }
    
    return 'unknown';
  };

  // Sincronizar con el valor externo
  useEffect(() => {
    if (value) {
      setSelectedFile(value);
      setFileType(detectFileType(value));
      
      // Extraer el nombre del archivo de la URL
      try {
        const url = new URL(value);
        const pathSegments = url.pathname.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];
        // Eliminar cualquier parámetro de consulta o hash
        const fileNameWithoutParams = lastSegment.split('?')[0].split('#')[0];
        setFileName(fileNameWithoutParams);
      } catch (err) {
        // Si no es una URL válida, usar la última parte de la cadena
        const parts = value.split('/');
        setFileName(parts[parts.length - 1] || 'archivo');
      }
    }
  }, [value]);

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
      setFileName(file.name);
      
      // Iniciamos animación de progreso
      const progressInterval = simulateProgressAnimation();
      
      // Subir el archivo a Cloudinary utilizando la función específica para archivos
      const result = await uploadFileToCloudinary(file);
      
      // Actualizar el campo
      setSelectedFile(result.url);
      onChange(result.url);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
    } catch (err) {
      console.error('Error al subir el archivo:', err);
      setError('Error al subir el archivo. Por favor, intenta de nuevo.');
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setUploading(false);
      }, 500);
    }
  };

  // Función para limpiar el campo
  const clearField = () => {
    setSelectedFile('');
    setFileName('');
    onChange('');
  };

  const toggleFullPreview = () => {
    setShowFullPreview(!showFullPreview);
  };

  // Renderizar el componente con o sin botones de edición según readOnly
  return (
    <div className="space-y-3">
      {/* Campo de URL y botón de subida - solo visible si no es readOnly */}
      {!readOnly && (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={selectedFile}
                onChange={(e) => {
                  setSelectedFile(e.target.value);
                  onChange(e.target.value);
                }}
                className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={placeholder}
              />
              {React.createElement(icon, { 
                className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              })}
            </div>
            <label className="flex-shrink-0 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <FiUpload className="mr-2" />
              Subir
              <input
                type="file"
                className="hidden"
                accept={acceptTypes}
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            {selectedFile && (
              <button
                type="button"
                onClick={clearField}
                className="flex-shrink-0 p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-50"
                title="Limpiar"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>
      )}
      
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
      
      {/* Información del archivo y previsualización */}
      {selectedFile && fileName && (
        <div className="mt-2">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-2 text-sm">
              {React.createElement(icon, { className: "text-indigo-500" })}
              <span className="font-medium text-gray-700 truncate" title={fileName}>
                {fileName}
              </span>
            </div>
            <div className="flex space-x-1">
              {showPreview && (
                <button
                  onClick={toggleFullPreview}
                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-md transition-colors"
                  title={showFullPreview ? "Minimizar vista previa" : "Maximizar vista previa"}
                >
                  {showFullPreview ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
                </button>
              )}
              <a
                href={selectedFile}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                title="Ver archivo en nueva pestaña"
              >
                <FiExternalLink size={16} />
              </a>
              <a
                href={selectedFile}
                download={fileName}
                className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors"
                title="Descargar archivo"
              >
                <FiDownload size={16} />
              </a>
            </div>
          </div>
          
          {/* Vista previa del archivo */}
          {showPreview && selectedFile && (
            <div className={`mt-3 border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ${
              showFullPreview ? 'h-[600px]' : 'h-[300px]'
            }`}>
              {fileType === 'pdf' && (
                <iframe 
                  src={selectedFile} 
                  title="Vista previa de PDF"
                  className="w-full h-full"
                  allowFullScreen
                />
              )}
              {fileType === 'image' && (
                <img 
                  src={selectedFile} 
                  alt="Vista previa" 
                  className="w-full h-full object-contain p-2"
                />
              )}
              {fileType === 'xml' && (
                <div className="w-full h-full p-4 bg-gray-50 overflow-auto">
                  <p className="text-sm text-gray-500 mb-2">
                    Los archivos XML no pueden visualizarse directamente. 
                    Puede descargar el archivo o abrirlo en una nueva pestaña.
                  </p>
                  <div className="flex space-x-2">
                    <a
                      href={selectedFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                    >
                      Abrir en nueva pestaña
                    </a>
                    <a
                      href={selectedFile}
                      download={fileName}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                    >
                      Descargar
                    </a>
                  </div>
                </div>
              )}
              {fileType === 'unknown' && (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500">
                    Vista previa no disponible para este tipo de archivo
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CloudinaryFileSelector;