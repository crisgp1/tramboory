-- Fix for duplicate usuario audit trigger
SET search_path TO main, usuarios, finanzas, inventario, seguridad, public;

-- Drop the existing trigger
DROP TRIGGER IF EXISTS aud_usuarios_mejorado ON usuarios.usuarios;

-- Now the migration can recreate it properly