import React, { useState, useEffect } from 'react';
import { FiTag, FiFileText, FiImage, FiUpload, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { uploadImageToCloudinary } from '../../services/galeriaService';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { format } from '@cloudinary/url-gen/actions/delivery';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';

const TematicaForm = ({ editingItem, onSave, activeTab }) => {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: editingItem || {}
    });
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');
    const [cloudinaryImg, setCloudinaryImg] = useState(null);
    const [cloudinaryImgError, setCloudinaryImgError] = useState(false);
    const [cloudinary, setCloudinary] = useState(null);

    const foto = watch('foto');

    useEffect(() => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dswklswqw';
        setCloudinary(new Cloudinary({
            cloud: { cloudName }
        }));
    }, []);

    // Inicializar vista previa si hay una imagen
    useEffect(() => {
        if (editingItem?.foto) {
            setImagePreview(editingItem.foto);
        }
    }, [editingItem]);

    // Actualizar vista previa cuando cambia la URL de la imagen
    useEffect(() => {
        if (foto) {
            setImagePreview(foto);
        }
    }, [foto]);

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
                                .width(300)
                                .height(200)
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
                        .width(300)
                        .height(200)
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
            
            // Actualizar el formulario con la URL de Cloudinary
            setValue('foto', result.url);
            
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

    const onSubmit = (data) => {
        onSave(data);
    };

    return (
        <form id={activeTab + 'Form'} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                    <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        {...register('nombre', { required: 'Este campo es requerido' })}
                        type="text"
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nombre de la temática"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <div className="relative">
                    <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                        {...register('descripcion')}
                        className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder="Descripción de la temática"
                    ></textarea>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                
                {/* Selector de archivo y vista previa */}
                <div className="space-y-4">
                    {/* Campo URL */}
                    <div className="relative">
                        <FiImage className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            {...register('foto')}
                            type="text"
                            className="w-full pl-10 pr-3 py-2 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="URL de la imagen de Cloudinary"
                        />
                    </div>
                    
                    {/* Selector de archivo */}
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                <FiUpload className="mr-2" />
                                Seleccionar imagen
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        
                        {/* Mostrar mensaje de estado */}
                        {uploading && (
                            <div className="ml-3 text-sm text-gray-500 flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Subiendo...
                            </div>
                        )}
                        
                        {uploadSuccess && (
                            <div className="ml-3 text-sm text-green-500 flex items-center">
                                <FiCheck className="mr-1" />
                                Imagen subida con éxito
                            </div>
                        )}
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
                        <div className="mt-4">
                            <div className="text-sm text-gray-500 mb-2 flex items-center">
                                <FiImage className="mr-1" />
                                Vista previa:
                            </div>
                            <div className="relative group border border-gray-200 rounded-lg overflow-hidden">
                                {cloudinaryImg && !cloudinaryImgError ? (
                                    <AdvancedImage 
                                        cldImg={cloudinaryImg}
                                        className="w-full h-auto object-cover rounded-lg transition-all duration-300 hover:scale-105"
                                        alt="Vista previa"
                                    />
                                ) : (
                                    <img 
                                        src={imagePreview} 
                                        alt="Vista previa" 
                                        className="w-full h-auto max-h-60 object-contain rounded-lg transition-all duration-300 hover:scale-105"
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
                                        <FiEye size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
};

export default TematicaForm;