const Categoria = require('../models/Categoria');

exports.getAllCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

exports.createCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.create(req.body);
        res.status(201).json(categoria);
    } catch (error) {
        console.error('Error al crear la categoría:', error);
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
};