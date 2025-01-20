const fs = require('fs').promises;
const path = require('path');
const sequelize = require('../config/database');

async function executeMigration(filePath) {
    try {
        console.log(`Ejecutando migración: ${filePath}`);
        const sql = await fs.readFile(filePath, 'utf8');
        
        // Ejecutar la migración como una sola consulta
        await sequelize.query(sql, {
            raw: true,
            logging: console.log
        });
        
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
        
        // Ordenar los archivos para asegurar que init.sql se ejecute primero
        const sortedFiles = files.sort((a, b) => {
            if (a === 'init.sql') return -1;
            if (b === 'init.sql') return 1;
            return a.localeCompare(b);
        });

        for (const file of sortedFiles) {
            if (file.endsWith('.sql')) {
                await executeMigration(path.join(migrationsPath, file));
            }
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