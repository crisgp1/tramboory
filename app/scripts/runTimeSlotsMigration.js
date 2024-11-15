const sequelize = require('../config/database');

async function runTimeSlotsMigration() {
    try {
        console.log('Iniciando migración de horarios...');
        console.log('Conectando a la base de datos...');
        
        await sequelize.authenticate();
        console.log('Conexión establecida correctamente.');

        console.log('Ejecutando migración de horarios...');

        // Modificar la columna hora_inicio
        await sequelize.query(`
            ALTER TABLE Reservas 
            MODIFY COLUMN hora_inicio TIME 
            DEFAULT NULL
        `);

        // Actualizar los valores existentes de hora_inicio
        await sequelize.query(`
            UPDATE Reservas 
            SET hora_inicio = CASE 
                WHEN hora_inicio = 'mañana' THEN '11:00:00'
                WHEN hora_inicio = 'tarde' THEN '17:00:00'
                ELSE '11:00:00'
            END
        `);

        // Agregar la columna hora_fin si no existe
        await sequelize.query(`
            ALTER TABLE Reservas 
            ADD COLUMN IF NOT EXISTS hora_fin TIME 
            DEFAULT NULL
        `);

        // Actualizar hora_fin basado en hora_inicio
        await sequelize.query(`
            UPDATE Reservas
            SET hora_fin = CASE 
                WHEN hora_inicio = '11:00:00' THEN '16:00:00'
                WHEN hora_inicio = '17:00:00' THEN '22:00:00'
                ELSE '16:00:00'
            END
            WHERE hora_fin IS NULL
        `);

        // Hacer hora_fin NOT NULL
        await sequelize.query(`
            ALTER TABLE Reservas 
            MODIFY COLUMN hora_fin TIME 
            NOT NULL
        `);

        console.log('Migración completada exitosamente');

        // Verificar los valores actualizados
        const [reservas] = await sequelize.query(`
            SELECT id, fecha_reserva, hora_inicio, hora_fin, estado
            FROM Reservas
            ORDER BY fecha_reserva DESC
            LIMIT 5
        `);

        console.log('\nÚltimas 5 reservas actualizadas:');
        reservas.forEach(reserva => {
            console.log(`ID: ${reserva.id}`);
            console.log(`Fecha: ${reserva.fecha_reserva}`);
            console.log(`Hora inicio: ${reserva.hora_inicio}`);
            console.log(`Hora fin: ${reserva.hora_fin}`);
            console.log(`Estado: ${reserva.estado}`);
            console.log('-------------------');
        });

        // Cerrar la conexión
        await sequelize.close();
        console.log('Conexión cerrada.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migración:');
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

// Ejecutar la migración
console.log('Iniciando script de migración de horarios...');
runTimeSlotsMigration();