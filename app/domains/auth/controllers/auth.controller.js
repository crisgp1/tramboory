const Usuario = require('../models/Usuario');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.signup = async (req, res) => {
    const {nombre, email, password, telefono, direccion} = req.body;

    try {
        const existingUser = await Usuario.findOne({where: {email}});
        if (existingUser) {
            return res.status(400).json({message: 'El correo electrónico ya está en uso'});
        }

        const hashedPassword = await argon2.hash(password);
        const newUser = await Usuario.create({
            nombre, 
            email, 
            clave_hash: hashedPassword, 
            telefono, 
            direccion, 
            tipo_usuario: 'cliente'
        });

        res.status(201).json({message: 'Usuario registrado exitosamente', user: newUser});
    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({message: 'Error del servidor, por favor intenta más tarde'});
    }
};

exports.login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({message: 'El correo electrónico y la contraseña son requeridos'});
    }

    try {
        const usuario = await Usuario.findOne({where: {email}});

        if (!usuario) {
            return res.status(401).json({message: 'Correo electrónico o contraseña incorrectos'});
        }

        const validPassword = await argon2.verify(usuario.clave_hash, password);

        if (!validPassword) {
            return res.status(401).json({message: 'Correo electrónico o contraseña incorrectos'});
        }

        const token = jwt.sign({id: usuario.id, userType: usuario.tipo_usuario}, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        console.log('Token generado:', token); // Agregamos este console.log
        res.cookie('token', token, {
            httpOnly: false, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict'
        });
        res.json({token, message: 'Inicio de sesión exitoso', userType: usuario.tipo_usuario});
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({message: 'Error del servidor, por favor intenta más tarde'});
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({message: 'Sesión cerrada exitosamente'});
};

exports.forgotPassword = async (req, res) => {
    const {email} = req.body;

    try {
        const usuario = await Usuario.findOne({where: {email}});

        if (!usuario) {
            return res.status(404).json({message: 'No se encontró ningún usuario con ese correo electrónico'});
        }

        // Aquí deberías implementar la lógica para enviar un correo electrónico con instrucciones
        // para restablecer la contraseña. Por ahora, solo enviaremos un mensaje de éxito.

        res.json({message: 'Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña'});
    } catch (error) {
        console.error('Error en el restablecimiento de contraseña:', error);
        res.status(500).json({message: 'Error del servidor, por favor intenta más tarde'});
    }
};

exports.refreshToken = (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó un token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const newToken = jwt.sign({ id: decoded.id, userType: decoded.userType }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

exports.getAuthenticatedUser = async (req, res) => {
    try {
      const usuario = await Usuario.findByPk(req.userId);
      if (usuario) {
        res.json(usuario);
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error) {
      console.error('Error al obtener el usuario autenticado:', error);
      res.status(500).json({ error: 'Error al obtener el usuario autenticado' });
    }
  };

exports.updateProfile = async (req, res) => {
  const { nombre, telefono, direccion } = req.body;
  
  try {
    const usuario = await Usuario.findByPk(req.userId);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await usuario.update({
      nombre: nombre || usuario.nombre,
      telefono: telefono || usuario.telefono,
      direccion: direccion || usuario.direccion
    });

    res.json({ 
      message: 'Perfil actualizado exitosamente',
      user: usuario
    });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar el perfil' });
  }
};