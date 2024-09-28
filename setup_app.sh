#!/bin/bash

# Crea la estructura de directorios
mkdir -p app/config app/controllers app/middlewares app/models app/routes app/services

# Función para crear archivos con contenido
create_file_with_content() {
  local file_path=$1
  local content=$2
  echo "$content" > $file_path
}

# Contenido de los archivos

# database.js
database_content="const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('nombre_bd', 'usuario', 'contraseña', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});
module.exports = sequelize;"

# Paquete.js
paquete_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Paquete = sequelize.define('Paquete', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'Paquetes',
  timestamps: false
});
module.exports = Paquete;"

# PaqueteAlimento.js
paquete_alimento_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PaqueteAlimento = sequelize.define('PaqueteAlimento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Paquetes_Alimentos',
  timestamps: false
});
module.exports = PaqueteAlimento;"

# Personalizacion.js
personalizacion_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Personalizacion = sequelize.define('Personalizacion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio_adicional: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'Personalizaciones',
  timestamps: false
});
module.exports = Personalizacion;"

# OpcionAlimento.js
opcion_alimento_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const OpcionAlimento = sequelize.define('OpcionAlimento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio_extra: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'Opciones_Alimentos',
  timestamps: false
});
module.exports = OpcionAlimento;"

# Servicio.js
servicio_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Servicio = sequelize.define('Servicio', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre_servicio: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'Servicios',
  timestamps: false
});
module.exports = Servicio;"

# Usuario.js
usuario_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  clave: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tipo_usuario: {
    type: DataTypes.ENUM('cliente', 'admin'),
    allowNull: false
  }
}, {
  tableName: 'Usuarios',
  timestamps: false
});
module.exports = Usuario;"

# Reserva.js
reserva_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  id_paquete: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Paquetes',
      key: 'id'
    }
  },
  id_opcion_alimento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Opciones_Alimentos',
      key: 'id'
    }
  },
  fecha_reserva: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.ENUM('mañana', 'tarde'),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada'),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  nombre_festejado: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  edad_festejado: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Reservas',
  timestamps: false
});
module.exports = Reserva;"

# Finanza.js
finanza_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Finanza = sequelize.define('Finanza', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reservas',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('ingreso', 'gasto'),
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  archivo_prueba: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'Finanzas',
  timestamps: false
});
module.exports = Finanza;"

# Pago.js
pago_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reservas',
      key: 'id'
    }
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  metodo_pago: {
    type: DataTypes.ENUM('tarjeta', 'paypal', 'transferencia'),
    allowNull: false
  }
}, {
  tableName: 'Pagos',
  timestamps: false
});
module.exports = Pago;"

# ReservaPersonalizacion.js
reserva_personalizacion_content="const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ReservaPersonalizacion = sequelize.define('ReservaPersonalizacion', {
  id_reserva: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Reservas',
      key: 'id'
    },
    primaryKey: true
  },
  id_personalizacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Personalizaciones',
      key: 'id'
    },
    primaryKey: true
  }
}, {
  tableName: 'Reservas_Personalizaciones',
  timestamps: false
});
module.exports = ReservaPersonalizacion;"

# PaqueteController.js
paquete_controller_content="const Paquete = require('../models/Paquete');
exports.getAllPaquetes = async (req, res) => {
  try {
    const paquetes = await Paquete.findAll();
    res.json(paquetes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los paquetes' });
  }
};"

# UsuarioController.js
usuario_controller_content="const Usuario = require('../models/Usuario');
exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};"

# PaqueteRoutes.js
paquete_routes_content="const express = require('express');
const router = express.Router();
const PaqueteController = require('../controllers/PaqueteController');

router.get('/', PaqueteController.getAllPaquetes);

module.exports = router;"

# UsuarioRoutes.js
usuario_routes_content="const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

router.get('/', UsuarioController.getAllUsuarios);

module.exports = router;"

# authMiddleware.js
auth_middleware_content="module.exports = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  try {
    // Verificar token
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate token' });
  }
};"

