-- Establecer el schema correcto
SET search_path TO tramboory, public;

-- Recrear la función del trigger con actualización de fecha
CREATE OR REPLACE FUNCTION tramboory.fn_actualizar_estado_pago()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar fecha_actualizacion
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    
    -- Si el pago se marca como completado
    IF NEW.estado = 'completado' AND OLD.estado != 'completado' THEN
        -- Verificar si este pago completa el total de la reserva
        IF (
            SELECT COALESCE(SUM(monto), 0)
            FROM tramboory.pagos
            WHERE id_reserva = NEW.id_reserva
            AND estado = 'completado'
        ) >= (
            SELECT total
            FROM tramboory.reservas
            WHERE id = NEW.id_reserva
        ) THEN
            -- Actualizar estado de la reserva a confirmada
            UPDATE tramboory.reservas
            SET estado = 'confirmada'
            WHERE id = NEW.id_reserva;

            -- Crear registro en finanzas
            INSERT INTO tramboory.finanzas (
                id_reserva,
                tipo,
                monto,
                concepto,
                fecha,
                activo,
                fecha_creacion,
                fecha_actualizacion
            ) VALUES (
                NEW.id_reserva,
                'ingreso',
                NEW.monto,
                'Pago de reserva',
                CURRENT_DATE,
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger como BEFORE UPDATE para permitir la modificación de NEW
DROP TRIGGER IF EXISTS trigger_actualizar_estado_pago ON tramboory.pagos;
CREATE TRIGGER trigger_actualizar_estado_pago
    BEFORE UPDATE ON tramboory.pagos
    FOR EACH ROW
    EXECUTE FUNCTION tramboory.fn_actualizar_estado_pago();
