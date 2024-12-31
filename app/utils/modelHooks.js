const Auditoria = require('../models/Auditoria');

const registrarAuditoriaModelo = async (instancia, accion, usuario = null) => {
  try {
    const modeloNombre = instancia.constructor.name;
    const detalles = {
      id: instancia.id,
      modelo: modeloNombre,
      cambios: instancia.changed ? instancia.changed() : null
    };

    // Si no hay usuario, usamos el usuario admin (ID 1)
    const usuarioId = usuario ? usuario.id : 1;
    const usuarioNombre = usuario ? usuario.nombre : 'Sistema';

    await Auditoria.create({
      id_usuario: usuarioId,
      nombre_usuario: usuarioNombre,
      transaccion: `${accion} - ${modeloNombre} - ID: ${instancia.id}`,
      fecha_operacion: new Date()
    });
  } catch (error) {
    console.error('Error al registrar auditoría del modelo:', error);
  }
};

const agregarHooksAuditoria = (modelo) => {
  modelo.addHook('afterCreate', async (instancia, options) => {
    await registrarAuditoriaModelo(
      instancia,
      'CREAR',
      options.user
    );
  });

  modelo.addHook('afterUpdate', async (instancia, options) => {
    await registrarAuditoriaModelo(
      instancia,
      'ACTUALIZAR',
      options.user
    );
  });

  modelo.addHook('afterDestroy', async (instancia, options) => {
    await registrarAuditoriaModelo(
      instancia,
      'ELIMINAR',
      options.user
    );
  });
};

module.exports = {
  agregarHooksAuditoria
};