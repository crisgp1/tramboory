-- Establecer el schema correcto
SET search_path TO tramboory, public;

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS aud_usuarios ON usuarios;
DROP TRIGGER IF EXISTS aud_reservas ON reservas;
DROP TRIGGER IF EXISTS aud_pagos ON pagos;
DROP TRIGGER IF EXISTS aud_finanzas ON finanzas;

-- Crear triggers de auditoría para las tablas principales
CREATE TRIGGER aud_usuarios
    AFTER INSERT OR UPDATE OR DELETE
    ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION funcion_auditoria();

CREATE TRIGGER aud_reservas
    AFTER INSERT OR UPDATE OR DELETE
    ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION funcion_auditoria();

CREATE TRIGGER aud_pagos
    AFTER INSERT OR UPDATE OR DELETE
    ON pagos
    FOR EACH ROW
    EXECUTE FUNCTION funcion_auditoria();

CREATE TRIGGER aud_finanzas
    AFTER INSERT OR UPDATE OR DELETE
    ON finanzas
    FOR EACH ROW
    EXECUTE FUNCTION funcion_auditoria();