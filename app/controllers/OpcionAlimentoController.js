const OpcionAlimento = require('../models/OpcionAlimento');

exports.getAllOpcionesAlimento = async (req, res) => {
    try {
        const opciones = await OpcionAlimento.findAll({
            where: { activo: true }
        });
        res.json(opciones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las opciones de alimento", error: error.message });
    }
};

exports.getOpcionAlimentoById = async (req, res) => {
    try {
        const opcion = await OpcionAlimento.findByPk(req.params.id);
        if (opcion) {
            res.json(opcion);
        } else {
            res.status(404).json({ message: "Opción de alimento no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la opción de alimento", error: error.message });
    }
};

exports.createOpcionAlimento = async (req, res) => {
    try {
        // Validar el turno
        if (!['manana', 'tarde', 'ambos'].includes(req.body.turno)) {
            return res.status(400).json({ 
                message: "Valor de turno inválido. Debe ser 'manana', 'tarde' o 'ambos'" 
            });
        }

        // Validar que precio_extra sea proporcionado y sea un número válido
        if (req.body.precio_extra === undefined || isNaN(Number(req.body.precio_extra))) {
            return res.status(400).json({
                message: "El precio extra es requerido y debe ser un número válido"
            });
        }

        // Establecer valores por defecto y transformar tipos
        const opcionData = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion || '',
            precio_adulto: Number(req.body.precio_adulto) || 0,
            precio_nino: Number(req.body.precio_nino) || 0,
            precio_extra: Number(req.body.precio_extra),
            disponible: req.body.disponible === false ? false : true,
            turno: req.body.turno,
            platillo_adulto: req.body.platillo_adulto,
            platillo_nino: req.body.platillo_nino,
            opcion_papas: req.body.opcion_papas === true ? true : false,
            precio_papas: req.body.opcion_papas ? (Number(req.body.precio_papas) || 19.00) : 19.00,
            activo: true,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date()
        };

        const nuevaOpcion = await OpcionAlimento.create(opcionData);
        res.status(201).json(nuevaOpcion);
    } catch (error) {
        console.error('Error completo:', error);
        res.status(400).json({ 
            message: "Error al crear la opción de alimento", 
            error: error.message,
            details: error.errors?.map(e => e.message)
        });
    }
};

exports.updateOpcionAlimento = async (req, res) => {
    try {
        // Validar el turno si se proporciona
        if (req.body.turno && !['manana', 'tarde', 'ambos'].includes(req.body.turno)) {
            return res.status(400).json({ 
                message: "Valor de turno inválido. Debe ser 'manana', 'tarde' o 'ambos'" 
            });
        }

        // Validar precio_extra si se proporciona
        if (req.body.precio_extra !== undefined && isNaN(Number(req.body.precio_extra))) {
            return res.status(400).json({
                message: "El precio extra debe ser un número válido"
            });
        }

        // Transformar y validar datos
        const opcionData = {
            ...req.body,
            precio_adulto: req.body.precio_adulto !== undefined ? Number(req.body.precio_adulto) : undefined,
            precio_nino: req.body.precio_nino !== undefined ? Number(req.body.precio_nino) : undefined,
            precio_extra: req.body.precio_extra !== undefined ? Number(req.body.precio_extra) : undefined,
            disponible: req.body.disponible !== undefined ? Boolean(req.body.disponible) : undefined,
            opcion_papas: req.body.opcion_papas !== undefined ? Boolean(req.body.opcion_papas) : undefined,
            precio_papas: req.body.opcion_papas ? (Number(req.body.precio_papas) || 19.00) : 19.00,
            fecha_actualizacion: new Date()
        };

        const [updatedRows] = await OpcionAlimento.update(opcionData, {
            where: { id: req.params.id }
        });

        if (updatedRows > 0) {
            const updatedOpcion = await OpcionAlimento.findByPk(req.params.id);
            res.json(updatedOpcion);
        } else {
            res.status(404).json({ message: "Opción de alimento no encontrada" });
        }
    } catch (error) {
        console.error('Error completo:', error);
        res.status(400).json({ 
            message: "Error al actualizar la opción de alimento", 
            error: error.message,
            details: error.errors?.map(e => e.message)
        });
    }
};

exports.deleteOpcionAlimento = async (req, res) => {
    try {
        const [updated] = await OpcionAlimento.update(
            { activo: false },
            { where: { id: req.params.id } }
        );
        if (updated) {
            res.json({ message: "Opción de alimento desactivada con éxito" });
        } else {
            res.status(404).json({ message: "Opción de alimento no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al desactivar la opción de alimento", error: error.message });
    }
};

exports.getOpcionesAlimentoByTurno = async (req, res) => {
    try {
        const { turno } = req.params;
        
        // Validar el turno
        if (!['manana', 'tarde', 'ambos'].includes(turno)) {
            return res.status(400).json({ 
                message: "Valor de turno inválido. Debe ser 'manana', 'tarde' o 'ambos'" 
            });
        }

        const opciones = await OpcionAlimento.findAll({
            where: {
                activo: true,
                turno: [turno, 'ambos']
            }
        });
        res.json(opciones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las opciones de alimento por turno", error: error.message });
    }
};