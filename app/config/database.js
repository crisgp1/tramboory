require('dotenv').config();
const { Sequelize } = require('sequelize');
const dns = require('dns');
const { promisify } = require('util');
const net = require('net');

// Configurar DNS para preferir IPv4
dns.setDefaultResultOrder('ipv4first');

// Obtener el searchPath como array de los schemas
const schemas = process.env.SCHEMAS ? process.env.SCHEMAS.split(',') : ['main', 'usuarios', 'finanzas', 'inventario', 'public'];
const defaultSchema = process.env.SCHEMA || 'main';

// Promisify DNS lookup
const lookup = promisify(dns.lookup);

// Función para verificar conectividad de host
async function checkHostConnectivity(hostname) {
  try {
    // Forzar IPv4 lookup
    const { address, family } = await lookup(hostname, { family: 4 });
    console.log(`Hostname ${hostname} resuelto a: ${address} (IPv${family})`);
    
    // Verificar la conectividad intentando establecer un socket TCP
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const port = process.env.DB_PORT || 5432;
      
      // Set timeout for connection attempt
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        console.log(`✅ Conectividad TCP exitosa a ${address}:${port}`);
        socket.destroy();
        resolve({ address, family, connected: true });
      });
      
      socket.on('timeout', () => {
        console.log(`⚠️ Timeout al conectar a ${address}:${port}`);
        socket.destroy();
        resolve({ address, family, connected: false });
      });
      
      socket.on('error', (err) => {
        console.log(`❌ Error al conectar a ${address}:${port}: ${err.message}`);
        resolve({ address, family, connected: false });
      });
      
      socket.connect(port, address);
    });
  } catch (error) {
    console.error(`❌ Error al resolver el hostname ${hostname}:`, error.message);
    return null;
  }
}

// Configurar sequelize
let sequelize;

// Verificar si estamos usando una variable de entorno para local development
const useLocalDB = process.env.USE_LOCAL_DB === 'true';

