const { Op } = require('sequelize');
const Proveedor = require('../../models/Inventory/Proveedor');
const OrdenCompra = require('../../models/Inventory/OrdenCompra');
const Usuario = require('../../models/Usuario');

exports.getAllProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });
    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({
      error: 'Error al obtener proveedores',
      details: error.message
    });
  }
};

exports.getProveedorById = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      where: {
        id: req.params.id,
        activo: true
      },
      include: [{
        model: OrdenCompra,
        as: 'ordenesCompra',
        where: {
          activo: true,
          estado: {
            [Op.ne]: 'cancelada'
          }
        },
        required: false,
        limit: 5,
        order: [['fecha_solicitud', 'DESC']]
      }]
    });

    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json(proveedor);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({
      error: 'Error al obtener proveedor',
      details: error.message
    });
  }
};

exports.createProveedor = async (req, res) => {
  try {
    const {
      nombre,
      razon_social,
      rfc,
      telefono,
      email,
      direccion,
      productos_servicios,
      condiciones_pago,
      tiempo_entrega_promedio,
      notas
    } = req.body;

    // Validaciones básicas
    if (!nombre || !productos_servicios) {
      return res.status(400).json({
        error: 'Nombre y productos/servicios son campos requeridos'
      });
    }

    // Validar email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Formato de email inválido'
        });
      }
    }

    // Validar RFC si se proporciona
    if (rfc) {
      const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(rfc)) {
        return res.status(400).json({
          error: 'Formato de RFC inválido'
        });
      }
    }

    // Verificar si ya existe un proveedor con el mismo RFC o razón social
    if (rfc || razon_social) {
      const existente = await Proveedor.findOne({
        where: {
          activo: true,
          [Op.or]: [
            rfc ? { rfc } : null,
            razon_social ? { razon_social } : null
          ].filter(Boolean)
        }
      });

      if (existente) {
        return res.status(409).json({
          error: 'Ya existe un proveedor con el mismo RFC o razón social'
        });
      }
    }

    const proveedor = await Proveedor.create({
      nombre,
      razon_social,
      rfc,
      telefono,
      email,
      direccion,
      productos_servicios,
      condiciones_pago,
      tiempo_entrega_promedio,
      notas
    });

    res.status(201).json(proveedor);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({
      error: 'Error al crear proveedor',
      details: error.message
    });
  }
};

exports.updateProveedor = async (req, res) => {
  try {
    const {
      nombre,
      razon_social,
      rfc,
      telefono,
      email,
      direccion,
      productos_servicios,
      condiciones_pago,
      tiempo_entrega_promedio,
      notas
    } = req.body;

    // Validaciones básicas
    if (!nombre || !productos_servicios) {
      return res.status(400).json({
        error: 'Nombre y productos/servicios son campos requeridos'
      });
    }

    // Validar email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Formato de email inválido'
        });
      }
    }

    // Validar RFC si se proporciona
    if (rfc) {
      const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(rfc)) {
        return res.status(400).json({
          error: 'Formato de RFC inválido'
        });
      }
    }

    // Verificar si ya existe otro proveedor con el mismo RFC o razón social
    if (rfc || razon_social) {
      const existente = await Proveedor.findOne({
        where: {
          id: { [Op.ne]: req.params.id },
          activo: true,
          [Op.or]: [
            rfc ? { rfc } : null,
            razon_social ? { razon_social } : null
          ].filter(Boolean)
        }
      });

      if (existente) {
        return res.status(409).json({
          error: 'Ya existe otro proveedor con el mismo RFC o razón social'
        });
      }
    }

    const [updated] = await Proveedor.update(req.body, {
      where: {
        id: req.params.id,
        activo: true
      }
    });

    if (!updated) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    const proveedor = await Proveedor.findByPk(req.params.id);
    res.json(proveedor);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({
      error: 'Error al actualizar proveedor',
      details: error.message
    });
  }
};

exports.deleteProveedor = async (req, res) => {
  try {
    // Verificar si tiene órdenes de compra activas
    const ordenesActivas = await OrdenCompra.findOne({
      where: {
        id_proveedor: req.params.id,
        activo: true,
        estado: {
          [Op.in]: ['pendiente', 'aprobada']
        }
      }
    });

    if (ordenesActivas) {
      return res.status(409).json({
        error: 'No se puede eliminar el proveedor porque tiene órdenes de compra activas'
      });
    }

    const [deleted] = await Proveedor.update(
      { activo: false },
      {
        where: {
          id: req.params.id,
          activo: true
        }
      }
    );

    if (!deleted) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    res.json({ message: 'Proveedor eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      error: 'Error al eliminar proveedor',
      details: error.message
    });
  }
};

exports.searchProveedores = async (req, res) => {
  try {
    const { termino } = req.query;

    if (!termino) {
      return res.status(400).json({
        error: 'Se requiere un término de búsqueda'
      });
    }

    const proveedores = await Proveedor.findAll({
      where: {
        activo: true,
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${termino}%` } },
          { productos_servicios: { [Op.iLike]: `%${termino}%` } },
          { razon_social: { [Op.iLike]: `%${termino}%` } }
        ]
      },
      order: [['nombre', 'ASC']]
    });

    res.json(proveedores);
  } catch (error) {
    console.error('Error al buscar proveedores:', error);
    res.status(500).json({
      error: 'Error al buscar proveedores',
      details: error.message
    });
  }
};

exports.getOrdenesCompra = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.query;

    const where = {
      id_proveedor: id,
      activo: true
    };

    if (estado) {
      where.estado = estado;
    }

    const ordenes = await OrdenCompra.findAll({
      where,
      order: [['fecha_solicitud', 'DESC']],
      include: [{
        model: Usuario,
        as: 'usuarioCreador',
        attributes: ['nombre']
      }]
    });

    res.json(ordenes);
  } catch (error) {
    console.error('Error al obtener órdenes de compra del proveedor:', error);
    res.status(500).json({
      error: 'Error al obtener órdenes de compra del proveedor',
      details: error.message
    });
  }
};