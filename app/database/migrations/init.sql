-- ============================================================================
-- 1) Nos conectamos a la base de datos postgres y creamos/actualizamos el schema
-- ============================================================================

-- ============================================================================
-- 2) Usamos una transacción para mantener atomicidad (ACID)
-- ============================================================================
BEGIN;

-- ============================================================================
-- 3) Creación del schema 'tramboory' (separado de 'public')
-- ============================================================================
DROP SCHEMA IF EXISTS tramboory CASCADE;
CREATE SCHEMA tramboory;

-- Ajustar el search_path para que todo se cree dentro de 'tramboory'
SET search_path TO tramboory;

-- ============================================================================
-- 4) Definición de tipos ENUM
-- ============================================================================
CREATE TYPE enum_usuarios_tipo_usuario AS ENUM ('cliente', 'admin');
CREATE TYPE enum_reservas_estado AS ENUM ('pendiente', 'confirmada', 'cancelada');
CREATE TYPE enum_finanzas_tipo AS ENUM ('ingreso', 'gasto');
CREATE TYPE enum_pagos_estado AS ENUM ('pendiente', 'completado', 'fallido');
CREATE TYPE enum_turno AS ENUM ('manana', 'tarde', 'ambos');

-- ============================================================================
-- 5) Creación de tablas con restricciones y llaves foráneas
-- ============================================================================

-- 5.1) Tabla de usuarios
CREATE TABLE usuarios
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL UNIQUE,
    clave_hash          VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20),
    direccion           TEXT,
    tipo_usuario        enum_usuarios_tipo_usuario NOT NULL,
    id_personalizado    VARCHAR(100),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.2) Tabla de categorias
CREATE TABLE categorias
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    color               VARCHAR(7) NOT NULL DEFAULT '#000000'
        CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.3) Tabla de extras
CREATE TABLE extras
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio              NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.4) Tabla de paquetes_alimentos
CREATE TABLE paquetes_alimentos
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         VARCHAR(255)
);

-- 5.5) Tabla de paquetes
CREATE TABLE paquetes
(
    id                     SERIAL PRIMARY KEY,
    nombre                 VARCHAR(100) NOT NULL,
    descripcion            TEXT,
    precio_lunes_jueves    NUMERIC(10, 2) NOT NULL CHECK (precio_lunes_jueves >= 0),
    precio_viernes_domingo NUMERIC(10, 2) NOT NULL CHECK (precio_viernes_domingo >= 0),
    id_paquete_alimento    INTEGER REFERENCES paquetes_alimentos(id),
    activo                 BOOLEAN DEFAULT TRUE,
    fecha_creacion         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_paquetes_paquete_alimento ON paquetes (id_paquete_alimento);

-- 5.6) Tabla de tematicas
CREATE TABLE tematicas
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    foto                VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.7) Tabla de mamparas
CREATE TABLE mamparas
(
    id                  SERIAL PRIMARY KEY,
    id_tematica         INT NOT NULL REFERENCES tematicas(id) ON DELETE RESTRICT,
    piezas              INT NOT NULL CHECK (piezas > 0),
    precio              NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    foto                VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mamparas_tematica ON mamparas (id_tematica);

-- 5.8) Tabla de opciones_alimentos
CREATE TABLE opciones_alimentos
(
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio_extra        NUMERIC(10, 2) NOT NULL CHECK (precio_extra >= 0),
    disponible          BOOLEAN DEFAULT TRUE,
    turno               enum_turno DEFAULT 'ambos',
    platillo_adulto     VARCHAR(100) NOT NULL,
    platillo_nino       VARCHAR(100) NOT NULL,
    opcion_papas        BOOLEAN DEFAULT FALSE,
    precio_papas        NUMERIC(10, 2) DEFAULT 19.00 CHECK (precio_papas >= 0),
    precio_adulto       NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio_adulto >= 0),
    precio_nino         NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio_nino >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5.9) Tabla de reservas (al borrar un usuario, se borran sus reservas)
CREATE TABLE reservas
(
    id                  SERIAL PRIMARY KEY,
    id_usuario          INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_paquete          INT NOT NULL REFERENCES paquetes(id),
    id_opcion_alimento  INT REFERENCES opciones_alimentos(id),
    id_mampara          INT NOT NULL REFERENCES mamparas(id),
    id_tematica         INT NOT NULL REFERENCES tematicas(id),
    fecha_reserva       DATE NOT NULL CHECK (fecha_reserva >= CURRENT_DATE),
    estado              enum_reservas_estado NOT NULL DEFAULT 'pendiente',
    total               NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    nombre_festejado    VARCHAR(100) NOT NULL,
    edad_festejado      INT NOT NULL CHECK (edad_festejado > 0),
    comentarios         TEXT,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horario_valido CHECK (hora_fin > hora_inicio)
);

