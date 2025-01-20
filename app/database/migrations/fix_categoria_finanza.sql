-- Comenzar transacción
BEGIN;

-- Eliminar la columna redundante 'categoria' de la tabla finanzas
ALTER TABLE tramboory.finanzas DROP COLUMN IF EXISTS categoria;

-- Agregar índice para mejorar el rendimiento de la relación finanzas-categorias
CREATE INDEX IF NOT EXISTS idx_finanzas_categoria ON tramboory.finanzas (id_categoria);

-- Recrear la función del trigger con el schema correcto
CREATE OR REPLACE FUNCTION tramboory.actualizar_estado_reserva_y_finanza()
RETURNS trigger AS $$
DECLARE
    categoria_id INT;
BEGIN
    IF OLD.estado <> NEW.estado THEN
        IF NEW.estado = 'completado' THEN
            -- Reserva pasa a 'confirmada'
            UPDATE tramboory.reservas
            SET estado = 'confirmada'
            WHERE id = NEW.id_reserva;

            -- Obtener o crear la categoria 'Reservación'
            SELECT id INTO categoria_id
            FROM tramboory.categorias
            WHERE nombre = 'Reservación'
            AND activo = true;

            IF categoria_id IS NULL THEN
                INSERT INTO tramboory.categorias(nombre, color, activo)
                VALUES ('Reservación', '#000000', TRUE)
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

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reserva_y_finanza ON tramboory.pagos;
CREATE TRIGGER trigger_actualizar_estado_reserva_y_finanza
    AFTER UPDATE ON tramboory.pagos
    FOR EACH ROW
    WHEN (OLD.estado <> NEW.estado)
    EXECUTE FUNCTION tramboory.actualizar_estado_reserva_y_finanza();

-- Confirmar transacción
COMMIT;