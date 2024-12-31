-- 1. Crear el esquema y ajustar el search_path
CREATE SCHEMA IF NOT EXISTS tramboory
    AUTHORIZATION cris;

SET search_path TO tramboory, public;

-------------------------------------------------------------------------------
-- 2. Crear los tipos enumerados en el esquema tramboory
-------------------------------------------------------------------------------
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

CREATE TYPE tramboory.enum_pagos_metodo_pago AS ENUM ('transferencia', 'efectivo');
ALTER TYPE tramboory.enum_pagos_metodo_pago OWNER TO cris;

-------------------------------------------------------------------------------
-- 3. Crear las tablas (todas se crean en el esquema 'tramboory'
--    gracias a search_path = tramboory, public)
-------------------------------------------------------------------------------

-- Tabla usuarios
CREATE TABLE usuarios
(
    id                  serial
        PRIMARY KEY,
    nombre              VARCHAR(100)                          NOT NULL,
    email               VARCHAR(100)                          NOT NULL
        UNIQUE,
    clave_hash          VARCHAR(255)                          NOT NULL,
    telefono            VARCHAR(20),
    direccion           TEXT,
    tipo_usuario        tramboory.enum_usuarios_tipo_usuario  NOT NULL,
    id_personalizado    VARCHAR(100),
    activo              BOOLEAN    DEFAULT TRUE,
    fecha_creacion      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios
    OWNER TO cris;

-- Tabla categorias
CREATE TABLE categorias
(
    id                  serial
        PRIMARY KEY,
    nombre              VARCHAR(100)                                  NOT NULL
        UNIQUE,
    color               VARCHAR(7) DEFAULT '#000000' NOT NULL
        CONSTRAINT categorias_color_check
            CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    activo              BOOLEAN     DEFAULT TRUE,
    fecha_creacion      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE categorias
    OWNER TO cris;

-- Tabla extras
CREATE TABLE extras
(
    id                  serial
        PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    descripcion         TEXT,
    precio              NUMERIC(10, 2)  NOT NULL
        CONSTRAINT extras_precio_check
            CHECK (precio >= 0),
    activo              BOOLEAN    DEFAULT TRUE,
    fecha_creacion      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE extras
    OWNER TO cris;

-- Tabla paquetes_alimentos
CREATE TABLE paquetes_alimentos
(
    id          serial
        PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

ALTER TABLE paquetes_alimentos
    OWNER TO cris;

-- Tabla paquetes
CREATE TABLE paquetes
(
    id                     serial
        PRIMARY KEY,
    nombre                 VARCHAR(100)    NOT NULL,
    descripcion            TEXT,
    precio_lunes_jueves    NUMERIC(10, 2)  NOT NULL
        CONSTRAINT paquetes_precio_lunes_jueves_check
            CHECK (precio_lunes_jueves >= 0),
    precio_viernes_domingo NUMERIC(10, 2)  NOT NULL
        CONSTRAINT paquetes_precio_viernes_domingo_check
            CHECK (precio_viernes_domingo >= 0),
    id_paquete_alimento    INTEGER
        REFERENCES paquetes_alimentos,
    activo                 BOOLEAN    DEFAULT TRUE,
    fecha_creacion         TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion    TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE paquetes
    OWNER TO cris;

CREATE INDEX idx_paquetes_paquete_alimento
    ON paquetes (id_paquete_alimento);

-- Tabla tematicas
CREATE TABLE tematicas
(
    id                  serial
        PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    foto                VARCHAR(255),
    activo              BOOLEAN    DEFAULT TRUE,
    fecha_creacion      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE tematicas
    OWNER TO cris;

-- Tabla mamparas
CREATE TABLE mamparas
(
    id                  serial
        PRIMARY KEY,
    id_tematica         INTEGER       NOT NULL
        REFERENCES tematicas
            ON DELETE RESTRICT,
    piezas              INTEGER       NOT NULL
        CONSTRAINT mamparas_piezas_check
            CHECK (piezas > 0),
    precio              NUMERIC(10, 2) NOT NULL
        CONSTRAINT mamparas_precio_check
            CHECK (precio >= 0),
    foto                VARCHAR(255),
    activo              BOOLEAN    DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE mamparas
    OWNER TO cris;

CREATE INDEX idx_mamparas_tematica
    ON mamparas (id_tematica);

-- Tabla opciones_alimentos
CREATE TABLE opciones_alimentos
(
    id                  serial
        PRIMARY KEY,
    nombre              VARCHAR(100)     NOT NULL,
    descripcion         TEXT,
    precio_extra        NUMERIC(10, 2)   NOT NULL
        CONSTRAINT opciones_alimentos_precio_extra_check
            CHECK (precio_extra >= 0),
    disponible          BOOLEAN               DEFAULT TRUE,
    turno               tramboory.enum_turno  DEFAULT 'ambos',
    platillo_adulto     VARCHAR(100)     NOT NULL,
    platillo_nino       VARCHAR(100)     NOT NULL,
    opcion_papas        BOOLEAN               DEFAULT FALSE,
    precio_papas        NUMERIC(10, 2)        DEFAULT 19.00
        CONSTRAINT opciones_alimentos_precio_papas_check
            CHECK (precio_papas >= 0),
    precio_adulto       NUMERIC(10, 2)        DEFAULT 0.00
        CONSTRAINT opciones_alimentos_precio_adulto_check
            CHECK (precio_adulto >= 0),
    precio_nino         NUMERIC(10, 2)        DEFAULT 0.00
        CONSTRAINT opciones_alimentos_precio_nino_check
            CHECK (precio_nino >= 0),
    activo              BOOLEAN               DEFAULT TRUE,
    fecha_creacion      TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE opciones_alimentos
    OWNER TO cris;

-- Tabla reservas
CREATE TABLE reservas
(
    id                  serial
        PRIMARY KEY,
    id_usuario          INTEGER                                                                         NOT NULL
        REFERENCES usuarios
            ON DELETE CASCADE,
    id_paquete          INTEGER                                                                         NOT NULL
        REFERENCES paquetes,
    id_opcion_alimento  INTEGER
        REFERENCES opciones_alimentos,
    id_mampara          INTEGER                                                                         NOT NULL
        REFERENCES mamparas,
    id_tematica         INTEGER                                                                         NOT NULL
        REFERENCES tematicas,
    fecha_reserva       DATE                                                                            NOT NULL
        CONSTRAINT reservas_fecha_reserva_check
            CHECK (fecha_reserva >= CURRENT_DATE),
    estado              tramboory.enum_reservas_estado  DEFAULT 'pendiente' NOT NULL,
    total               NUMERIC(10, 2)                                                                  NOT NULL
        CONSTRAINT reservas_total_check
            CHECK (total >= 0),
    nombre_festejado    VARCHAR(100)                                                                    NOT NULL,
    edad_festejado      INTEGER                                                                         NOT NULL
        CONSTRAINT reservas_edad_festejado_check
            CHECK (edad_festejado > 0),
    comentarios         TEXT,
    hora_inicio         TIME                                                                            NOT NULL,
    hora_fin            TIME                                                                            NOT NULL,
    activo              BOOLEAN                      DEFAULT TRUE,
    fecha_creacion      TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horario_valido
        CHECK (hora_fin > hora_inicio)
);

ALTER TABLE reservas
    OWNER TO cris;

CREATE INDEX idx_reservas_fecha
    ON reservas (fecha_reserva);

CREATE INDEX idx_reservas_usuario
    ON reservas (id_usuario);

CREATE INDEX idx_reservas_paquete
    ON reservas (id_paquete);

CREATE INDEX idx_reservas_opcion_alimento
    ON reservas (id_opcion_alimento);

CREATE INDEX idx_reservas_mampara
    ON reservas (id_mampara);

CREATE INDEX idx_reservas_tematica
    ON reservas (id_tematica);

-- Índice único condicional (solo no-canceladas)
CREATE UNIQUE INDEX idx_reservas_horario
    ON reservas (fecha_reserva, hora_inicio, hora_fin)
    WHERE (estado <> 'cancelada');

-- Tabla finanzas
CREATE TABLE finanzas
(
    id                  serial
        PRIMARY KEY,
    id_reserva          INTEGER
        REFERENCES reservas,
    tipo                tramboory.enum_finanzas_tipo  NOT NULL,
    monto               NUMERIC(10, 2)                NOT NULL
        CONSTRAINT finanzas_monto_check
            CHECK (monto > 0),
    fecha               DATE                          NOT NULL,
    descripcion         TEXT,
    categoria           VARCHAR(100),
    factura_pdf         VARCHAR(255),
    factura_xml         VARCHAR(255),
    archivo_prueba      VARCHAR(255),
    activo              BOOLEAN   DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_categoria        INTEGER
        REFERENCES categorias,
    id_usuario          INTEGER                       NOT NULL
        REFERENCES usuarios
            ON DELETE CASCADE
);

ALTER TABLE finanzas
    OWNER TO cris;

CREATE INDEX idx_finanzas_fecha
    ON finanzas (fecha);

CREATE INDEX idx_finanzas_reserva
    ON finanzas (id_reserva);

-- Tabla pagos
CREATE TABLE pagos
(
    id                  serial
        PRIMARY KEY,
    id_reserva          INTEGER                                                                       NOT NULL
        REFERENCES reservas,
    monto               NUMERIC(10, 2)                                                                NOT NULL
        CONSTRAINT pagos_monto_check
            CHECK (monto > 0),
    fecha_pago          DATE                                                                          NOT NULL,
    estado              tramboory.enum_pagos_estado DEFAULT 'pendiente' NOT NULL,
    fecha_creacion      TIMESTAMP                DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP                DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pagos
    OWNER TO cris;

CREATE INDEX idx_pagos_fecha
    ON pagos (fecha_pago);

CREATE INDEX idx_pagos_reserva
    ON pagos (id_reserva);

CREATE INDEX idx_pagos_compuesto
    ON pagos (id_reserva, estado, fecha_pago);

-- Tabla reserva_extras
CREATE TABLE reserva_extras
(
    id_reserva          INTEGER    NOT NULL
        REFERENCES reservas
            ON DELETE CASCADE,
    id_extra            INTEGER    NOT NULL
        REFERENCES extras
            ON DELETE CASCADE,
    cantidad            INTEGER    DEFAULT 1 NOT NULL
        CONSTRAINT reserva_extras_cantidad_check
            CHECK (cantidad > 0),
    fecha_creacion      TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_reserva, id_extra)
);

ALTER TABLE reserva_extras
    OWNER TO cris;

CREATE INDEX idx_reserva_extras_reserva
    ON reserva_extras (id_reserva);

CREATE INDEX idx_reserva_extras_extra
    ON reserva_extras (id_extra);

-- Tabla registro_auditoria
CREATE TABLE registro_auditoria
(
    id               BIGSERIAL
        PRIMARY KEY,
    nombre_tabla     VARCHAR(50)  NOT NULL,
    tipo_operacion   VARCHAR(20)  NOT NULL,
    id_usuario       INTEGER,
    fecha_operacion  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    direccion_ip     VARCHAR(45),
    agente_usuario   TEXT
);

ALTER TABLE registro_auditoria
    OWNER TO cris;

-- Tabla auditoria
CREATE TABLE auditoria
(
    id              serial
        PRIMARY KEY,
    id_usuario      INTEGER                                            NOT NULL
        REFERENCES usuarios
            ON DELETE CASCADE,
    nombre_usuario  VARCHAR(100)                                       NOT NULL,
    fecha_operacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transaccion     TEXT                                               NOT NULL
);

ALTER TABLE auditoria
    OWNER TO cris;

-------------------------------------------------------------------------------
-- 4. Crear las funciones y triggers
-------------------------------------------------------------------------------

-- Función de auditoría genérica
CREATE FUNCTION funcion_auditoria() 
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos
        )
        VALUES (
            TG_TABLE_NAME,
            TG_OP,
            current_setting('app.id_usuario_actual', TRUE)::INTEGER,
            row_to_json(OLD),
            NULL
        );
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos
        )
        VALUES (
            TG_TABLE_NAME,
            TG_OP,
            current_setting('app.id_usuario_actual', TRUE)::INTEGER,
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;

    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos
        )
        VALUES (
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

ALTER FUNCTION funcion_auditoria() OWNER TO cris;

-- Función para validar reserva (evitar cruce de horario con otra reserva confirmada)
CREATE FUNCTION validar_reserva() 
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
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

ALTER FUNCTION validar_reserva() OWNER TO cris;

CREATE TRIGGER verificar_reserva
    BEFORE INSERT OR UPDATE
    ON reservas
    FOR EACH ROW
EXECUTE PROCEDURE validar_reserva();

-- Función para aplicar fee de 1500 si la reserva es en martes
CREATE FUNCTION aplicar_fee_martes() 
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    -- Si es martes (dow=2), se suma 1500 al total
    IF EXTRACT(DOW FROM NEW.fecha_reserva) = 2 THEN
        NEW.total := NEW.total + 1500;
    END IF;
    RETURN NEW;
END;
$$;

ALTER FUNCTION aplicar_fee_martes() OWNER TO cris;

CREATE TRIGGER trigger_fee_martes
    BEFORE INSERT OR UPDATE
    ON reservas
    FOR EACH ROW
EXECUTE PROCEDURE aplicar_fee_martes();

-- Función para actualizar el estado de la reserva y crear registro en finanzas
-- cuando cambia el estado de un pago
CREATE FUNCTION actualizar_estado_reserva_y_finanza() 
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    categoria_id INT;
BEGIN
    IF OLD.estado <> NEW.estado THEN

        IF NEW.estado = 'completado' THEN
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

        ELSIF NEW.estado = 'fallido' THEN
            -- Si el pago falla, la reserva vuelve a pendiente
            UPDATE reservas
            SET estado = 'pendiente'
            WHERE id = NEW.id_reserva;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

ALTER FUNCTION actualizar_estado_reserva_y_finanza() OWNER TO cris;

CREATE TRIGGER trigger_actualizar_estado_reserva_y_finanza
    AFTER UPDATE
    ON pagos
    FOR EACH ROW
    WHEN (OLD.estado <> NEW.estado)
EXECUTE PROCEDURE actualizar_estado_reserva_y_finanza();

-------------------------------------------------------------------------------
-- (Opcional) Si deseas disparar auditoría en todas las tablas,
--           podrías crear triggers por cada tabla, por ejemplo:
-- CREATE TRIGGER aud_usuarios
--     AFTER INSERT OR UPDATE OR DELETE
--     ON usuarios
--     FOR EACH ROW
-- EXECUTE PROCEDURE funcion_auditoria();
-------------------------------------------------------------------------------

-- Fin del script