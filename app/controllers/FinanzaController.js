const Finanza = require('../models/Finanza');
const Reserva = require('../models/Reserva');
const Categoria = require('../models/Categoria');
const { Op } = require('sequelize');

exports.getAllFinanzas = async (req, res) => {
  try {
    const finanzas = await Finanza.findAll({
      where: { activo: true },
      include: [
        { 
          model: Reserva,
          as: 'reserva',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva']
        },
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'color']
        }
      ]
    });
    res.json(finanzas);
  } catch (error) {
    console.error('Error al obtener las finanzas:', error);
    res.status(500).json({ error: 'Error al obtener las finanzas' });
  }
};

exports.getFinanzaById = async (req, res) => {
  try {
    const finanza = await Finanza.findOne({
      where: { 
        id: req.params.id,
        activo: true
      },
      include: [
        { 
          model: Reserva,
          as: 'reserva',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva']
        },
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'color']
        }
      ]
    });
    if (finanza) {
      res.json(finanza);
    } else {
      res.status(404).json({ error: 'Finanza no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener la finanza:', error);
    res.status(500).json({ error: 'Error al obtener la finanza' });
  }
};

exports.createFinanza = async (req, res) => {
  try {
    let finanza = await Finanza.create({
      ...req.body,
      activo: true
    });
    
    // Recargar la finanza con las relaciones
    finanza = await Finanza.findOne({
      where: { id: finanza.id },
      include: [
        { 
          model: Reserva,
          as: 'reserva',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva']
        },
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'color']
        }
      ]
    });
    
    res.status(201).json(finanza);
  } catch (error) {
    console.error('Error al crear la finanza:', error);
    res.status(500).json({ error: 'Error al crear la finanza' });
  }
};

exports.updateFinanza = async (req, res) => {
  try {
    const [updated] = await Finanza.update(req.body, {
      where: { 
        id: req.params.id,
        activo: true
      }
    });
    if (updated) {
      const updatedFinanza = await Finanza.findOne({
        where: { id: req.params.id },
        include: [
          { 
            model: Reserva,
            as: 'reserva',
            attributes: ['id', 'nombre_festejado', 'fecha_reserva']
          },
          {
            model: Categoria,
            as: 'categoria',
            attributes: ['id', 'nombre', 'color']
          }
        ]
      });
      res.json(updatedFinanza);
    } else {
      res.status(404).json({ error: 'Finanza no encontrada' });
    }
  } catch (error) {
    console.error('Error al actualizar la finanza:', error);
    res.status(500).json({ error: 'Error al actualizar la finanza' });
  }
};

exports.deleteFinanza = async (req, res) => {
  try {
    const finanza = await Finanza.findByPk(req.params.id);
    
    if (!finanza) {
      return res.status(404).json({ error: 'Finanza no encontrada' });
    }

    if (!finanza.activo) {
      return res.status(409).json({ error: 'La finanza ya está desactivada' });
    }

    // Actualizar usando un bloqueo optimista
    const result = await Finanza.update(
      { activo: false },
      {
        where: { 
          id: req.params.id,
          activo: true
        }
      }
    );

    if (result[0] === 0) {
      const finanzaActual = await Finanza.findByPk(req.params.id);
      if (!finanzaActual.activo) {
        return res.status(409).json({ error: 'La finanza ya fue desactivada por otro proceso' });
      } else {
        return res.status(500).json({ error: 'No se pudo desactivar la finanza' });
      }
    }

    res.json({ message: 'Finanza desactivada con éxito' });
  } catch (error) {
    console.error('Error al desactivar la finanza:', error);
    res.status(500).json({ error: 'Error al desactivar la finanza' });
  }
};

exports.getArchivedFinanzas = async (req, res) => {
  try {
    const finanzas = await Finanza.findAll({
      where: { activo: false },
      include: [
        { 
          model: Reserva,
          as: 'reserva',
          attributes: ['id', 'nombre_festejado', 'fecha_reserva']
        },
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'color']
        }
      ]
    });
    res.json(finanzas);
  } catch (error) {
    console.error('Error al obtener las finanzas archivadas:', error);
    res.status(500).json({ error: 'Error al obtener las finanzas archivadas' });
  }
};

exports.reactivateFinanza = async (req, res) => {
  try {
    const finanza = await Finanza.findByPk(req.params.id);
    
    if (!finanza) {
      return res.status(404).json({ error: 'Finanza no encontrada' });
    }

    if (finanza.activo) {
      return res.status(409).json({ error: 'La finanza ya está activa' });
    }

    // Reactivar la finanza
    const result = await Finanza.update(
      { activo: true },
      {
        where: { 
          id: req.params.id,
          activo: false
        }
      }
    );

    if (result[0] === 0) {
      return res.status(500).json({ error: 'No se pudo reactivar la finanza' });
    }

    res.json({ message: 'Finanza reactivada con éxito' });
  } catch (error) {
    console.error('Error al reactivar la finanza:', error);
    res.status(500).json({ error: 'Error al reactivar la finanza' });
  }
};