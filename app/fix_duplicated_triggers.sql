-- Script para eliminar triggers y funciones duplicadas en la base de datos Tramboory
-- Conexión al esquema correcto
SET search_path TO tramboory;

-- 1. Primero eliminamos el trigger que usa la función fn_actualizar_estado_pago
DROP TRIGGER IF EXISTS trigger_actualizar_estado_pago ON pagos;

-- 2. Eliminamos las funciones duplicadas
-- Las siguientes funciones no tienen un trigger asociado o son redundantes
DROP FUNCTION IF EXISTS manejar_pago_reserva();
DROP FUNCTION IF EXISTS manejar_actualizacion_pago();
DROP FUNCTION IF EXISTS fn_actualizar_estado_pago();

-- Log para confirmar la ejecución exitosa
DO $$
BEGIN
    RAISE NOTICE 'Script de eliminación de triggers y funciones duplicadas ejecutado correctamente.';
END $$;