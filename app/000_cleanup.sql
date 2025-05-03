-- Pre-migration cleanup script
-- This script safely removes potentially duplicated objects before migration

-- Set search path to include all schemas
SET search_path TO main, usuarios, finanzas, inventario, seguridad, public;

-- Safely drop triggers that might be duplicated
DROP TRIGGER IF EXISTS aud_usuarios_mejorado ON usuarios.usuarios;

-- Commit any pending transactions (helps with the aborted transaction issue)
COMMIT;