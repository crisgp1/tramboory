-- Comenzar transacción
BEGIN;

-- Establecer el schema correcto
SET search_path TO tramboory;

-- Eliminar todos los triggers existentes relacionados con pagos
DROP TRIGGER IF EXISTS trigger_crear_pago_para_reserva ON tramboory.reservas;
DROP TRIGGER IF EXISTS trigger_crear_pago_reserva ON tramboory.reservas;
DROP TRIGGER IF EXISTS trigger_actualizar_estado_reserva_y_finanza ON tramboory.pagos;
DROP TRIGGER IF EXISTS trigger_actualizar_estado_pago ON tramboory.pagos;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS tramboory.crear_pago_para_reserva();
DROP FUNCTION IF EXISTS tramboory.actualizar_estado_reserva_y_finanza();
DROP FUNCTION IF EXISTS tramboory.manejar_pago_reserva();
DROP FUNCTION IF EXISTS tramboory.manejar_actualizacion_pago();

-- Crear nueva función para manejar la creación de pagos
CREATE OR REPLACE FUNCTION tramboory.manejar_pago_reserva()
RETURNS trigger AS $$
BEGIN
    -- Solo crear pago si es una inserción nueva
    IF TG_OP = 'INSERT' THEN
        -- Crear el pago inicial
        INSERT INTO tramboory.pagos (
            id_reserva,
            monto,
            fecha_pago,
            estado
        )
        VALUES (
            NEW.id,
            NEW.total,
            CURRENT_DATE,
            'pendiente'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear nueva función para manejar actualizaciones de estado de pago
CREATE OR REPLACE FUNCTION tramboory.manejar_actualizacion_pago()
RETURNS trigger AS $$
DECLARE
    categoria_id INT;
    total_pagado NUMERIC(10, 2);
    total_reserva NUMERIC(10, 2);
BEGIN
    -- Solo proceder si hay un cambio de estado
    IF OLD.estado <> NEW.estado THEN
        -- Si el pago se completa
        IF NEW.estado = 'completado' THEN
            -- Calcular total pagado
            SELECT COALESCE(SUM(monto), 0) INTO total_pagado
            FROM tramboory.pagos
            WHERE id_reserva = NEW.id_reserva 
            AND estado = 'completado';

            -- Obtener total de la reserva
            SELECT total INTO total_reserva
            FROM tramboory.reservas
            WHERE id = NEW.id_reserva;

            -- Solo confirmar si el total pagado cubre el total de la reserva
            IF total_pagado >= total_reserva THEN
                -- Actualizar estado de la reserva
                UPDATE tramboory.reservas
                SET estado = 'confirmada'
                WHERE id = NEW.id_reserva;

                -- Obtener o crear categoría 'Reservación'
                SELECT id INTO categoria_id
                FROM tramboory.categorias
                WHERE nombre = 'Reservación'
                LIMIT 1;

                IF categoria_id IS NULL THEN
                    INSERT INTO tramboory.categorias (nombre, color)
                    VALUES ('Reservación', '#000000')
                    RETURNING id INTO categoria_id;
                END IF;

                -- Crear registro de finanza
                INSERT INTO tramboory.finanzas (
                    id_reserva,
                    tipo,
                    monto,
                    fecha,
                    descripcion,
                    id_categoria,
                    id_usuario
                )
                SELECT 
                    r.id,
                    'ingreso',
                    NEW.monto,
                    CURRENT_DATE,
                    CASE 
                        WHEN NEW.es_pago_parcial THEN 'Pago parcial de reserva ' || r.id
                        ELSE 'Pago completo de reserva ' || r.id
                    END,
                    categoria_id,
                    r.id_usuario
                FROM tramboory.reservas r
                WHERE r.id = NEW.id_reserva;
            END IF;

        -- Si el pago falla
        ELSIF NEW.estado = 'fallido' THEN
            -- Verificar si hay otros pagos completados
            SELECT COALESCE(SUM(monto), 0) INTO total_pagado
            FROM tramboory.pagos
            WHERE id_reserva = NEW.id_reserva 
            AND estado = 'completado'
            AND id != NEW.id;

            -- Si no hay otros pagos completados, actualizar estado de la reserva
            IF total_pagado = 0 THEN
                UPDATE tramboory.reservas
                SET estado = 'pendiente'
                WHERE id = NEW.id_reserva;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para la creación de pagos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_crear_pago_reserva'
    ) THEN
        CREATE TRIGGER trigger_crear_pago_reserva
        AFTER INSERT
        ON tramboory.reservas
        FOR EACH ROW
        EXECUTE FUNCTION tramboory.manejar_pago_reserva();
    END IF;
END $$;

-- Crear trigger para la actualización de estados de pago
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_actualizar_estado_pago'
    ) THEN
        CREATE TRIGGER trigger_actualizar_estado_pago
        AFTER UPDATE OF estado
        ON tramboory.pagos
        FOR EACH ROW
        WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
        EXECUTE FUNCTION tramboory.manejar_actualizacion_pago();
    END IF;
END $$;

-- Agregar índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_pagos_reserva_estado
ON tramboory.pagos (id_reserva, estado);

CREATE INDEX IF NOT EXISTS idx_reservas_estado
ON tramboory.reservas (id, estado);

-- Documentación
COMMENT ON FUNCTION tramboory.manejar_pago_reserva() IS 'Función que crea automáticamente un pago pendiente cuando se crea una nueva reserva';
COMMENT ON FUNCTION tramboory.manejar_actualizacion_pago() IS 'Función que maneja las actualizaciones de estado de pago y sus efectos en reservas y finanzas';
COMMENT ON TRIGGER trigger_crear_pago_reserva ON tramboory.reservas IS 'Trigger que maneja la creación automática de pagos cuando se crea una nueva reserva';
COMMENT ON TRIGGER trigger_actualizar_estado_pago ON tramboory.pagos IS 'Trigger que maneja las actualizaciones de estado de pago y sus efectos';

-- Confirmar transacción
COMMIT;