# index.js
index_content="const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Paquete = require('./Paquete');
const PaqueteAlimento = require('./PaqueteAlimento');
const Personalizacion = require('./Personalizacion');
const OpcionAlimento = require('./OpcionAlimento');
const Servicio = require('./Servicio');
const Usuario = require('./Usuario');
const Reserva = require('./Reserva');
const Finanza = require('./Finanza');
const Pago = require('./Pago');
const ReservaPersonalizacion = require('./ReservaPersonalizacion');

Usuario.hasMany(Reserva, { foreignKey: 'id_usuario' });
Reserva.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Paquete.hasMany(Reserva, { foreignKey: 'id_paquete' });
Reserva.belongsTo(Paquete, { foreignKey: 'id_paquete' });

OpcionAlimento.hasMany(Reserva, { foreignKey: 'id_opcion_alimento' });
Reserva.belongsTo(OpcionAlimento, { foreignKey: 'id_opcion_alimento' });

Reserva.belongsToMany(Personalizacion, { through: ReservaPersonalizacion, foreignKey: 'id_reserva' });
Personalizacion.belongsToMany(Reserva, { through: ReservaPersonalizacion, foreignKey: 'id_personalizacion' });

Reserva.hasMany(Finanza, { foreignKey: 'id_reserva' });
Finanza.belongsTo(Reserva, { foreignKey: 'id_reserva' });

Reserva.hasMany(Pago, { foreignKey: 'id_reserva' });
Pago.belongsTo(Reserva, { foreignKey: 'id_reserva' });

module.exports = {
  sequelize,
  Paquete,
  PaqueteAlimento,
  Personalizacion,
  OpcionAlimento,
  Servicio,
  Usuario,
  Reserva,
  Finanza,
  Pago,
  ReservaPersonalizacion
};"

# app.js
app_js_content="const express = require('express');
const { sequelize } = require('./app/models');
const paqueteRoutes = require('./app/routes/paqueteRoutes');
const usuarioRoutes = require('./app/routes/usuarioRoutes');

const app = express();

app.use(express.json());

app.use('/api/paquetes', paqueteRoutes);
app.use('/api/usuarios', usuarioRoutes);

sequelize.sync({ force: false })
  .then(() => {
    console.log('Conexión a la base de datos establecida y modelos sincronizados.');
  })
  .catch(err => {
    console.error('Error al sincronizar con la base de datos:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;"

# Crear los archivos con su contenido
create_file_with_content "app/config/database.js" "$database_content"
create_file_with_content "app/models/Paquete.js" "$paquete_content"
create_file_with_content "app/models/PaqueteAlimento.js" "$paquete_alimento_content"
create_file_with_content "app/models/Personalizacion.js" "$personalizacion_content"
create_file_with_content "app/models/OpcionAlimento.js" "$opcion_alimento_content"
create_file_with_content "app/models/Servicio.js" "$servicio_content"
create_file_with_content "app/models/Usuario.js" "$usuario_content"
create_file_with_content "app/models/Reserva.js" "$reserva_content"
create_file_with_content "app/models/Finanza.js" "$finanza_content"
create_file_with_content "app/models/Pago.js" "$pago_content"
create_file_with_content "app/models/ReservaPersonalizacion.js" "$reserva_personalizacion_content"
create_file_with_content "app/controllers/PaqueteController.js" "$paquete_controller_content"
create_file_with_content "app/controllers/UsuarioController.js" "$usuario_controller_content"
create_file_with_content "app/routes/paqueteRoutes.js" "$paquete_routes_content"
create_file_with_content "app/routes/usuarioRoutes.js" "$usuario_routes_content"
create_file_with_content "app/middlewares/authMiddleware.js" "$auth_middleware_content"
create_file_with_content "app/models/index.js" "$index_content"
create_file_with_content "app.js" "$app_js_content"

echo "Estructura de la carpeta app y archivos creados con éxito."
