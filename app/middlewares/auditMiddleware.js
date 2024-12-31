const Auditoria = require('../models/Auditoria');

const auditMiddleware = async (req, res, next) => {
    // Guardar la respuesta original para capturar el resultado
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    try {
        // Capturar información de la petición
        const requestInfo = {
            method: req.method,
            path: req.path,
            query: req.query,
            body: req.body,
            params: req.params,
            ip: req.ip,
            timestamp: new Date()
        };

        // Modificar res.send para capturar la respuesta
        res.send = function (data) {
            try {
                const responseBody = data;
                const statusCode = res.statusCode;
                
                // Registrar en auditoría solo si hay un usuario autenticado
                if (req.user) {
                    Auditoria.create({
                        id_usuario: req.user.id,
                        nombre_usuario: req.user.nombre,
                        transaccion: JSON.stringify({
                            operacion: `${req.method} ${req.path}`,
                            request: requestInfo,
                            response: {
                                statusCode,
                                body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
                            }
                        })
                    }).catch(error => {
                        console.error('Error al registrar auditoría:', error);
                    });
                }
            } catch (error) {
                console.error('Error en middleware de auditoría:', error);
            }

            originalSend.apply(res, arguments);
        };

        // Modificar res.json para capturar la respuesta JSON
        res.json = function (data) {
            try {
                const responseBody = data;
                const statusCode = res.statusCode;
                
                // Registrar en auditoría solo si hay un usuario autenticado
                if (req.user) {
                    Auditoria.create({
                        id_usuario: req.user.id,
                        nombre_usuario: req.user.nombre,
                        transaccion: JSON.stringify({
                            operacion: `${req.method} ${req.path}`,
                            request: requestInfo,
                            response: {
                                statusCode,
                                body: responseBody
                            }
                        })
                    }).catch(error => {
                        console.error('Error al registrar auditoría:', error);
                    });
                }
            } catch (error) {
                console.error('Error en middleware de auditoría:', error);
            }

            originalJson.apply(res, arguments);
        };

        // Modificar res.end para capturar otros tipos de respuestas
        res.end = function (chunk, encoding) {
            try {
                if (chunk) {
                    const responseBody = chunk;
                    const statusCode = res.statusCode;
                    
                    // Registrar en auditoría solo si hay un usuario autenticado
                    if (req.user) {
                        Auditoria.create({
                            id_usuario: req.user.id,
                            nombre_usuario: req.user.nombre,
                            transaccion: JSON.stringify({
                                operacion: `${req.method} ${req.path}`,
                                request: requestInfo,
                                response: {
                                    statusCode,
                                    body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)
                                }
                            })
                        }).catch(error => {
                            console.error('Error al registrar auditoría:', error);
                        });
                    }
                }
            } catch (error) {
                console.error('Error en middleware de auditoría:', error);
            }

            originalEnd.apply(res, arguments);
        };

        next();
    } catch (error) {
        console.error('Error en middleware de auditoría:', error);
        next();
    }
};

module.exports = auditMiddleware;