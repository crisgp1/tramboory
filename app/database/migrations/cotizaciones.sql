-- Archivo de migración para cotizaciones
-- Este archivo contiene las tablas y funciones necesarias para el sistema de cotizaciones

-- Crear tabla de cotizaciones
CREATE TABLE IF NOT EXISTS main.cotizaciones (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES main.usuarios(id),
    id_paquete INTEGER NOT NULL REFERENCES main.paquetes(id),
    id_tematica INTEGER REFERENCES main.tematicas(id),
    id_mampara INTEGER REFERENCES main.mamparas(id),
    id_opcion_alimento INTEGER REFERENCES main.opciones_alimentos(id),
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    nombre_festejado VARCHAR(100),
    edad_festejado INTEGER,
    genero_festejado VARCHAR(20),
    comentarios TEXT,
    total DECIMAL(10, 2) NOT NULL,
    codigo_seguimiento VARCHAR(20) NOT NULL UNIQUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'creada' CHECK (estado IN ('creada', 'expirada', 'convertida'))
);

-- Crear tabla de extras para cotizaciones
CREATE TABLE IF NOT EXISTS main.cotizacion_extras (
    id SERIAL PRIMARY KEY,
    id_cotizacion INTEGER NOT NULL REFERENCES main.cotizaciones(id) ON DELETE CASCADE,
    id_extra INTEGER NOT NULL REFERENCES main.extras(id),
    cantidad INTEGER NOT NULL DEFAULT 1,
    UNIQUE (id_cotizacion, id_extra)
);

-- Función para crear una cotización
CREATE OR REPLACE FUNCTION main.crear_cotizacion(
    p_id_usuario INTEGER,
    p_id_paquete INTEGER,
    p_id_tematica INTEGER,
    p_id_mampara INTEGER,
    p_id_opcion_alimento INTEGER,
    p_fecha_reserva DATE,
    p_hora_inicio TIME,
    p_hora_fin TIME,
    p_nombre_festejado VARCHAR(100),
    p_edad_festejado INTEGER,
    p_genero_festejado VARCHAR(20),
    p_comentarios TEXT,
    p_codigo_seguimiento VARCHAR(20),
    p_fecha_expiracion TIMESTAMP,
    p_total DECIMAL(10, 2)
) RETURNS INTEGER AS $$
DECLARE
    v_id_cotizacion INTEGER;
BEGIN
    -- Insertar la cotización
    INSERT INTO main.cotizaciones (
        id_usuario,
        id_paquete,
        id_tematica,
        id_mampara,
        id_opcion_alimento,
        fecha_reserva,
        hora_inicio,
        hora_fin,
        nombre_festejado,
        edad_festejado,
        genero_festejado,
        comentarios,
        total,
        codigo_seguimiento,
        fecha_expiracion
    ) VALUES (
        p_id_usuario,
        p_id_paquete,
        p_id_tematica,
        p_id_mampara,
        p_id_opcion_alimento,
        p_fecha_reserva,
        p_hora_inicio,
        p_hora_fin,
        p_nombre_festejado,
        p_edad_festejado,
        p_genero_festejado,
        p_comentarios,
        p_total,
        p_codigo_seguimiento,
        p_fecha_expiracion
    ) RETURNING id INTO v_id_cotizacion;
    
    RETURN v_id_cotizacion;
END;
$$ LANGUAGE plpgsql;

-- Función para convertir una cotización a reserva
CREATE OR REPLACE FUNCTION main.convertir_cotizacion_a_reserva(
    p_id_cotizacion INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_cotizacion main.cotizaciones%ROWTYPE;
    v_id_reserva INTEGER;
    v_extra RECORD;
BEGIN
    -- Obtener datos de la cotización
    SELECT * INTO v_cotizacion
    FROM main.cotizaciones
    WHERE id = p_id_cotizacion AND estado = 'creada';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cotización no encontrada o no disponible para conversión';
    END IF;
    
    -- Verificar si la cotización ha expirado
    IF v_cotizacion.fecha_expiracion < CURRENT_TIMESTAMP THEN
        -- Actualizar estado a expirada
        UPDATE main.cotizaciones
        SET estado = 'expirada'
        WHERE id = p_id_cotizacion;
        
        RAISE EXCEPTION 'La cotización ha expirado';
    END IF;
    
    -- Crear reserva a partir de la cotización
    INSERT INTO main.reservas (
        id_usuario,
        id_paquete,
        id_tematica,
        id_mampara,
        id_opcion_alimento,
        fecha_reserva,
        hora_inicio,
        hora_fin,
        nombre_festejado,
        edad_festejado,
        genero_festejado,
        comentarios,
        total,
        estado
    ) VALUES (
        v_cotizacion.id_usuario,
        v_cotizacion.id_paquete,
        v_cotizacion.id_tematica,
        v_cotizacion.id_mampara,
        v_cotizacion.id_opcion_alimento,
        v_cotizacion.fecha_reserva,
        v_cotizacion.hora_inicio,
        v_cotizacion.hora_fin,
        v_cotizacion.nombre_festejado,
        v_cotizacion.edad_festejado,
        v_cotizacion.genero_festejado,
        v_cotizacion.comentarios,
        v_cotizacion.total,
        'pendiente'
    ) RETURNING id INTO v_id_reserva;
    
    -- Copiar extras de la cotización a la reserva
    FOR v_extra IN (
        SELECT id_extra, cantidad
        FROM main.cotizacion_extras
        WHERE id_cotizacion = p_id_cotizacion
    ) LOOP
        INSERT INTO main.reserva_extras (
            id_reserva, id_extra, cantidad
        ) VALUES (
            v_id_reserva, v_extra.id_extra, v_extra.cantidad
        );
    END LOOP;
    
    -- Actualizar estado de la cotización
    UPDATE main.cotizaciones
    SET estado = 'convertida'
    WHERE id = p_id_cotizacion;
    
    RETURN v_id_reserva;
END;
$$ LANGUAGE plpgsql;

-- Trigger para expirar cotizaciones automáticamente
CREATE OR REPLACE FUNCTION main.expirar_cotizaciones() RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar estado de cotizaciones expiradas
    UPDATE main.cotizaciones
    SET estado = 'expirada'
    WHERE estado = 'creada' AND fecha_expiracion < CURRENT_TIMESTAMP;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para ejecutar la función cada vez que se consulta la tabla
DROP TRIGGER IF EXISTS trg_expirar_cotizaciones ON main.cotizaciones;
CREATE TRIGGER trg_expirar_cotizaciones
AFTER INSERT OR UPDATE OR DELETE ON main.cotizaciones
FOR EACH STATEMENT
EXECUTE FUNCTION main.expirar_cotizaciones();

-- Crear un evento programado para expirar cotizaciones periódicamente
-- Nota: Esto requiere que pg_cron esté habilitado en PostgreSQL
-- Si pg_cron no está disponible, se puede implementar esta funcionalidad en el backend
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Eliminar el trabajo si ya existe
        PERFORM cron.unschedule('expirar_cotizaciones');
        
        -- Programar el trabajo para ejecutarse cada hora
        PERFORM cron.schedule('expirar_cotizaciones', '0 * * * *', 'SELECT main.expirar_cotizaciones()');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Si pg_cron no está disponible, simplemente continuamos
        RAISE NOTICE 'pg_cron no está disponible. La expiración de cotizaciones se manejará desde el backend.';
END $$;