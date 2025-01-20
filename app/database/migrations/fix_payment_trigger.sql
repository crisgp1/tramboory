-- Comenzar transacción
BEGIN;

-- Establecer el schema correcto
SET search_path TO tramboory, public;

-- Crear la función primero
CREATE OR REPLACE FUNCTION tramboory.crear_pago_para_reserva()
RETURNS trigger AS $$
BEGIN
    INSERT INTO tramboory.pagos (
        id_reserva,
        monto,
        fecha_pago,
        estado
    )
    VALUES (
        NEW.id,               -- el id de la reserva recién insertada
        NEW.total,           -- el total de la reserva
        CURRENT_DATE,        -- fecha de pago (hoy)
        'pendiente'          -- estado inicial del pago
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminamos los triggers duplicados
DROP TRIGGER IF EXISTS trigger_crear_pago_para_reserva ON tramboory.reservas;
DROP TRIGGER IF EXISTS trigger_crear_pago_reserva ON tramboory.reservas;

-- Recreamos un único trigger
CREATE TRIGGER trigger_crear_pago_reserva
    AFTER INSERT
    ON tramboory.reservas
    FOR EACH ROW
EXECUTE FUNCTION tramboory.crear_pago_para_reserva();

-- Agregamos un índice para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_pagos_reserva_estado_fecha
    ON tramboory.pagos (id_reserva, estado, fecha_pago);

-- Comentarios para documentar
COMMENT ON FUNCTION tramboory.crear_pago_para_reserva() IS 'Función que crea automáticamente un pago pendiente cuando se crea una nueva reserva';
COMMENT ON TRIGGER trigger_crear_pago_reserva ON tramboory.reservas IS 'Trigger que maneja la creación automática de pagos cuando se crea una nueva reserva';

-- Confirmar transacción
COMMIT;