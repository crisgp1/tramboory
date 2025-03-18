const GaleriaHome = require('../models/GaleriaHome');
const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary con las credenciales
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dswklswqw', 
  api_key: process.env.CLOUDINARY_API_KEY || '456762825847946', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'y4OC6UV8RCnXhGhZI8ITp_VopAs' 
});

// Obtener todas las imágenes activas ordenadas por el campo 'orden'
exports.getAllImagenes = async (req, res) => {
    try {
        const imagenes = await GaleriaHome.findAll({ 
            where: { activo: true },
            order: [['orden', 'ASC']]
        });
        res.json(imagenes);
    } catch (error) {
        console.error('Error al obtener las imágenes de la galería:', error);
        res.status(500).json({ 
            message: "Error al obtener las imágenes de la galería", 
            error: error.message 
        });
    }
};

// Obtener todas las promociones activas
exports.getPromociones = async (req, res) => {
    try {
        const promociones = await GaleriaHome.findAll({ 
            where: { 
                activo: true,
                es_promocion: true
            },
            order: [['orden', 'ASC']]
        });
        res.json(promociones);
    } catch (error) {
        console.error('Error al obtener las promociones:', error);
        res.status(500).json({ 
            message: "Error al obtener las promociones del mes", 
            error: error.message 
        });
    }
};

// Obtener todas las imágenes (activas e inactivas) - para administración
exports.getAllImagenesAdmin = async (req, res) => {
    try {
        const imagenes = await GaleriaHome.findAll({ 
            order: [['orden', 'ASC']]
        });
        res.json(imagenes);
    } catch (error) {
        console.error('Error al obtener todas las imágenes de la galería:', error);
        res.status(500).json({ 
            message: "Error al obtener todas las imágenes de la galería", 
            error: error.message 
        });
    }
};

// Obtener una imagen por su ID
exports.getImagenById = async (req, res) => {
    try {
        const imagen = await GaleriaHome.findByPk(req.params.id);
        if (imagen) {
            res.json(imagen);
        } else {
            res.status(404).json({ message: "Imagen no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ 
            message: "Error al obtener la imagen", 
            error: error.message 
        });
    }
};

// Crear una nueva imagen
exports.createImagen = async (req, res) => {
    try {
        const nuevaImagen = await GaleriaHome.create(req.body);
        res.status(201).json(nuevaImagen);
    } catch (error) {
        res.status(400).json({ 
            message: "Error al crear la imagen", 
            error: error.message 
        });
    }
};

// Actualizar una imagen existente
exports.updateImagen = async (req, res) => {
    try {
        const [updatedRows] = await GaleriaHome.update(req.body, {
            where: { id: req.params.id }
        });
        
        if (updatedRows > 0) {
            const updatedImagen = await GaleriaHome.findByPk(req.params.id);
            res.json(updatedImagen);
        } else {
            res.status(404).json({ message: "Imagen no encontrada" });
        }
    } catch (error) {
        res.status(400).json({ 
            message: "Error al actualizar la imagen", 
            error: error.message 
        });
    }
};

// Actualizar el orden de múltiples imágenes
exports.updateOrden = async (req, res) => {
    try {
        // req.body debe ser un array de objetos con id y orden
        // [{ id: 1, orden: 0 }, { id: 2, orden: 1 }, ...]
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ 
                message: "Formato incorrecto. Se espera un array de objetos con id y orden" 
            });
        }

        const updates = req.body.map(item => {
            return GaleriaHome.update(
                { orden: item.orden },
                { where: { id: item.id } }
            );
        });

        await Promise.all(updates);
        
        // Obtener el estado actualizado
        const imagenes = await GaleriaHome.findAll({ 
            order: [['orden', 'ASC']]
        });
        
        res.json({
            message: "Orden actualizado correctamente",
            imagenes
        });
    } catch (error) {
        res.status(400).json({ 
            message: "Error al actualizar el orden de las imágenes", 
            error: error.message 
        });
    }
};

// Desactivar una imagen (eliminación lógica)
exports.deleteImagen = async (req, res) => {
    try {
        const [updated] = await GaleriaHome.update(
            { activo: false },
            { where: { id: req.params.id } }
        );
        
        if (updated) {
            res.json({ message: "Imagen desactivada con éxito" });
        } else {
            res.status(404).json({ message: "Imagen no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ 
            message: "Error al desactivar la imagen", 
            error: error.message 
        });
    }
};

// Eliminar una imagen permanentemente
exports.purgeImagen = async (req, res) => {
    try {
        // Primero obtener la imagen para acceder a su cloudinary_id
        const imagen = await GaleriaHome.findByPk(req.params.id);
        
        if (!imagen) {
            return res.status(404).json({ message: "Imagen no encontrada" });
        }
        
        // Si existe un cloudinary_id, eliminar la imagen de Cloudinary
        if (imagen.cloudinary_id) {
            try {
                // Eliminar la imagen de Cloudinary
                const cloudinaryResult = await cloudinary.uploader.destroy(imagen.cloudinary_id);
                console.log('Resultado de Cloudinary:', cloudinaryResult);
                
                if (cloudinaryResult.result !== 'ok' && cloudinaryResult.result !== 'not found') {
                    console.error('Error al eliminar la imagen de Cloudinary:', cloudinaryResult);
                    // Continuamos con la eliminación en BD aunque falle en Cloudinary
                }
            } catch (cloudinaryError) {
                console.error('Error al eliminar la imagen de Cloudinary:', cloudinaryError);
                // Continuamos con la eliminación en BD aunque falle en Cloudinary
            }
        }
        
        // Eliminar el registro de la base de datos
        const deleted = await GaleriaHome.destroy({
            where: { id: req.params.id }
        });
        
        if (deleted) {
            res.json({ 
                message: "Imagen eliminada permanentemente", 
                cloudinaryDeleted: imagen.cloudinary_id ? true : false
            });
        } else {
            res.status(500).json({ message: "Error al eliminar la imagen de la base de datos" });
        }
    } catch (error) {
        console.error('Error en purgeImagen:', error);
        res.status(500).json({ 
            message: "Error al eliminar la imagen", 
            error: error.message 
        });
    }
};