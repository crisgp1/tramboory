const errorHandler = (err, req, res, next) => {
    // Log error details
    console.error('Error detallado:', {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Send appropriate response
    res.status(err.status || 500).json({
        error: err.message || 'Error interno del servidor',
        path: req.path,
        timestamp: new Date().toISOString()
    });
};

module.exports = errorHandler;