// Función para crear opciones de conexión con valores predeterminados seguros
const createConnectionOptions = (isLocal = false) => {
  const baseOptions = {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    timezone: '-06:00',
    dialectOptions: {
      useUTC: false,
      dateStrings: true,
      typeCast: true,
      connectTimeout: 60000,
      ipv6: false,
      // Configuración SSL para Supabase
      ssl: !isLocal && process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 60000,
      idle: 30000,
      evict: 30000
    },
    retry: {
      max: 5,
      timeout: 15000
    },
    define: {
      schema: defaultSchema
    },
    hooks: {
      afterConnect: async (connection) => {
        try {
          // Establecer el search_path para incluir todos los schemas
          const searchPathStr = schemas.join(', ');
          await connection.query(`SET search_path TO ${searchPathStr};`);
          console.log(`Search path establecido correctamente: ${searchPathStr}`);
          
          // Configurar el usuario actual para los triggers de auditoría
          await connection.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (SELECT 1 FROM pg_settings WHERE name = 'app.id_usuario_actual') THEN
                PERFORM set_config('app.id_usuario_actual', '0', false);
              END IF;
            END $$;
          `);
          console.log('Variable de usuario actual configurada');
        } catch (error) {
          console.error('Error al configurar la conexión:', error);
        }
      }
    }
  };
  
  return baseOptions;
};

// Crear la instancia de Sequelize
const createSequelizeInstance = () => {
  // Preferir usar DATABASE_URL para asegurar consistencia en la conexión
  if (process.env.DATABASE_URL && !useLocalDB) {
    console.log('🔄 Usando DATABASE_URL para la conexión a Supabase');
    return new Sequelize(process.env.DATABASE_URL, {
      ...createConnectionOptions(false),
      // Cuando usamos URL, algunas opciones se deben incluir aquí en vez de en dialectOptions
      ssl: process.env.DB_SSL === 'true',
      dialectOptions: {
        ...createConnectionOptions(false).dialectOptions,
        // Asegurarnos de que se use una familia de direcciones específica
        family: 4  // Forzar IPv4
      }
    });
  } else if (useLocalDB) {
    console.log('⚠️ Usando base de datos local debido a la configuración.');
    return new Sequelize(
      process.env.LOCAL_DB_NAME || 'tramboory_db',
      process.env.LOCAL_DB_USER || 'postgres',
      process.env.LOCAL_DB_PASSWORD || 'postgres',
      {
        ...createConnectionOptions(true),
        host: process.env.LOCAL_DB_HOST || 'localhost',
        port: process.env.LOCAL_DB_PORT || 5432,
        dialectOptions: {
          ...createConnectionOptions(true).dialectOptions,
          family: 4  // Forzar IPv4
        }
      }
    );
  } else {
    console.log('🔄 Usando configuración estándar con DB_HOST, DB_USER, etc.');
    return new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        ...createConnectionOptions(false),
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialectOptions: {
          ...createConnectionOptions(false).dialectOptions,
          family: 4  // Forzar IPv4
        }
      }
    );
  }
};

// Inicialización inmediata
sequelize = createSequelizeInstance();

// Función para probar la conexión a la base de datos
async function testConnection() {
  try {
    // Verificar primero si podemos resolver el host
    if (!useLocalDB) {
      const hostInfo = await checkHostConnectivity(process.env.DB_HOST);
      if (!hostInfo) {
        console.warn(`⚠️ No se pudo resolver el host ${process.env.DB_HOST}. Revisar conectividad de red.`);
      }
    }
    
    // Intentar autenticar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    
    // Información adicional para ayudar en la depuración
    console.log('\n--- INFORMACIÓN DE DEPURACIÓN ---');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Puerto: ${process.env.DB_PORT}`);
    console.log(`Base de datos: ${process.env.DB_NAME}`);
    console.log(`Usuario: ${process.env.DB_USER}`);
    console.log(`Contraseña: ${'*'.repeat(8)}`);
    
    // Sugerencias de solución
    console.log('\n--- POSIBLES SOLUCIONES ---');
    console.log('1. Verificar que las credenciales en el archivo .env sean correctas');
    console.log('2. Comprobar si el servicio de Supabase está operativo');
    console.log('3. Verificar la conectividad de red con el host de la base de datos');
    console.log('4. Para desarrollo local, considerar usar USE_LOCAL_DB=true en el .env');
    
    return false;
  }
}

// Función para cambiar a base de datos local si es necesario
async function switchToLocalIfNeeded() {
  if (useLocalDB) return; // Ya estamos usando local
  
  try {
    // Verificar primero la conectividad usando sockets TCP
    if (!useLocalDB) {
      const connectivityResult = await checkHostConnectivity(process.env.DB_HOST);
      
      if (!connectivityResult || !connectivityResult.connected) {
        console.warn(`⚠️ No se pudo conectar directamente a ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        
        // Si no hay conectividad, intentar configurar explícitamente para usar localhost
        if (process.env.DB_HOST === 'db.rbducdqtlgtqrpwwltvg.supabase.co') {
          console.log('🔄 Probando conectividad directa a Supabase usando dirección IPv4 explícita...');
          
          // Intentar resolver el hostname a IPv4 y probar esa dirección específicamente
          try {
            // Intenta reconstruir la conexión usando el URL con la dirección IPv4
            const { address } = await lookup('db.rbducdqtlgtqrpwwltvg.supabase.co', { family: 4 });
            const connectionStr = `postgresql://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${address}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
            
            console.log(`🔄 Intentando conexión alternativa usando la dirección IPv4: ${address}`);
            
            // Crear una nueva instancia de Sequelize con la dirección IP explícita
            const tempSequelize = new Sequelize(connectionStr, {
              ...createConnectionOptions(false),
              ssl: process.env.DB_SSL === 'true',
              dialectOptions: {
                ...createConnectionOptions(false).dialectOptions,
                family: 4  // Forzar IPv4
              }
            });
            
            await tempSequelize.authenticate();
            console.log('✅ Conexión exitosa usando dirección IPv4 explícita');
            
            // Si tiene éxito, reemplazar la instancia principal
            sequelize = tempSequelize;
            return;
          } catch (ipv4Error) {
            console.error('❌ Error al conectar usando dirección IPv4 explícita:', ipv4Error.message);
          }
        }
      }
    }
    
    // Intentar con la configuración actual
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa con la configuración primaria');
  } catch (error) {
    console.warn('⚠️ Error al conectar con la base de datos principal:', error.message);
    
    if (!useLocalDB) {
      console.log('🔄 Intentando con base de datos local...');
      
      // Crear nueva instancia con configuración local
      const localOptions = createConnectionOptions(true);
      localOptions.host = process.env.LOCAL_DB_HOST || 'localhost';
      localOptions.port = process.env.LOCAL_DB_PORT || 5432;
      
      try {
        const tempSequelize = new Sequelize(
          process.env.LOCAL_DB_NAME || 'tramboory_db',
          process.env.LOCAL_DB_USER || 'postgres',
          process.env.LOCAL_DB_PASSWORD || 'postgres',
          {
            ...localOptions,
            dialectOptions: {
              ...localOptions.dialectOptions,
              family: 4  // Forzar IPv4
            }
          }
        );
        
        await tempSequelize.authenticate();
        console.log('✅ Conectado exitosamente a la base de datos local de respaldo');
        
        // Reemplazar la instancia principal
        sequelize = tempSequelize;
      } catch (localError) {
        console.error('❌ También falló la conexión a la base de datos local:', localError);
        
        // Volver a la configuración original
        console.warn('⚠️ Volviendo a la configuración original sin base de datos');
      }
    }
  }
}

// Exportar tanto sequelize como las funciones auxiliares
module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.switchToLocalIfNeeded = switchToLocalIfNeeded;