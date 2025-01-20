-- Comenzar transacción
BEGIN;

-- Establecer el schema correcto
SET search_path TO tramboory, public;

-- Eliminamos los triggers existentes
DROP TRIGGER IF EXISTS trigger_reservation_deactivation ON tramboory.reservas;
DROP TRIGGER IF EXISTS trigger_finance_deactivation ON tramboory.finanzas;
DROP TRIGGER IF EXISTS trigger_payment_deactivation ON tramboory.pagos;

-- Eliminamos las funciones existentes
DROP FUNCTION IF EXISTS tramboory.handle_reservation_deactivation();
DROP FUNCTION IF EXISTS tramboory.handle_finance_deactivation();
DROP FUNCTION IF EXISTS tramboory.handle_payment_deactivation();

-- Creamos una función única para manejar la desactivación
CREATE OR REPLACE FUNCTION tramboory.handle_cascade_deactivation()
RETURNS trigger AS $$
DECLARE
    _is_recursive boolean;
BEGIN
    -- Verificamos si estamos en una llamada recursiva
    IF EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgrelid = TG_RELID
        AND tgname = TG_NAME
        AND tgconstraint != 0
    ) THEN
        RETURN NEW;
    END IF;

    -- Si es una reserva siendo desactivada
    IF TG_TABLE_NAME = 'reservas' AND OLD.activo = true AND NEW.activo = false THEN
        -- Desactivamos finanzas relacionadas directamente
        UPDATE tramboory.finanzas
        SET activo = false
        WHERE id_reserva = NEW.id
        AND activo = true;

        -- Actualizamos pagos relacionados
        UPDATE tramboory.pagos
        SET estado = 'fallido'
        WHERE id_reserva = NEW.id
        AND estado != 'fallido';

        -- Aseguramos que el estado sea 'cancelada'
        NEW.estado = 'cancelada';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creamos el nuevo trigger unificado
CREATE TRIGGER trigger_cascade_deactivation
    BEFORE UPDATE ON tramboory.reservas
    FOR EACH ROW
    WHEN (OLD.activo = true AND NEW.activo = false)
    EXECUTE FUNCTION tramboory.handle_cascade_deactivation();

-- Agregamos índices para optimizar las consultas de desactivación
CREATE INDEX IF NOT EXISTS idx_finanzas_reserva_activo
    ON tramboory.finanzas (id_reserva, activo);

CREATE INDEX IF NOT EXISTS idx_pagos_reserva_estado
    ON tramboory.pagos (id_reserva, estado);

-- Comentarios para documentar la solución
COMMENT ON FUNCTION tramboory.handle_cascade_deactivation() IS 'Maneja la desactivación en cascada de reservas, finanzas y pagos de manera no recursiva';
COMMENT ON TRIGGER trigger_cascade_deactivation ON tramboory.reservas IS 'Trigger que maneja la desactivación en cascada cuando una reserva se desactiva';

-- Actualizamos la configuración de la sesión
ALTER ROLE cris SET session_replication_role = 'replica';