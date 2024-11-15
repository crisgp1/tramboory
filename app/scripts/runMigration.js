const sequelize = require('../config/database');

async function runMigration() {
    try {
        console.log('Iniciando actualización de precios...');
        console.log('Conectando a la base de datos...');
        
        await sequelize.authenticate();
        console.log('Conexión establecida correctamente.');

        console.log('Actualizando registros existentes...');
        const [updatedRows] = await sequelize.query(`
            UPDATE opciones_alimentos 
            SET 
                precio_adulto = CASE 
                    WHEN precio_adulto = 0 THEN ROUND(precio_extra * 0.6, 2)
                    ELSE precio_adulto
                END,
                precio_nino = CASE 
                    WHEN precio_nino = 0 THEN ROUND(precio_extra * 0.4, 2)
                    ELSE precio_nino
                END
            WHERE activo = true
        `);

        console.log(`${updatedRows} registros actualizados.`);
        console.log('Actualización completada exitosamente');

        // Verificar los valores actualizados
        const [opciones] = await sequelize.query(`
            SELECT id, nombre, precio_extra, precio_adulto, precio_nino 
            FROM opciones_alimentos 
            WHERE activo = true
        `);

        console.log('\nValores actualizados:');
        opciones.forEach(opcion => {
            console.log(`ID: ${opcion.id}`);
            console.log(`Nombre: ${opcion.nombre}`);
            console.log(`Precio Extra: ${opcion.precio_extra}`);
            console.log(`Precio Adulto: ${opcion.precio_adulto}`);
            console.log(`Precio Niño: ${opcion.precio_nino}`);
            console.log('-------------------');
        });

        // Cerrar la conexión
        await sequelize.close();
        console.log('Conexión cerrada.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la actualización:');
        console.error('Nombre del error:', error.name);
        console.error('Mensaje:', error.message);
        console.error('Stack:', error.stack);
        
        try {
            await sequelize.close();
            console.log('Conexión cerrada después del error.');
        } catch (closeError) {
            console.error('Error al cerrar la conexión:', closeError);
        }
        
        process.exit(1);
    }
}

// Ejecutar la actualización
console.log('Iniciando script de actualización...');
runMigration();