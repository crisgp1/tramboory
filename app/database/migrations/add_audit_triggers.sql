-- Establecer el schema correcto
SET search_path TO tramboory, public;

-- Crear triggers de auditoría para las tablas principales
CREATE TRIGGER aud_usuarios
    AFTER INSERT OR UPDATE OR DELETE
    ON usuarios
    FOR EACH ROW
EXECUTE PROCEDURE funcion_auditoria();

CREATE TRIGGER aud_reservas
    AFTER INSERT OR UPDATE OR DELETE
    ON reservas
    FOR EACH ROW
EXECUTE PROCEDURE funcion_auditoria();

CREATE TRIGGER aud_pagos
    AFTER INSERT OR UPDATE OR DELETE
    ON pagos
    FOR EACH ROW
EXECUTE PROCEDURE funcion_auditoria();

CREATE TRIGGER aud_finanzas
    AFTER INSERT OR UPDATE OR DELETE
    ON finanzas
    FOR EACH ROW
EXECUTE PROCEDURE funcion_auditoria();

-- Agregar RAISE NOTICE para debug en las funciones principales
CREATE OR REPLACE FUNCTION validar_reserva() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE NOTICE 'Ejecutando validar_reserva() para la reserva ID: %, Fecha: %, Hora inicio: %, Hora fin: %', 
                 NEW.id, NEW.fecha_reserva, NEW.hora_inicio, NEW.hora_fin;
                 
    IF EXISTS (
        SELECT 1
        FROM reservas r
        WHERE r.fecha_reserva = NEW.fecha_reserva
          AND r.hora_inicio < NEW.hora_fin
          AND r.hora_fin > NEW.hora_inicio
          AND r.estado = 'confirmada'
          AND r.id <> NEW.id
    ) THEN
        RAISE EXCEPTION 'Ya existe una reserva confirmada en la misma fecha y horario';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION aplicar_fee_martes() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE NOTICE 'Ejecutando aplicar_fee_martes() para la reserva ID: %, Fecha: %, Total actual: %', 
                 NEW.id, NEW.fecha_reserva, NEW.total;
                 
    IF EXTRACT(DOW FROM NEW.fecha_reserva) = 2 THEN
        NEW.total := NEW.total + 1500;
        RAISE NOTICE 'Se aplicó fee de martes. Nuevo total: %', NEW.total;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION actualizar_estado_reserva_y_finanza() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
DECLARE
    categoria_id INT;
BEGIN
    RAISE NOTICE 'Ejecutando actualizar_estado_reserva_y_finanza() para el pago ID: %, Estado anterior: %, Nuevo estado: %', 
                 NEW.id, OLD.estado, NEW.estado;
                 
    IF OLD.estado <> NEW.estado THEN
        IF NEW.estado = 'completado' THEN
            RAISE NOTICE 'Actualizando reserva a confirmada y creando registro de finanza';
            
            -- Reserva pasa a 'confirmada'
            UPDATE reservas
            SET estado = 'confirmada'
            WHERE id = NEW.id_reserva;

            -- Obtener o crear la categoria 'Reservación'
            SELECT id INTO categoria_id
            FROM categorias
            WHERE nombre = 'Reservación';

            IF categoria_id IS NULL THEN
                INSERT INTO categorias(nombre, color, activo)
                VALUES ('Reservación','#000000',TRUE)
                RETURNING id INTO categoria_id;
            END IF;

            -- Insertar la finanza como ingreso
            INSERT INTO finanzas (
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
            FROM reservas r
            WHERE r.id = NEW.id_reserva;

            RAISE NOTICE 'Finanza creada exitosamente';

        ELSIF NEW.estado = 'fallido' THEN
            RAISE NOTICE 'Actualizando reserva a pendiente por pago fallido';
            -- Si el pago falla, la reserva vuelve a pendiente
            UPDATE reservas
            SET estado = 'pendiente'
            WHERE id = NEW.id_reserva;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;