CREATE INDEX idx_reservas_fecha ON reservas (fecha_reserva);
CREATE INDEX idx_reservas_usuario ON reservas (id_usuario);
CREATE INDEX idx_reservas_paquete ON reservas (id_paquete);
CREATE INDEX idx_reservas_opcion_alimento ON reservas (id_opcion_alimento);
CREATE INDEX idx_reservas_mampara ON reservas (id_mampara);
CREATE INDEX idx_reservas_tematica ON reservas (id_tematica);

-- Impedir superposición de reservas confirmadas
CREATE UNIQUE INDEX idx_reservas_horario
    ON reservas (fecha_reserva, hora_inicio, hora_fin)
    WHERE (estado <> 'cancelada');

-- 5.10) Tabla de finanzas
CREATE TABLE finanzas
(
    id                  SERIAL PRIMARY KEY,
    id_reserva          INT REFERENCES reservas(id),
    tipo                enum_finanzas_tipo NOT NULL,
    monto               NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha               DATE NOT NULL,
    descripcion         TEXT,
    categoria           VARCHAR(100),
    factura_pdf         VARCHAR(255),
    factura_xml         VARCHAR(255),
    archivo_prueba      VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_categoria        INT REFERENCES categorias(id),
    id_usuario          INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_finanzas_fecha ON finanzas (fecha);
CREATE INDEX idx_finanzas_reserva ON finanzas (id_reserva);

-- 5.11) Tabla de pagos
CREATE TABLE pagos
(
    id                  SERIAL PRIMARY KEY,
    id_reserva          INT NOT NULL REFERENCES reservas(id),
    monto               NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha_pago          DATE NOT NULL,
    estado              enum_pagos_estado NOT NULL DEFAULT 'pendiente',
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pagos_fecha ON pagos (fecha_pago);
CREATE INDEX idx_pagos_reserva ON pagos (id_reserva);
CREATE INDEX idx_pagos_compuesto ON pagos (id_reserva, estado, fecha_pago);

-- 5.12) Tabla de reserva_extras (N:M entre reservas y extras)
CREATE TABLE reserva_extras
(
    id_reserva          INT NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    id_extra            INT NOT NULL REFERENCES extras(id) ON DELETE CASCADE,
    cantidad            INT DEFAULT 1 NOT NULL CHECK (cantidad > 0),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_reserva, id_extra)
);

CREATE INDEX idx_reserva_extras_reserva ON reserva_extras (id_reserva);
CREATE INDEX idx_reserva_extras_extra ON reserva_extras (id_extra);

-- 5.13) Tabla de registro_auditoria (logging de cambios)
CREATE TABLE registro_auditoria
(
    id               BIGSERIAL PRIMARY KEY,
    nombre_tabla     VARCHAR(50) NOT NULL,
    tipo_operacion   VARCHAR(20) NOT NULL,
    id_usuario       INT,
    fecha_operacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    direccion_ip     VARCHAR(45),
    agente_usuario   TEXT
);

-- 5.14) Tabla auditoria (cascada al borrar usuario)
CREATE TABLE auditoria
(
    id              SERIAL PRIMARY KEY,
    id_usuario      INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_usuario  VARCHAR(100) NOT NULL,
    fecha_operacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transaccion     TEXT NOT NULL
);

-- ============================================================================
-- 6) Creación de funciones y triggers para auditoría y lógica de negocio
-- ============================================================================

-- 6.1) Función de auditoría
CREATE OR REPLACE FUNCTION funcion_auditoria() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO registro_auditoria(
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
        INSERT INTO registro_auditoria(
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
        INSERT INTO registro_auditoria(
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

-- 6.2) Validar reserva (no permitir solapamiento de reservas confirmadas)
CREATE OR REPLACE FUNCTION validar_reserva() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
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

CREATE TRIGGER verificar_reserva
    BEFORE INSERT OR UPDATE 
    ON reservas
    FOR EACH ROW
EXECUTE FUNCTION validar_reserva();

-- 6.3) Aplicar fee de martes (1500 pesos) a la reserva
CREATE OR REPLACE FUNCTION aplicar_fee_martes() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si es martes (dow=2), se suma 1500 al total
    IF EXTRACT(DOW FROM NEW.fecha_reserva) = 2 THEN
        NEW.total := NEW.total + 1500;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_fee_martes
    BEFORE INSERT OR UPDATE 
    ON reservas
    FOR EACH ROW
EXECUTE FUNCTION aplicar_fee_martes();

-- 6.4) Actualizar estado de la reserva según el pago y crear finanza
CREATE OR REPLACE FUNCTION actualizar_estado_reserva_y_finanza() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
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

CREATE TRIGGER trigger_actualizar_estado_reserva_y_finanza
    AFTER UPDATE 
    ON pagos
    FOR EACH ROW
    WHEN (OLD.estado <> NEW.estado)
EXECUTE FUNCTION actualizar_estado_reserva_y_finanza();

-- ============================================================================
-- 7) Confirmamos la transacción (COMMIT) para que todo sea ACID
-- ============================================================================
COMMIT;