// controllers/UsuarioController.js
const { Op } = require('sequelize')
const Usuario = require('../models/Usuario')

exports.getAllUsuarios = async (req, res) => {
  try {
    const { search } = req.query
    let usuarios

    if (search) {
      usuarios = await Usuario.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        }
      })
    } else {
      usuarios = await Usuario.findAll()
    }

    res.json(usuarios)
  } catch (error) {
    console.error('Error al obtener los usuarios:', error)
    res.status(500).json({ error: 'Error al obtener los usuarios' })
  }
}

exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id)
    if (usuario) {
      res.json(usuario)
     
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' })
    }
  } catch (error) {
    console.error('Error al obtener el usuario:', error)
    res.status(500).json({ error: 'Error al obtener el usuario' })
  }
}

exports.createUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body)
    res.status(201).json(usuario)
  } catch (error) {
    console.error('Error al crear el usuario:', error)
    res.status(500).json({ error: 'Error al crear el usuario' })
  }
}

exports.updateUsuario = async (req, res) => {
  try {
    const [updated] = await Usuario.update(req.body, {
      where: { id: req.params.id }
    })
    if (updated) {
      const updatedUsuario = await Usuario.findByPk(req.params.id)
      res.json(updatedUsuario)
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' })
    }
  } catch (error) {
    console.error('Error al actualizar el usuario:', error)
    res.status(500).json({ error: 'Error al actualizar el usuario' })
  }
}

exports.deleteUsuario = async (req, res) => {
  try {
    const deleted = await Usuario.destroy({
      where: { id: req.params.id }
    })
    if (deleted) {
      res.status(204).send()
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' })
    }
  } catch (error) {
    console.error('Error al eliminar el usuario:', error)
    res.status(500).json({ error: 'Error al eliminar el usuario' })
  }
}

exports.getAuthenticatedUser = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.userId)
    if (usuario) {
      res.json(usuario)
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' })
    }
  } catch (error) {
    console.error('Error al obtener el usuario autenticado:', error)
    res.status(500).json({ error: 'Error al obtener el usuario autenticado' })
  }
}
