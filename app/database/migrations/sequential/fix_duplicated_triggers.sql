-- Script to fix the duplicated trigger error
SET search_path TO main, usuarios, finanzas, inventario, seguridad, public;

-- Drop the duplicated trigger
DROP TRIGGER IF EXISTS aud_usuarios_mejorado ON usuarios.usuarios;

-- Optional: If you want to recreate it properly with a check
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'aud_usuarios_mejorado' 
        AND tgrelid = 'usuarios.usuarios'::regclass
    ) THEN
        -- Recreate the trigger only if it doesn't exist
        CREATE TRIGGER aud_usuarios_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON usuarios.usuarios
        FOR EACH ROW
        EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();
    END IF;
END $$;