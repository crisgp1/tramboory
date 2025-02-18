-- ======================================================
-- 1. ELIMINAR ESQUEMA TRAMBOORY (SI EXISTE) Y TODO LO DEMÁS
-- ======================================================
DROP SCHEMA IF EXISTS tramboory CASCADE;

-- ======================================================
-- 2. RECREAR EL ESQUEMA
-- ======================================================
CREATE SCHEMA tramboory;
ALTER SCHEMA tramboory OWNER TO cris;

-- Opcional: Cambiar el search_path para simplificar
SET search_path TO tramboory;

-- ======================================================
-- 3. CREAR TIPOS ENUM
-- ======================================================
CREATE TYPE tramboory.enum_usuarios_tipo_usuario AS ENUM ('cliente', 'admin');
ALTER TYPE tramboory.enum_usuarios_tipo_usuario OWNER TO cris;

CREATE TYPE tramboory.enum_reservas_estado AS ENUM ('pendiente', 'confirmada', 'cancelada');
ALTER TYPE tramboory.enum_reservas_estado OWNER TO cris;

CREATE TYPE tramboory.enum_finanzas_tipo AS ENUM ('ingreso', 'gasto');
ALTER TYPE tramboory.enum_finanzas_tipo OWNER TO cris;

CREATE TYPE tramboory.enum_pagos_estado AS ENUM ('pendiente', 'completado', 'fallido');
ALTER TYPE tramboory.enum_pagos_estado OWNER TO cris;

CREATE TYPE tramboory.enum_turno AS ENUM ('manana', 'tarde', 'ambos');
ALTER TYPE tramboory.enum_turno OWNER TO cris;

-- ======================================================
-- 4. CREAR TABLAS (ordenadas para respetar dependencias)
-- ======================================================

-- ------------------------------------------------------
-- 4.1. usuarios
-- ------------------------------------------------------
CREATE TABLE tramboory.usuarios
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL UNIQUE,
    clave_hash          VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20),
    direccion           TEXT,
    tipo_usuario        tramboory.enum_usuarios_tipo_usuario NOT NULL,
    id_personalizado    VARCHAR(100),
    activo              BOOLEAN       DEFAULT TRUE,
    fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tramboory.usuarios OWNER TO cris;

-- ------------------------------------------------------
-- 4.2. categorias
-- ------------------------------------------------------
CREATE TABLE tramboory.categorias
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    color               VARCHAR(7)   DEFAULT '#000000' NOT NULL
        CONSTRAINT categorias_color_check
            CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    activo              BOOLEAN      DEFAULT TRUE,
    fecha_creacion      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tramboory.categorias OWNER TO cris;

-- ------------------------------------------------------
-- 4.3. extras
-- ------------------------------------------------------
CREATE TABLE tramboory.extras
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio              NUMERIC(10, 2) NOT NULL
        CONSTRAINT extras_precio_check CHECK (precio >= 0),
    activo              BOOLEAN       DEFAULT TRUE,
    fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tramboory.extras OWNER TO cris;

