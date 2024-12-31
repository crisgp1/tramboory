-- Primero eliminamos los triggers y funciones existentes
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reserva_y_finanza ON tramboory.pagos;
DROP TRIGGER IF EXISTS trigger_validar_fecha_reserva ON tramboory.reservas;
DROP FUNCTION IF EXISTS tramboory.actualizar_estado_reserva_y_finanza();
DROP FUNCTION IF EXISTS tramboory.validar_fecha_reserva();

-- Eliminamos la constraint actual
ALTER TABLE tramboory.reservas DROP CONSTRAINT IF EXISTS reservas_fecha_reserva_check;

-- Creamos la función para validar la fecha en nuevas reservas
CREATE OR REPLACE FUNCTION tramboory.validar_fecha_reserva()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.fecha_reserva < CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha de reserva no puede ser anterior a la fecha actual';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creamos el trigger para validar la fecha solo en inserciones
CREATE TRIGGER trigger_validar_fecha_reserva
    BEFORE INSERT ON tramboory.reservas
    FOR EACH ROW
    EXECUTE FUNCTION tramboory.validar_fecha_reserva();

-- Creamos la función para actualizar estado y finanzas
CREATE OR REPLACE FUNCTION tramboory.actualizar_estado_reserva_y_finanza() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
DECLARE
    categoria_id INT;
    v_fecha_reserva DATE;
BEGIN
    IF OLD.estado <> NEW.estado THEN
        -- Obtener la fecha de reserva actual
        SELECT fecha_reserva INTO v_fecha_reserva
        FROM tramboory.reservas
        WHERE id = NEW.id_reserva;

        IF NEW.estado = 'completado' THEN
            -- Reserva pasa a 'confirmada' manteniendo la fecha_reserva original
            UPDATE tramboory.reservas
            SET estado = 'confirmada',
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = NEW.id_reserva;

            -- Obtener o crear la categoria 'Reservación'
            SELECT id INTO categoria_id
            FROM tramboory.categorias
            WHERE nombre = 'Reservación';

            IF categoria_id IS NULL THEN
                INSERT INTO tramboory.categorias(nombre, color, activo)
                VALUES ('Reservación','#000000',TRUE)
                RETURNING id INTO categoria_id;
            END IF;

            -- Insertar la finanza como ingreso
            INSERT INTO tramboory.finanzas (
                id_reserva,
                tipo,
                monto,
                fecha,
                descripcion,
                id_usuario,
                id_categoria
            )
            SELECT r.id,
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
            SET estado = 'pendiente',
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = NEW.id_reserva;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Recreamos el trigger para actualizar estado y finanzas
CREATE TRIGGER trigger_actualizar_estado_reserva_y_finanza
    AFTER UPDATE 
    ON tramboory.pagos
    FOR EACH ROW
    WHEN (OLD.estado <> NEW.estado)
EXECUTE FUNCTION tramboory.actualizar_estado_reserva_y_finanza();