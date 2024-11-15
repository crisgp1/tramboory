const { Op } = require('sequelize')
const Usuario = require('../models/Usuario')
const  bcrypt = require('bcrypt')

exports.getAllUsuarios = async (req, res) => {
  try {
    const { search } = req.query
    let usuarios

    if (search) {
      usuarios = await Usuario.findAll({
        where: {
          activo: true,  // Solo usuarios activos
          [Op.or]: [
            { nombre: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        }
      })
    } else {
      usuarios = await Usuario.findAll({
        where: {
          activo: true  // Solo usuarios activos
        }
      })
    }

    res.json(usuarios)
  } catch (error) {
    console.error('Error al obtener los usuarios:', error)
    res.status(500).json({ error: 'Error al obtener los usuarios' })
  }
}

exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({
      where: {
        id: req.params.id,
        activo: true  // Solo usuarios activos
      }
    })
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
    const { nombre, email, tipo_usuario, clave } = req.body;
    
    if (!nombre || !email || !tipo_usuario || !clave) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Cifrar la contraseña antes de crear el usuario
    const hashedPassword = await bcrypt.hash(clave, 10);
    
    const usuario = await Usuario.create({ ...req.body, clave: hashedPassword });
    res.status(201).json(usuario);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
}

exports.updateUsuario = async (req, res) => {
  try {
    const [updated] = await Usuario.update(req.body, {
      where: { id: req.params.id, activo: true }  // Solo usuarios activos
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
    const { id } = req.params;
    await Usuario.update({ activo: false }, {
      where: { id },
      silent: true  // Evita la actualización de timestamps
    });
    res.status(200).json({ message: 'Usuario desactivado con éxito' });
  } catch (error) {
    console.error('Error al desactivar el usuario:', error);
    res.status(500).json({ error: 'Error al desactivar el usuario' });
  }
}

exports.getAuthenticatedUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(req.user);
  } catch (error) {
    console.error('Error al obtener el usuario autenticado:', error);
    res.status(500).json({ error: 'Error al obtener el usuario autenticado' });
  }
}