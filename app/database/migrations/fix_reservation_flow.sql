-- Primero eliminamos los triggers existentes para evitar duplicados
DROP TRIGGER IF EXISTS trigger_crear_pago_para_reserva ON tramboory.reservas;
DROP TRIGGER IF EXISTS trigger_crear_pago_reserva ON tramboory.reservas;
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reserva_y_finanza ON tramboory.pagos;

-- Recreamos la función para crear pago automáticamente al crear una reserva
CREATE OR REPLACE FUNCTION tramboory.crear_pago_para_reserva()
RETURNS trigger AS $$
BEGIN
    -- Crear pago pendiente
    INSERT INTO tramboory.pagos (
        id_reserva,
        monto,
        fecha_pago,
        estado
    )
    VALUES (
        NEW.id,        -- id de la reserva recién creada
        NEW.total,     -- monto total de la reserva
        CURRENT_DATE,  -- fecha actual
        'pendiente'    -- estado inicial siempre pendiente
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreamos la función para manejar cambios de estado en pagos
CREATE OR REPLACE FUNCTION tramboory.actualizar_estado_reserva_y_finanza()
RETURNS trigger AS $$
DECLARE
    categoria_id INT;
BEGIN
    -- Solo procedemos si hay un cambio de estado
    IF OLD.estado <> NEW.estado THEN
        IF NEW.estado = 'completado' THEN
            -- Actualizar estado de la reserva a confirmada
            UPDATE tramboory.reservas
            SET estado = 'confirmada'
            WHERE id = NEW.id_reserva;

            -- Obtener o crear la categoría 'Reservación'
            SELECT id INTO categoria_id
            FROM tramboory.categorias
            WHERE nombre = 'Reservación'
            AND activo = true;

            IF categoria_id IS NULL THEN
                INSERT INTO tramboory.categorias(nombre, color, activo)
                VALUES ('Reservación', '#000000', TRUE)
                RETURNING id INTO categoria_id;
            END IF;

            -- Crear registro en finanzas
            INSERT INTO tramboory.finanzas (
                id_reserva,
                tipo,
                monto,
                fecha,
                descripcion,
                id_usuario,
                id_categoria
            )
            SELECT 
                r.id,
                'ingreso',
                r.total,
                CURRENT_DATE,
                'Pago de reserva ' || r.id,
                r.id_usuario,
                categoria_id
            FROM tramboory.reservas r
            WHERE r.id = NEW.id_reserva;

        ELSIF NEW.estado = 'fallido' THEN
            -- Si el pago falla, la reserva vuelve a pendiente
            UPDATE tramboory.reservas
            SET estado = 'pendiente'
            WHERE id = NEW.id_reserva;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreamos los triggers necesarios
CREATE TRIGGER trigger_crear_pago_reserva
    AFTER INSERT
    ON tramboory.reservas
    FOR EACH ROW
    EXECUTE FUNCTION tramboory.crear_pago_para_reserva();

CREATE TRIGGER trigger_actualizar_estado_reserva_y_finanza
    AFTER UPDATE
    ON tramboory.pagos
    FOR EACH ROW
    WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
    EXECUTE FUNCTION tramboory.actualizar_estado_reserva_y_finanza();

-- Agregamos comentarios para documentación
COMMENT ON FUNCTION tramboory.crear_pago_para_reserva() IS 'Crea automáticamente un pago pendiente cuando se crea una nueva reserva';
COMMENT ON FUNCTION tramboory.actualizar_estado_reserva_y_finanza() IS 'Maneja los cambios de estado en pagos y sus efectos en reservas y finanzas';
COMMENT ON TRIGGER trigger_crear_pago_reserva ON tramboory.reservas IS 'Trigger que crea automáticamente un pago cuando se crea una reserva';
COMMENT ON TRIGGER trigger_actualizar_estado_reserva_y_finanza ON tramboory.pagos IS 'Trigger que maneja los cambios de estado en pagos y sus efectos';