-- ------------------------------------------------------
-- 4.4. paquetes_alimentos
-- ------------------------------------------------------
CREATE TABLE tramboory.paquetes_alimentos
(
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

ALTER TABLE tramboory.paquetes_alimentos OWNER TO cris;

-- ------------------------------------------------------
-- 4.5. paquetes
-- ------------------------------------------------------
CREATE TABLE tramboory.paquetes
(
    id                     SERIAL PRIMARY KEY,
    nombre                 VARCHAR(100)    NOT NULL,
    descripcion            TEXT,
    precio_lunes_jueves    NUMERIC(10, 2)  NOT NULL
        CONSTRAINT paquetes_precio_lunes_jueves_check
            CHECK (precio_lunes_jueves >= 0),
    precio_viernes_domingo NUMERIC(10, 2)  NOT NULL
        CONSTRAINT paquetes_precio_viernes_domingo_check
            CHECK (precio_viernes_domingo >= 0),
    id_paquete_alimento    INTEGER
        REFERENCES tramboory.paquetes_alimentos(id),
    activo                 BOOLEAN         DEFAULT TRUE,
    fecha_creacion         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tramboory.paquetes OWNER TO cris;

CREATE INDEX idx_paquetes_paquete_alimento
    ON tramboory.paquetes (id_paquete_alimento);

-- ------------------------------------------------------
-- 4.6. tematicas
-- ------------------------------------------------------
CREATE TABLE tramboory.tematicas
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    foto                VARCHAR(255),
    activo              BOOLEAN       DEFAULT TRUE,
    fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tramboory.tematicas OWNER TO cris;

-- ------------------------------------------------------
-- 4.7. mamparas
-- ------------------------------------------------------
CREATE TABLE tramboory.mamparas
(
    id                  SERIAL PRIMARY KEY,
    id_tematica         INTEGER NOT NULL
        REFERENCES tramboory.tematicas(id)
            ON DELETE RESTRICT,
    piezas              INTEGER      NOT NULL
        CONSTRAINT mamparas_piezas_check CHECK (piezas > 0),
    precio              NUMERIC(10,2) NOT NULL
        CONSTRAINT mamparas_precio_check CHECK (precio >= 0),
    foto                VARCHAR(255),
    activo              BOOLEAN       DEFAULT TRUE,
    fecha_creacion      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tramboory.mamparas OWNER TO cris;

CREATE INDEX idx_mamparas_tematica
    ON tramboory.mamparas (id_tematica);

-- ------------------------------------------------------
-- 4.8. opciones_alimentos
-- ------------------------------------------------------
CREATE TABLE tramboory.opciones_alimentos
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    descripcion         TEXT,
    precio_extra        NUMERIC(10, 2)  NOT NULL
        CONSTRAINT opciones_alimentos_precio_extra_check
            CHECK (precio_extra >= 0),
    disponible          BOOLEAN         DEFAULT TRUE,
    turno               tramboory.enum_turno DEFAULT 'ambos',
    platillo_adulto     VARCHAR(100)    NOT NULL,
    platillo_nino       VARCHAR(100)    NOT NULL,
    opcion_papas        BOOLEAN         DEFAULT FALSE,
    precio_papas        NUMERIC(10, 2)  DEFAULT 19.00
        CONSTRAINT opciones_alimentos_precio_papas_check CHECK (precio_papas >= 0),
    precio_adulto       NUMERIC(10, 2)  DEFAULT 0.00
        CONSTRAINT opciones_alimentos_precio_adulto_check CHECK (precio_adulto >= 0),
    precio_nino         NUMERIC(10, 2)  DEFAULT 0.00
        CONSTRAINT opciones_alimentos_precio_nino_check CHECK (precio_nino >= 0),
    activo              BOOLEAN         DEFAULT TRUE,
    fecha_creacion      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tramboory.opciones_alimentos OWNER TO cris;

-- ------------------------------------------------------
-- 4.9. reservas
-- ------------------------------------------------------
CREATE TABLE tramboory.reservas
(
    id                  SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL
        REFERENCES tramboory.usuarios(id)
            ON DELETE CASCADE,
    id_paquete          INTEGER NOT NULL
        REFERENCES tramboory.paquetes(id),
    id_opcion_alimento  INTEGER
        REFERENCES tramboory.opciones_alimentos(id),
    id_mampara          INTEGER NOT NULL
        REFERENCES tramboory.mamparas(id),
    id_tematica         INTEGER NOT NULL
        REFERENCES tramboory.tematicas(id),
    fecha_reserva       DATE    NOT NULL
        CONSTRAINT reservas_fecha_reserva_check CHECK (fecha_reserva >= CURRENT_DATE),
    estado              tramboory.enum_reservas_estado NOT NULL DEFAULT 'pendiente',
    total               NUMERIC(10, 2) NOT NULL
        CONSTRAINT reservas_total_check CHECK (total >= 0),
    nombre_festejado    VARCHAR(100) NOT NULL,
    edad_festejado      INTEGER NOT NULL
        CONSTRAINT reservas_edad_festejado_check CHECK (edad_festejado > 0),
    comentarios         TEXT,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    activo              BOOLEAN    DEFAULT TRUE,
    fecha_creacion      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horario_valido CHECK (hora_fin > hora_inicio)
);

ALTER TABLE tramboory.reservas OWNER TO cris;

CREATE INDEX idx_reservas_fecha
    ON tramboory.reservas (fecha_reserva);

CREATE INDEX idx_reservas_usuario
    ON tramboory.reservas (id_usuario);

CREATE INDEX idx_reservas_paquete
    ON tramboory.reservas (id_paquete);

CREATE INDEX idx_reservas_opcion_alimento
    ON tramboory.reservas (id_opcion_alimento);

CREATE INDEX idx_reservas_mampara
    ON tramboory.reservas (id_mampara);

CREATE INDEX idx_reservas_tematica
    ON tramboory.reservas (id_tematica);

CREATE UNIQUE INDEX idx_reservas_horario
    ON tramboory.reservas (fecha_reserva, hora_inicio, hora_fin)
    WHERE (estado <> 'cancelada');

CREATE INDEX idx_reservas_estado
    ON tramboory.reservas (id, estado);

-- ------------------------------------------------------
-- 4.10. finanzas
-- ------------------------------------------------------
CREATE TABLE tramboory.finanzas
(
    id                  SERIAL PRIMARY KEY,
    id_reserva          INTEGER
        REFERENCES tramboory.reservas(id),
    tipo                tramboory.enum_finanzas_tipo NOT NULL,
    monto               NUMERIC(10, 2)               NOT NULL
        CONSTRAINT finanzas_monto_check CHECK (monto > 0),
    fecha               DATE                         NOT NULL,
    descripcion         TEXT,
    factura_pdf         VARCHAR(255),
    factura_xml         VARCHAR(255),
    archivo_prueba      VARCHAR(255),
    activo              BOOLEAN  DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_categoria        INTEGER
        REFERENCES tramboory.categorias(id),
    id_usuario          INTEGER  NOT NULL
        REFERENCES tramboory.usuarios(id)
            ON DELETE CASCADE
);

ALTER TABLE tramboory.finanzas OWNER TO cris;

CREATE INDEX idx_finanzas_fecha
    ON tramboory.finanzas (fecha);

CREATE INDEX idx_finanzas_reserva
    ON tramboory.finanzas (id_reserva);

CREATE INDEX idx_finanzas_categoria
    ON tramboory.finanzas (id_categoria);

-- ------------------------------------------------------
-- 4.11. pagos
-- ------------------------------------------------------
CREATE TABLE tramboory.pagos
(
    id                  SERIAL PRIMARY KEY,
    id_reserva          INTEGER NOT NULL
        REFERENCES tramboory.reservas(id),
    monto               NUMERIC(10, 2) NOT NULL
        CONSTRAINT pagos_monto_check CHECK (monto > 0),
    fecha_pago          DATE NOT NULL,
    estado              tramboory.enum_pagos_estado NOT NULL DEFAULT 'pendiente',
    metodo_pago         VARCHAR(50),
    referencia_pago     VARCHAR(100),
    es_pago_parcial     BOOLEAN      DEFAULT FALSE,
    notas               TEXT,
    fecha_creacion      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tramboory.pagos OWNER TO cris;

CREATE INDEX idx_pagos_fecha
    ON tramboory.pagos (fecha_pago);

CREATE INDEX idx_pagos_reserva
    ON tramboory.pagos (id_reserva);

CREATE INDEX idx_pagos_compuesto
    ON tramboory.pagos (id_reserva, estado, fecha_pago);

CREATE INDEX idx_pagos_reserva_estado
    ON tramboory.pagos (id_reserva, estado);

CREATE INDEX idx_pagos_reserva_estado_fecha
    ON tramboory.pagos (id_reserva, estado, fecha_pago);

-- ------------------------------------------------------
-- 4.12. reserva_extras (tabla intermedia)
-- ------------------------------------------------------
CREATE TABLE tramboory.reserva_extras
(
    id_reserva          INTEGER NOT NULL
        REFERENCES tramboory.reservas(id)
            ON DELETE CASCADE,
    id_extra            INTEGER NOT NULL
        REFERENCES tramboory.extras(id)
            ON DELETE CASCADE,
    cantidad            INTEGER   DEFAULT 1 NOT NULL
        CONSTRAINT reserva_extras_cantidad_check CHECK (cantidad > 0),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_reserva, id_extra)
);

ALTER TABLE tramboory.reserva_extras OWNER TO cris;

CREATE INDEX idx_reserva_extras_reserva
    ON tramboory.reserva_extras (id_reserva);

CREATE INDEX idx_reserva_extras_extra
    ON tramboory.reserva_extras (id_extra);

-- ------------------------------------------------------
-- 4.13. registro_auditoria
-- ------------------------------------------------------
CREATE TABLE tramboory.registro_auditoria
(
    id               BIGSERIAL PRIMARY KEY,
    nombre_tabla     VARCHAR(50) NOT NULL,
    tipo_operacion   VARCHAR(20) NOT NULL,
    id_usuario       INTEGER,
    fecha_operacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    direccion_ip     VARCHAR(45),
    agente_usuario   TEXT
);

ALTER TABLE tramboory.registro_auditoria OWNER TO cris;

-- ------------------------------------------------------
-- 4.14. auditoria
-- ------------------------------------------------------
CREATE TABLE tramboory.auditoria
(
    id              SERIAL PRIMARY KEY,
    id_usuario      INTEGER NOT NULL
        REFERENCES tramboory.usuarios(id)
            ON DELETE CASCADE,
    nombre_usuario  VARCHAR(100) NOT NULL,
    fecha_operacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transaccion     TEXT NOT NULL
);

ALTER TABLE tramboory.auditoria OWNER TO cris;

-- ======================================================
-- 5. FUNCIONES Y TRIGGERS DE AUDITORÍA
-- ======================================================

-- ------------------------------------------------------
-- 5.1. funcion_auditoria()
-- ------------------------------------------------------
CREATE OR REPLACE FUNCTION tramboory.funcion_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO tramboory.registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            current_setting('app.id_usuario_actual', TRUE)::INTEGER,
            row_to_json(OLD),
            NULL
        );
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO tramboory.registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            current_setting('app.id_usuario_actual', TRUE)::INTEGER,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;

    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO tramboory.registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            current_setting('app.id_usuario_actual', TRUE)::INTEGER,
            NULL,
            row_to_json(NEW)
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$;

ALTER FUNCTION tramboory.funcion_auditoria() OWNER TO cris;

-- ------------------------------------------------------
-- 5.2. Triggers de auditoría
-- ------------------------------------------------------
CREATE TRIGGER aud_usuarios
    AFTER INSERT OR UPDATE OR DELETE
    ON tramboory.usuarios
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.funcion_auditoria();

CREATE TRIGGER aud_reservas
    AFTER INSERT OR UPDATE OR DELETE
    ON tramboory.reservas
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.funcion_auditoria();

CREATE TRIGGER aud_finanzas
    AFTER INSERT OR UPDATE OR DELETE
    ON tramboory.finanzas
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.funcion_auditoria();

CREATE TRIGGER aud_pagos
    AFTER INSERT OR UPDATE OR DELETE
    ON tramboory.pagos
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.funcion_auditoria();

-- ======================================================
-- 6. FUNCIONES Y TRIGGERS PARA VALIDACIÓN DE RESERVAS
-- ======================================================

-- ------------------------------------------------------
-- 6.1. validar_reserva() [Verifica solapamiento de reservas confirmadas]
-- ------------------------------------------------------
CREATE OR REPLACE FUNCTION tramboory.validar_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar si existe una reserva confirmada que se solape con la nueva
    IF EXISTS (
        SELECT 1
        FROM tramboory.reservas r
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

ALTER FUNCTION tramboory.validar_reserva() OWNER TO cris;

CREATE TRIGGER verificar_reserva
    BEFORE INSERT OR UPDATE
    ON tramboory.reservas
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.validar_reserva();

-- ------------------------------------------------------
-- 6.2. aplicar_fee_martes() [Agrega 1500 si es martes]
-- ------------------------------------------------------
CREATE OR REPLACE FUNCTION tramboory.aplicar_fee_martes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si es martes (dow = 2), se suma 1500 al total
    IF EXTRACT(DOW FROM NEW.fecha_reserva) = 2 THEN
        NEW.total := NEW.total + 1500;
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION tramboory.aplicar_fee_martes() OWNER TO cris;

CREATE TRIGGER trigger_fee_martes
    BEFORE INSERT OR UPDATE
    ON tramboory.reservas
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.aplicar_fee_martes();

-- ------------------------------------------------------
-- 6.3. calcular_total_extras()
-- ------------------------------------------------------
CREATE OR REPLACE FUNCTION tramboory.calcular_total_extras(p_id_reserva INTEGER)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
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
$$;

ALTER FUNCTION tramboory.calcular_total_extras(INTEGER) OWNER TO cris;

-- ------------------------------------------------------
-- 6.4. actualizar_total_reserva() [Ajusta `reservas.total` según extras]
-- ------------------------------------------------------
CREATE OR REPLACE FUNCTION tramboory.actualizar_total_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_extras DECIMAL;
    total_base   DECIMAL;
    reserva_id   INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        reserva_id := OLD.id_reserva;
    ELSE
        reserva_id := NEW.id_reserva;
    END IF;

    -- Calcular el total de extras
    total_extras := tramboory.calcular_total_extras(reserva_id);

    -- Obtener el total base de la reserva (columna 'total')
    SELECT total INTO total_base
    FROM tramboory.reservas
    WHERE id = reserva_id;

    -- Sumar los extras y actualizar la reserva
    UPDATE tramboory.reservas
    SET total = total_base + total_extras
    WHERE id = reserva_id;

    RETURN NULL;
END;
$$;

ALTER FUNCTION tramboory.actualizar_total_reserva() OWNER TO cris;

CREATE TRIGGER trigger_actualizar_total_reserva
    AFTER INSERT OR UPDATE OR DELETE
    ON tramboory.reserva_extras
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.actualizar_total_reserva();

-- ------------------------------------------------------
-- 6.5. ajustar_fecha_reserva() [Asegura que sea sólo la parte DATE]
-- ------------------------------------------------------
CREATE OR REPLACE FUNCTION tramboory.ajustar_fecha_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fecha_reserva := NEW.fecha_reserva::DATE;
    RETURN NEW;
END;
$$;

ALTER FUNCTION tramboory.ajustar_fecha_reserva() OWNER TO cris;

CREATE TRIGGER trigger_ajustar_fecha_reserva
    BEFORE INSERT OR UPDATE
    ON tramboory.reservas
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.ajustar_fecha_reserva();

-- ======================================================
-- 7. FUNCIONES Y TRIGGERS PARA MANEJO DE PAGOS
--    (Creación automática de pago + actualización del estado)
-- ======================================================

-- ------------------------------------------------------
-- 7.1. crear_pago_para_reserva() [Crea un pago pendiente por la reserva]
-- ------------------------------------------------------
CREATE OR REPLACE FUNCTION tramboory.crear_pago_para_reserva()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Al crearse una reserva, crear un pago en estado 'pendiente' por el total
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
        'pendiente'    -- estado inicial
    );
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION tramboory.crear_pago_para_reserva()
IS 'Crea automáticamente un pago pendiente cuando se crea una nueva reserva';

ALTER FUNCTION tramboory.crear_pago_para_reserva() OWNER TO cris;

CREATE TRIGGER trigger_crear_pago_reserva
    AFTER INSERT
    ON tramboory.reservas
    FOR EACH ROW
EXECUTE PROCEDURE tramboory.crear_pago_para_reserva();

COMMENT ON TRIGGER trigger_crear_pago_reserva ON tramboory.reservas
IS 'Trigger que crea automáticamente un pago cuando se crea una reserva';

-- ------------------------------------------------------
-- 7.2. manejar_actualizacion_pago() [Confirma la reserva si se cubre el total]
-- ------------------------------------------------------
CREATE OR REPLACE FUNCTION tramboory.manejar_actualizacion_pago()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    categoria_id  INT;
    total_pagado  NUMERIC(10, 2);
    total_reserva NUMERIC(10, 2);
BEGIN
    -- Solo proceder si cambia el estado (ej: de 'pendiente' a 'completado' o 'fallido')
    IF OLD.estado <> NEW.estado THEN

        IF NEW.estado = 'completado' THEN
            -- Calcular total pagado (solo pagos completados)
            SELECT COALESCE(SUM(monto), 0)
              INTO total_pagado
              FROM tramboory.pagos
             WHERE id_reserva = NEW.id_reserva
               AND estado = 'completado';

            -- Obtener total de la reserva
            SELECT total
              INTO total_reserva
              FROM tramboory.reservas
             WHERE id = NEW.id_reserva;

            -- Confirmar la reserva si el total pagado cubre (o excede) el total de la reserva
            IF total_pagado >= total_reserva THEN
                UPDATE tramboory.reservas
                   SET estado = 'confirmada'
                 WHERE id = NEW.id_reserva;

                -- Verificar si existe la categoría "Reservación" en finanzas, si no, crearla
                SELECT id
                  INTO categoria_id
                  FROM tramboory.categorias
                 WHERE nombre = 'Reservación'
                   AND activo = TRUE
                 LIMIT 1;

                IF categoria_id IS NULL THEN
                    INSERT INTO tramboory.categorias (nombre, color, activo)
                    VALUES ('Reservación', '#000000', TRUE)
                    RETURNING id INTO categoria_id;
                END IF;

                -- Crear registro en finanzas con el monto de ESTE pago
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

        ELSIF NEW.estado = 'fallido' THEN
            -- Verificar pagos completados aparte de éste
            SELECT COALESCE(SUM(monto), 0)
              INTO total_pagado
              FROM tramboory.pagos
             WHERE id_reserva = NEW.id_reserva
               AND estado = 'completado'
               AND id <> NEW.id;

            -- Si no hay ningún pago completado previo, la reserva vuelve a pendiente
            IF total_pagado = 0 THEN
                UPDATE tramboory.reservas
                   SET estado = 'pendiente'
                 WHERE id = NEW.id_reserva;
            END IF;
        END IF;

    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION tramboory.manejar_actualizacion_pago()
IS 'Maneja las actualizaciones de estado de pago y sus efectos en reservas y finanzas';

ALTER FUNCTION tramboory.manejar_actualizacion_pago() OWNER TO cris;

CREATE TRIGGER trigger_actualizar_estado_pago
    AFTER UPDATE OF estado
    ON tramboory.pagos
    FOR EACH ROW
    WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
EXECUTE PROCEDURE tramboory.manejar_actualizacion_pago();

COMMENT ON TRIGGER trigger_actualizar_estado_pago ON tramboory.pagos
IS 'Trigger que maneja las actualizaciones de estado de pago (pendiente->completado/fallido) y sus efectos en reservas/finanzas';

-- ======================================================
-- FIN DEL SCRIPT
-- ======================================================

-- Si deseas forzar a que el script termine correctamente:
COMMIT;
