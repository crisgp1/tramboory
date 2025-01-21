-- Establecer el schema correcto
SET search_path TO tramboory, public;

-- Eliminar el trigger y función existentes si existen
DROP TRIGGER IF EXISTS trigger_crear_pago_reserva ON tramboory.reservas;
DROP FUNCTION IF EXISTS tramboory.crear_pago_para_reserva();
DROP FUNCTION IF EXISTS tramboory.fn_crear_pago_reserva();

-- Crear la función del trigger
CREATE OR REPLACE FUNCTION tramboory.crear_pago_para_reserva()
RETURNS TRIGGER AS $$
DECLARE
    v_id_pago INTEGER;
BEGIN
    -- Insertar el pago antes de la reserva usando NEW.id
    INSERT INTO tramboory.pagos (
        id_reserva,
        monto,
        estado,
        es_pago_parcial,
        fecha_creacion,
        fecha_actualizacion
    ) VALUES (
        NEW.id,  -- Usar NEW.id directamente
        NEW.total,
        'pendiente',
        FALSE,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_id_pago;

    -- Si la inserción del pago falla, el trigger abortará automáticamente
    -- y la reserva no se creará debido a que es BEFORE INSERT

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger BEFORE INSERT
CREATE TRIGGER trigger_crear_pago_reserva
    BEFORE INSERT ON tramboory.reservas
    FOR EACH ROW
    EXECUTE FUNCTION tramboory.crear_pago_para_reserva();

-- Mantener el trigger existente de actualización de estado de pago
CREATE OR REPLACE FUNCTION tramboory.fn_actualizar_estado_pago()
RETURNS TRIGGER AS $$
BEGIN
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

-- Recrear el trigger de actualización de estado de pago
DROP TRIGGER IF EXISTS trigger_actualizar_estado_pago ON tramboory.pagos;
CREATE TRIGGER trigger_actualizar_estado_pago
    AFTER UPDATE ON tramboory.pagos
    FOR EACH ROW
    EXECUTE FUNCTION tramboory.fn_actualizar_estado_pago();