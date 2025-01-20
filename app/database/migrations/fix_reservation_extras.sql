-- Fix para el manejo de extras y actualización de totales

-- Función para calcular el total de extras de una reserva
CREATE OR REPLACE FUNCTION calcular_total_extras(p_id_reserva INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_extras DECIMAL;
BEGIN
    SELECT COALESCE(SUM(e.precio * re.cantidad), 0)
    INTO total_extras
    FROM tramboory.reserva_extras re
    JOIN tramboory.extras e ON e.id = re.id_extra
    WHERE re.id_reserva = p_id_reserva;
    
    RETURN total_extras;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el total de la reserva cuando se agregan/modifican extras
CREATE OR REPLACE FUNCTION actualizar_total_reserva()
RETURNS TRIGGER AS $$
DECLARE
    total_extras DECIMAL;
    total_base DECIMAL;
BEGIN
    -- Calcular el total de extras
    total_extras := calcular_total_extras(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id_reserva
            ELSE NEW.id_reserva
        END
    );
    
    -- Obtener el total base de la reserva (sin extras)
    SELECT monto INTO total_base
    FROM tramboory.reservas
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id_reserva
        ELSE NEW.id_reserva
    END;
    
    -- Actualizar el total en la tabla reservas
    UPDATE tramboory.reservas
    SET monto = total_base + total_extras
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id_reserva
        ELSE NEW.id_reserva
    END;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para reserva_extras
DROP TRIGGER IF EXISTS trigger_actualizar_total_reserva ON tramboory.reserva_extras;
CREATE TRIGGER trigger_actualizar_total_reserva
    AFTER INSERT OR UPDATE OR DELETE ON tramboory.reserva_extras
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_total_reserva();

-- Fix para asegurar que activo sea true por defecto
ALTER TABLE tramboory.reservas ALTER COLUMN activo SET DEFAULT true;

-- Fix para el manejo de zona horaria en fecha_reserva
CREATE OR REPLACE FUNCTION ajustar_fecha_reserva()
RETURNS TRIGGER AS $$
BEGIN
    -- Asegurar que la fecha se guarde en la zona horaria correcta
    NEW.fecha_reserva := NEW.fecha_reserva::DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para ajustar la fecha
DROP TRIGGER IF EXISTS trigger_ajustar_fecha_reserva ON tramboory.reservas;
CREATE TRIGGER trigger_ajustar_fecha_reserva
    BEFORE INSERT OR UPDATE ON tramboory.reservas
    FOR EACH ROW
    EXECUTE FUNCTION ajustar_fecha_reserva();

-- Comentarios:
-- 1. El trigger actualizar_total_reserva se ejecuta después de cualquier cambio en reserva_extras
-- 2. La función calcular_total_extras suma el precio * cantidad de cada extra
-- 3. El trigger ajustar_fecha_reserva asegura que la fecha se guarde correctamente sin problemas de zona horaria
-- 4. Se refuerza el DEFAULT true para la columna activo