const fs = require('fs').promises;
const path = require('path');
const sequelize = require('../config/database');

async function executeMigration(filePath) {
    try {
        console.log(`Ejecutando migración: ${filePath}`);
        const sql = await fs.readFile(filePath, 'utf8');
        
        // Ejecutar cada sentencia SQL por separado para evitar problemas con transacciones
        const statements = sql
            .replace(/^\s*BEGIN\s*;|^\s*COMMIT\s*;/gm, '') // Quitar BEGIN/COMMIT existentes
            .split(';')
            .filter(statement => statement.trim().length > 0);
        
        for (const statement of statements) {
            try {
                await sequelize.query(`${statement};`, {
                    raw: true,
                    logging: false,
                    type: sequelize.QueryTypes.RAW
                });
            } catch (statementError) {
                // Manejar errores comunes sin detener todo el proceso
                if (statementError.parent && (
                    statementError.parent.code === '42704' || // Objeto no encontrado
                    statementError.parent.code === '42710' || // Objeto duplicado
                    statementError.parent.code === '25P02'    // Transacción abortada
                )) {
                    console.warn(`Advertencia en sentencia: ${
                        statementError.parent.code === '42710' ? 'Objeto duplicado' : 
                        statementError.parent.code === '42704' ? 'Objeto no encontrado' : 
                        'Transacción abortada'
                    }. Continuando...`);
                    
                    // Si hay una transacción abortada, intentar hacer ROLLBACK
                    if (statementError.parent.code === '25P02') {
                        try {
                            await sequelize.query('ROLLBACK;', {
                                raw: true,
                                logging: false
                            });
                        } catch (rollbackError) {
                            console.warn('No se pudo hacer ROLLBACK:', rollbackError.message);
                        }
                    }
                } else {
                    console.error(`Error en sentencia SQL: ${statement}`);
                    throw statementError;
                }
            }
        }
        
        console.log(`Migración completada: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`Error en la migración ${filePath}:`, error);
        throw error;
    }
}

async function runMigrations() {
    try {
        const migrationsPath = path.join(__dirname, '../database/migrations');
        const files = await fs.readdir(migrationsPath);
        
        // Ordenar los archivos para asegurar que se ejecuten en orden correcto
        const sortedFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort((a, b) => {
                // Asegurar que 000_cleanup.sql va primero
                if (a.startsWith('000_')) return -1;
                if (b.startsWith('000_')) return 1;
                // Luego init.sql
                if (a === 'init.sql') return -1;
                if (b === 'init.sql') return 1;
                // Luego improved_init.sql
                if (a === 'improved_init.sql') return -1;
                if (b === 'improved_init.sql') return 1;
                // El resto por orden alfabético
                return a.localeCompare(b);
            });

        for (const file of sortedFiles) {
            await executeMigration(path.join(migrationsPath, file));
        }
        
        console.log('Todas las migraciones se ejecutaron correctamente');
    } catch (error) {
        console.error('Error al ejecutar las migraciones:', error);
        throw error;
    }
}

module.exports = {
    runMigrations
};