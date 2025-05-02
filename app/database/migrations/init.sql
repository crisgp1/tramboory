-- Improved Script for Tramboory Database
-- Addresses issues identified in process analysis
-- Implements quote-to-payment flow, improved inventory management, transaction verification, and JWT auth

-- Use transaction for atomicity
BEGIN;

-- ==========================================
-- Creation of schemas, adding security schema
-- ==========================================
CREATE SCHEMA IF NOT EXISTS main;
CREATE SCHEMA IF NOT EXISTS usuarios;
CREATE SCHEMA IF NOT EXISTS finanzas;
CREATE SCHEMA IF NOT EXISTS inventario;
CREATE SCHEMA IF NOT EXISTS seguridad; -- New schema for JWT and security

-- Set search_path to include all schemas
SET search_path TO main, usuarios, finanzas, inventario, seguridad, public;

-- ==========================================
-- Definition of enum types, adding new ones
-- ==========================================
DO $$
BEGIN
    -- Schema usuarios
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_usuarios_tipo_usuario' AND n.nspname = 'usuarios') THEN
        CREATE TYPE usuarios.enum_usuarios_tipo_usuario AS ENUM ('cliente', 'admin', 'inventario', 'finanzas');
    END IF;

    -- Schema main
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_reservas_estado' AND n.nspname = 'main') THEN
        CREATE TYPE main.enum_reservas_estado AS ENUM ('pendiente', 'confirmada', 'cancelada');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_cotizaciones_estado' AND n.nspname = 'main') THEN
        CREATE TYPE main.enum_cotizaciones_estado AS ENUM ('creada', 'confirmada', 'pagada', 'expirada', 'cancelada');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_turno' AND n.nspname = 'main') THEN
        CREATE TYPE main.enum_turno AS ENUM ('manana', 'tarde', 'ambos');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_notificaciones_tipo' AND n.nspname = 'main') THEN
        CREATE TYPE main.enum_notificaciones_tipo AS ENUM ('cotizacion', 'reserva', 'pago', 'inventario', 'sistema');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_notificaciones_estado' AND n.nspname = 'main') THEN
        CREATE TYPE main.enum_notificaciones_estado AS ENUM ('enviada', 'leida', 'error');
    END IF;

    -- Schema finanzas
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_finanzas_tipo' AND n.nspname = 'finanzas') THEN
        CREATE TYPE finanzas.enum_finanzas_tipo AS ENUM ('ingreso', 'gasto', 'reembolso');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_pagos_estado' AND n.nspname = 'finanzas') THEN
        CREATE TYPE finanzas.enum_pagos_estado AS ENUM ('pendiente', 'completado', 'fallido', 'reembolsado', 'parcial_reembolsado');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_metodo_pago' AND n.nspname = 'finanzas') THEN
        CREATE TYPE finanzas.enum_metodo_pago AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'otros');
    END IF;

    -- Schema inventario
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_ordenes_compra_estado' AND n.nspname = 'inventario') THEN
        CREATE TYPE inventario.enum_ordenes_compra_estado AS ENUM ('pendiente', 'aprobada', 'recibida', 'cancelada');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_tipo_alerta' AND n.nspname = 'inventario') THEN
        CREATE TYPE inventario.enum_tipo_alerta AS ENUM ('stock_bajo', 'caducidad', 'vencimiento_proveedor', 'ajuste_requerido');
    END IF;

    -- Schema seguridad (new)
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_permisos_nivel' AND n.nspname = 'seguridad') THEN
        CREATE TYPE seguridad.enum_permisos_nivel AS ENUM ('lectura', 'escritura', 'administrador');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_tokens_estado' AND n.nspname = 'seguridad') THEN
        CREATE TYPE seguridad.enum_tokens_estado AS ENUM ('activo', 'expirado', 'revocado');
    END IF;
END
$$;

-- ==========================================
-- Creation of tables - Schema seguridad (NEW)
-- ==========================================

-- Table permisos
CREATE TABLE IF NOT EXISTS seguridad.permisos (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    descripcion         TEXT,
    modulo              VARCHAR(50) NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table roles
CREATE TABLE IF NOT EXISTS seguridad.roles (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    descripcion         TEXT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table role_permisos (many-to-many)
CREATE TABLE IF NOT EXISTS seguridad.rol_permisos (
    id_rol              INTEGER REFERENCES seguridad.roles(id) ON DELETE CASCADE,
    id_permiso          INTEGER REFERENCES seguridad.permisos(id) ON DELETE CASCADE,
    nivel               seguridad.enum_permisos_nivel NOT NULL DEFAULT 'lectura',
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_rol, id_permiso)
);

-- Table tokens
CREATE TABLE IF NOT EXISTS seguridad.tokens (
    id                  SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL, -- Will be referenced to usuarios.usuarios later
    token_jti           VARCHAR(100) NOT NULL UNIQUE, -- JWT ID for tracking
    fecha_emision       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion    TIMESTAMP NOT NULL,
    estado              seguridad.enum_tokens_estado NOT NULL DEFAULT 'activo',
    direccion_ip        VARCHAR(45),
    agente_usuario      TEXT,
    fecha_revocacion    TIMESTAMP,
    razon_revocacion    TEXT,
    metadata            JSONB,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table usuario_roles (many-to-many)
CREATE TABLE IF NOT EXISTS seguridad.usuario_roles (
    id_usuario          INTEGER NOT NULL, -- Will be referenced to usuarios.usuarios later
    id_rol              INTEGER NOT NULL REFERENCES seguridad.roles(id) ON DELETE CASCADE,
    fecha_asignacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_rol)
);

-- ==========================================
-- Creation/Modification of tables - Schema usuarios
-- ==========================================

-- Table usuarios (modified)
CREATE TABLE IF NOT EXISTS usuarios.usuarios (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL UNIQUE,
    clave_hash          VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20),
    direccion           TEXT,
    tipo_usuario        usuarios.enum_usuarios_tipo_usuario NOT NULL,
    id_personalizado    VARCHAR(100),
    activo              BOOLEAN DEFAULT TRUE,
    ultimo_acceso       TIMESTAMP,
    intentos_fallidos   INTEGER DEFAULT 0,
    bloqueado_hasta     TIMESTAMP,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table registro_auditoria (enhanced)
CREATE TABLE IF NOT EXISTS usuarios.registro_auditoria (
    id               BIGSERIAL PRIMARY KEY,
    nombre_tabla     VARCHAR(50) NOT NULL,
    tipo_operacion   VARCHAR(20) NOT NULL,
    id_usuario       INTEGER,
    fecha_operacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    direccion_ip     VARCHAR(45),
    agente_usuario   TEXT,
    id_token         INTEGER REFERENCES seguridad.tokens(id)
);

-- Table auditoria
CREATE TABLE IF NOT EXISTS usuarios.auditoria (
    id              SERIAL PRIMARY KEY,
    id_usuario      INTEGER NOT NULL REFERENCES usuarios.usuarios(id) ON DELETE CASCADE,
    nombre_usuario  VARCHAR(100) NOT NULL,
    fecha_operacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transaccion     TEXT NOT NULL,
    direccion_ip    VARCHAR(45),
    agente_usuario  TEXT,
    id_token        INTEGER REFERENCES seguridad.tokens(id)
);

-- ==========================================
-- Creation/Modification of tables - Schema finanzas
-- ==========================================

-- Table categorias
CREATE TABLE IF NOT EXISTS finanzas.categorias (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    color               VARCHAR(7) DEFAULT '#000000' NOT NULL
        CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table finanzas (enhanced)
CREATE TABLE IF NOT EXISTS finanzas.finanzas (
    id                  SERIAL PRIMARY KEY,
    id_reserva          INTEGER, -- Referencia a main.reservas - se añadirá después
    id_cotizacion       INTEGER, -- NEW: Reference to main.cotizaciones
    tipo                finanzas.enum_finanzas_tipo NOT NULL,
    monto               NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha               DATE NOT NULL,
    descripcion         TEXT,
    factura_pdf         VARCHAR(255),
    factura_xml         VARCHAR(255),
    archivo_prueba      VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_categoria        INTEGER REFERENCES finanzas.categorias(id),
    id_usuario          INTEGER NOT NULL, -- Referencia a usuarios.usuarios - se añadirá después
    id_materia_prima    INTEGER, -- Referencia a inventario.materias_primas - se añadirá después
    id_transaccion      VARCHAR(100), -- NEW: External transaction ID
    id_pago             INTEGER, -- NEW: Reference to pagos table
    id_reembolso        INTEGER  -- NEW: Self-reference for refunds
);

-- Table pagos (enhanced)
CREATE TABLE IF NOT EXISTS finanzas.pagos (
    id                  SERIAL PRIMARY KEY,
    id_reserva          INTEGER, -- Optional: may be null if just a quote
    id_cotizacion       INTEGER, -- NEW: Reference to cotizaciones
    monto               NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha_pago          DATE NOT NULL,
    estado              finanzas.enum_pagos_estado DEFAULT 'pendiente' NOT NULL,
    metodo_pago         finanzas.enum_metodo_pago,
    referencia_pago     VARCHAR(100),
    es_pago_parcial     BOOLEAN DEFAULT FALSE,
    notas               TEXT,
    id_usuario          INTEGER NOT NULL, -- Who processed the payment
    id_transaccion      VARCHAR(100), -- External payment processor ID
    datos_transaccion   JSONB, -- Complete payment data
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table reembolsos (NEW)
CREATE TABLE IF NOT EXISTS finanzas.reembolsos (
    id                  SERIAL PRIMARY KEY,
    id_pago             INTEGER NOT NULL REFERENCES finanzas.pagos(id),
    monto_reembolso     NUMERIC(10, 2) NOT NULL CHECK (monto_reembolso > 0),
    fecha_reembolso     DATE NOT NULL,
    motivo              TEXT NOT NULL,
    referencia          VARCHAR(100),
    id_transaccion      VARCHAR(100), -- External transaction ID
    estado              finanzas.enum_pagos_estado NOT NULL DEFAULT 'pendiente',
    id_usuario          INTEGER NOT NULL, -- Who processed the refund
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Creation/Modification of tables - Schema inventario
-- ==========================================

-- Table proveedores
CREATE TABLE IF NOT EXISTS inventario.proveedores (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    contacto            VARCHAR(100),
    telefono            VARCHAR(20),
    email               VARCHAR(100),
    direccion           TEXT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table unidades_medida
CREATE TABLE IF NOT EXISTS inventario.unidades_medida (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(50) NOT NULL UNIQUE,
    abreviatura         VARCHAR(10) NOT NULL UNIQUE,
    tipo                VARCHAR(20) NOT NULL
        CHECK (tipo = ANY (ARRAY['masa', 'volumen', 'unidad', 'longitud', 'area'])),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table tipos_ajuste_inventario
CREATE TABLE IF NOT EXISTS inventario.tipos_ajuste_inventario (
    id                    SERIAL PRIMARY KEY,
    nombre                VARCHAR(50) NOT NULL UNIQUE,
    descripcion           TEXT,
    afecta_costos         BOOLEAN DEFAULT TRUE,
    requiere_autorizacion BOOLEAN DEFAULT FALSE,
    activo                BOOLEAN DEFAULT TRUE,
    fecha_creacion        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table materias_primas
CREATE TABLE IF NOT EXISTS inventario.materias_primas (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    unidad_medida       VARCHAR(50) NOT NULL,
    stock_actual        NUMERIC(10, 2) DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo        NUMERIC(10, 2) DEFAULT 0 CHECK (stock_minimo >= 0),
    costo_unitario      NUMERIC(10, 2) DEFAULT 0 CHECK (costo_unitario >= 0),
    vida_util_dias      INTEGER, -- NEW: Typical shelf life in days
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_unidad_medida    INTEGER REFERENCES inventario.unidades_medida(id),
    proveedor_id        INTEGER REFERENCES inventario.proveedores(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Table conversiones_medida
CREATE TABLE IF NOT EXISTS inventario.conversiones_medida (
    id_unidad_origen    INTEGER NOT NULL REFERENCES inventario.unidades_medida(id) ON DELETE RESTRICT,
    id_unidad_destino   INTEGER NOT NULL REFERENCES inventario.unidades_medida(id) ON DELETE RESTRICT,
    factor_conversion   NUMERIC(15, 6) NOT NULL CHECK (factor_conversion > 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_unidad_origen, id_unidad_destino)
);

-- Table lotes (enhanced)
CREATE TABLE IF NOT EXISTS inventario.lotes (
    id                  SERIAL PRIMARY KEY,
    id_materia_prima    INTEGER NOT NULL REFERENCES inventario.materias_primas(id) ON DELETE RESTRICT,
    codigo_lote         VARCHAR(50) NOT NULL,
    fecha_produccion    DATE,
    fecha_caducidad     DATE NOT NULL, -- Now required
    cantidad_inicial    NUMERIC(10, 2) NOT NULL CHECK (cantidad_inicial > 0),
    cantidad_actual     NUMERIC(10, 2) NOT NULL,
    costo_unitario      NUMERIC(10, 2) NOT NULL CHECK (costo_unitario >= 0),
    ubicacion           VARCHAR(50), -- NEW: Storage location
    notas               TEXT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lote_materia_codigo UNIQUE (id_materia_prima, codigo_lote),
    CONSTRAINT ck_lotes_cantidad_actual_valida CHECK (cantidad_actual >= 0 AND cantidad_actual <= cantidad_inicial),
    CONSTRAINT ck_lotes_fecha_caducidad CHECK (fecha_caducidad >= fecha_produccion)
);

-- Table reservas_inventario (NEW)
CREATE TABLE IF NOT EXISTS inventario.reservas_inventario (
    id                  SERIAL PRIMARY KEY,
    id_materia_prima    INTEGER NOT NULL REFERENCES inventario.materias_primas(id) ON DELETE RESTRICT,
    id_reserva          INTEGER, -- Will reference main.reservas
    id_cotizacion       INTEGER, -- Will reference main.cotizaciones
    cantidad            NUMERIC(10, 2) NOT NULL CHECK (cantidad > 0),
    fecha_evento        DATE NOT NULL,
    estado              VARCHAR(20) NOT NULL CHECK (estado = ANY (ARRAY['proyectada', 'confirmada', 'consumida', 'cancelada'])),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table ordenes_compra
CREATE TABLE IF NOT EXISTS inventario.ordenes_compra (
    id                     SERIAL PRIMARY KEY,
    id_proveedor           INTEGER NOT NULL REFERENCES inventario.proveedores(id) ON DELETE RESTRICT,
    numero_orden           VARCHAR(50) NOT NULL UNIQUE,
    fecha_solicitud        DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega_esperada DATE,
    estado                 inventario.enum_ordenes_compra_estado DEFAULT 'pendiente' NOT NULL,
    total_estimado         NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (total_estimado >= 0),
    notas                  TEXT,
    id_usuario_creador     INTEGER NOT NULL, -- Referencia a usuarios.usuarios - se añadirá después
    id_usuario_autorizador INTEGER, -- Referencia a usuarios.usuarios - se añadirá después
    fecha_autorizacion     TIMESTAMP,
    activo                 BOOLEAN DEFAULT TRUE,
    fecha_creacion         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table detalle_orden_compra
CREATE TABLE IF NOT EXISTS inventario.detalle_orden_compra (
    id                  SERIAL PRIMARY KEY,
    id_orden_compra     INTEGER NOT NULL REFERENCES inventario.ordenes_compra(id) ON DELETE CASCADE,
    id_materia_prima    INTEGER NOT NULL REFERENCES inventario.materias_primas(id) ON DELETE RESTRICT,
    cantidad            NUMERIC(10, 2) NOT NULL CHECK (cantidad > 0),
    id_unidad_medida    INTEGER NOT NULL REFERENCES inventario.unidades_medida(id) ON DELETE RESTRICT,
    precio_unitario     NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal            NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    cantidad_recibida   NUMERIC(10, 2) DEFAULT 0 CHECK (cantidad_recibida >= 0),
    fecha_caducidad     DATE, -- NEW: Expected expiration date
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_detalle_orden_materia UNIQUE (id_orden_compra, id_materia_prima)
);

-- Table alertas_inventario (enhanced)
CREATE TABLE IF NOT EXISTS inventario.alertas_inventario (
    id                      SERIAL PRIMARY KEY,
    id_materia_prima        INTEGER REFERENCES inventario.materias_primas(id) ON DELETE CASCADE,
    tipo_alerta             inventario.enum_tipo_alerta NOT NULL,
    mensaje                 TEXT NOT NULL,
    fecha_alerta            TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    leida                   BOOLEAN DEFAULT FALSE,
    fecha_lectura           TIMESTAMP,
    id_usuario_destinatario INTEGER, -- Referencia a usuarios.usuarios - se añadirá después
    prioridad               INTEGER DEFAULT 3 NOT NULL, -- 1=critical, 5=low
    accion_requerida        TEXT,
    accion_tomada           TEXT,
    resuelta                BOOLEAN DEFAULT FALSE,
    fecha_resolucion        TIMESTAMP,
    id_usuario_resolucion   INTEGER, -- Who resolved it
    activo                  BOOLEAN DEFAULT TRUE,
    fecha_creacion          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Creation/Modification of tables - Schema main
-- ==========================================

-- Table cotizaciones (NEW)
CREATE TABLE IF NOT EXISTS main.cotizaciones (
    id                  SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL, -- Referencia a usuarios.usuarios - se añadirá después
    codigo_seguimiento  VARCHAR(10) UNIQUE NOT NULL, -- Unique tracking PIN
    id_paquete          INTEGER NOT NULL, -- Will reference paquetes
    id_opcion_alimento  INTEGER, -- Will reference opciones_alimentos
    id_mampara          INTEGER, -- Will reference mamparas
    id_tematica         INTEGER, -- Will reference tematicas
    fecha_evento        DATE NOT NULL,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    nombre_festejado    VARCHAR(100),
    edad_festejado      INTEGER CHECK (edad_festejado > 0),
    comentarios         TEXT,
    total               NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    estado              main.enum_cotizaciones_estado DEFAULT 'creada' NOT NULL,
    fecha_expiracion    TIMESTAMP NOT NULL, -- Auto-expires after this date
    fecha_confirmacion  TIMESTAMP,
    ip_cliente          VARCHAR(45),
    agente_usuario      TEXT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horario_valido CHECK (hora_fin > hora_inicio)
);

-- Table cotizacion_extras (NEW)
CREATE TABLE IF NOT EXISTS main.cotizacion_extras (
    id_cotizacion       INTEGER NOT NULL REFERENCES main.cotizaciones(id) ON DELETE CASCADE,
    id_extra            INTEGER NOT NULL, -- Will reference extras
    cantidad            INTEGER DEFAULT 1 NOT NULL CHECK (cantidad > 0),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cotizacion, id_extra)
);

-- Table paquetes_alimentos
CREATE TABLE IF NOT EXISTS main.paquetes_alimentos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

-- Table extras
CREATE TABLE IF NOT EXISTS main.extras (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio              NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table tematicas
CREATE TABLE IF NOT EXISTS main.tematicas (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    foto                VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table paquetes
CREATE TABLE IF NOT EXISTS main.paquetes (
    id                     SERIAL PRIMARY KEY,
    nombre                 VARCHAR(100) NOT NULL,
    descripcion            TEXT,
    precio_lunes_jueves    NUMERIC(10, 2) NOT NULL CHECK (precio_lunes_jueves >= 0),
    precio_viernes_domingo NUMERIC(10, 2) NOT NULL CHECK (precio_viernes_domingo >= 0),
    id_paquete_alimento    INTEGER REFERENCES main.paquetes_alimentos(id),
    activo                 BOOLEAN DEFAULT TRUE,
    fecha_creacion         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table mamparas
CREATE TABLE IF NOT EXISTS main.mamparas (
    id                  SERIAL PRIMARY KEY,
    id_tematica         INTEGER NOT NULL REFERENCES main.tematicas(id) ON DELETE RESTRICT,
    piezas              INTEGER NOT NULL CHECK (piezas > 0),
    precio              NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    foto                VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table opciones_alimentos (enhanced)
CREATE TABLE IF NOT EXISTS main.opciones_alimentos (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio_extra        NUMERIC(10, 2) NOT NULL CHECK (precio_extra >= 0),
    disponible          BOOLEAN DEFAULT TRUE,
    turno               main.enum_turno DEFAULT 'ambos',
    platillo_adulto     VARCHAR(100) NOT NULL,
    platillo_nino       VARCHAR(100) NOT NULL,
    opcion_papas        BOOLEAN DEFAULT FALSE,
    precio_papas        NUMERIC(10, 2) DEFAULT 19.00 CHECK (precio_papas >= 0),
    precio_adulto       NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio_adulto >= 0),
    precio_nino         NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio_nino >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_materia_prima    INTEGER, -- Referencia a inventario.materias_primas - se añadirá después
    cantidad            NUMERIC(10, 2) DEFAULT 1
);

-- Table reservas (enhanced)
CREATE TABLE IF NOT EXISTS main.reservas (
    id                  SERIAL PRIMARY KEY,
    id_cotizacion       INTEGER REFERENCES main.cotizaciones(id), -- NEW: From which quote
    id_usuario          INTEGER NOT NULL, -- Referencia a usuarios.usuarios - se añadirá después
    id_paquete          INTEGER NOT NULL REFERENCES main.paquetes(id),
    id_opcion_alimento  INTEGER REFERENCES main.opciones_alimentos(id),
    id_mampara          INTEGER NOT NULL REFERENCES main.mamparas(id),
    id_tematica         INTEGER NOT NULL REFERENCES main.tematicas(id),
    fecha_reserva       DATE NOT NULL,
    estado              main.enum_reservas_estado DEFAULT 'pendiente' NOT NULL,
    total               NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    nombre_festejado    VARCHAR(100) NOT NULL,
    edad_festejado      INTEGER NOT NULL CHECK (edad_festejado > 0),
    comentarios         TEXT,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    codigo_seguimiento  VARCHAR(10) UNIQUE NOT NULL, -- NEW: Tracking code
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horario_valido CHECK (hora_fin > hora_inicio)
);

-- Table reserva_extras
CREATE TABLE IF NOT EXISTS main.reserva_extras (
    id_reserva          INTEGER NOT NULL REFERENCES main.reservas(id) ON DELETE CASCADE,
    id_extra            INTEGER NOT NULL REFERENCES main.extras(id) ON DELETE CASCADE,
    cantidad            INTEGER DEFAULT 1 NOT NULL CHECK (cantidad > 0),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_reserva, id_extra)
);

-- Table notificaciones (NEW)
CREATE TABLE IF NOT EXISTS main.notificaciones (
    id                  SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL, -- Will reference usuarios
    id_cotizacion       INTEGER REFERENCES main.cotizaciones(id),
    id_reserva          INTEGER REFERENCES main.reservas(id),
    tipo                main.enum_notificaciones_tipo NOT NULL,
    titulo              VARCHAR(255) NOT NULL,
    mensaje             TEXT NOT NULL,
    fecha_envio         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado              main.enum_notificaciones_estado DEFAULT 'enviada',
    fecha_lectura       TIMESTAMP,
    metodo_envio        VARCHAR(20) NOT NULL, -- email, sms, push, etc.
    datos_envio         JSONB, -- Details about the notification
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table recetas_insumos
CREATE TABLE IF NOT EXISTS main.recetas_insumos (
    id_opcion_alimento  INTEGER NOT NULL REFERENCES main.opciones_alimentos(id) ON DELETE CASCADE,
    id_materia_prima    INTEGER NOT NULL, -- Referencia a inventario.materias_primas - se añadirá después
    cantidad_requerida  NUMERIC(10, 3) NOT NULL CHECK (cantidad_requerida > 0),
    id_unidad_medida    INTEGER NOT NULL, -- Referencia a inventario.unidades_medida - se añadirá después
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_opcion_alimento, id_materia_prima)
);

-- Table movimientos_inventario
CREATE TABLE IF NOT EXISTS inventario.movimientos_inventario (
    id               SERIAL PRIMARY KEY,
    id_materia_prima INTEGER NOT NULL REFERENCES inventario.materias_primas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_lote          INTEGER REFERENCES inventario.lotes(id) ON DELETE RESTRICT,
    id_proveedor     INTEGER REFERENCES inventario.proveedores(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_reserva       INTEGER, -- Referencia a main.reservas - se añadirá después
    id_cotizacion    INTEGER, -- NEW: Reference to cotizaciones
    tipo_movimiento  VARCHAR(20) NOT NULL CHECK (tipo_movimiento = ANY (ARRAY['entrada', 'salida', 'ajuste'])),
    cantidad         NUMERIC(10, 2) NOT NULL CHECK (cantidad <> 0),
    fecha            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion      TEXT,
    id_usuario       INTEGER NOT NULL, -- Referencia a usuarios.usuarios - se añadirá después
    id_tipo_ajuste   INTEGER REFERENCES inventario.tipos_ajuste_inventario(id),
    id_orden_compra  INTEGER REFERENCES inventario.ordenes_compra(id) ON DELETE RESTRICT
);

-- ==========================================
-- Add references between schemas
-- ==========================================

-- Add references to usuarios tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_tokens_usuario'
    ) THEN
        ALTER TABLE seguridad.tokens
            ADD CONSTRAINT fk_tokens_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_usuario_roles_usuario'
    ) THEN
        ALTER TABLE seguridad.usuario_roles
            ADD CONSTRAINT fk_usuario_roles_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_registro_auditoria_token'
    ) THEN
        ALTER TABLE usuarios.registro_auditoria
            ADD CONSTRAINT fk_registro_auditoria_token
            FOREIGN KEY (id_token) REFERENCES seguridad.tokens(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_reservas_usuario'
    ) THEN
        ALTER TABLE main.reservas
            ADD CONSTRAINT fk_reservas_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cotizaciones_usuario'
    ) THEN
        ALTER TABLE main.cotizaciones
            ADD CONSTRAINT fk_cotizaciones_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_ordenes_compra_usuario_creador'
    ) THEN
        ALTER TABLE inventario.ordenes_compra
            ADD CONSTRAINT fk_ordenes_compra_usuario_creador
            FOREIGN KEY (id_usuario_creador) REFERENCES usuarios.usuarios(id) ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_ordenes_compra_usuario_autorizador'
    ) THEN
        ALTER TABLE inventario.ordenes_compra
            ADD CONSTRAINT fk_ordenes_compra_usuario_autorizador
            FOREIGN KEY (id_usuario_autorizador) REFERENCES usuarios.usuarios(id) ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_alertas_inventario_usuario'
    ) THEN
        ALTER TABLE inventario.alertas_inventario
            ADD CONSTRAINT fk_alertas_inventario_usuario
            FOREIGN KEY (id_usuario_destinatario) REFERENCES usuarios.usuarios(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_alertas_inventario_usuario_resolucion'
    ) THEN
        ALTER TABLE inventario.alertas_inventario
            ADD CONSTRAINT fk_alertas_inventario_usuario_resolucion
            FOREIGN KEY (id_usuario_resolucion) REFERENCES usuarios.usuarios(id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_movimientos_inventario_usuario'
    ) THEN
        ALTER TABLE inventario.movimientos_inventario
            ADD CONSTRAINT fk_movimientos_inventario_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_finanzas_usuario'
    ) THEN
        ALTER TABLE finanzas.finanzas
            ADD CONSTRAINT fk_finanzas_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_pagos_usuario'
    ) THEN
        ALTER TABLE finanzas.pagos
            ADD CONSTRAINT fk_pagos_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_reembolsos_usuario'
    ) THEN
        ALTER TABLE finanzas.reembolsos
            ADD CONSTRAINT fk_reembolsos_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_notificaciones_usuario'
    ) THEN
        ALTER TABLE main.notificaciones
            ADD CONSTRAINT fk_notificaciones_usuario
            FOREIGN KEY (id_usuario) REFERENCES usuarios.usuarios(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add references to tables in main with existence verification
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_finanzas_reserva'
    ) THEN
        ALTER TABLE finanzas.finanzas
            ADD CONSTRAINT fk_finanzas_reserva
            FOREIGN KEY (id_reserva) REFERENCES main.reservas(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_finanzas_cotizacion'
    ) THEN
        ALTER TABLE finanzas.finanzas
            ADD CONSTRAINT fk_finanzas_cotizacion
            FOREIGN KEY (id_cotizacion) REFERENCES main.cotizaciones(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_pagos_reserva'
    ) THEN
        ALTER TABLE finanzas.pagos
            ADD CONSTRAINT fk_pagos_reserva
            FOREIGN KEY (id_reserva) REFERENCES main.reservas(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_pagos_cotizacion'
    ) THEN
        ALTER TABLE finanzas.pagos
            ADD CONSTRAINT fk_pagos_cotizacion
            FOREIGN KEY (id_cotizacion) REFERENCES main.cotizaciones(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_movimientos_inventario_reserva'
    ) THEN
        ALTER TABLE inventario.movimientos_inventario
            ADD CONSTRAINT fk_movimientos_inventario_reserva
            FOREIGN KEY (id_reserva) REFERENCES main.reservas(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_movimientos_inventario_cotizacion'
    ) THEN
        ALTER TABLE inventario.movimientos_inventario
            ADD CONSTRAINT fk_movimientos_inventario_cotizacion
            FOREIGN KEY (id_cotizacion) REFERENCES main.cotizaciones(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_reservas_inventario_reserva'
    ) THEN
        ALTER TABLE inventario.reservas_inventario
            ADD CONSTRAINT fk_reservas_inventario_reserva
            FOREIGN KEY (id_reserva) REFERENCES main.reservas(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_reservas_inventario_cotizacion'
    ) THEN
        ALTER TABLE inventario.reservas_inventario
            ADD CONSTRAINT fk_reservas_inventario_cotizacion
            FOREIGN KEY (id_cotizacion) REFERENCES main.cotizaciones(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cotizacion_extras_extra'
    ) THEN
        ALTER TABLE main.cotizacion_extras
            ADD CONSTRAINT fk_cotizacion_extras_extra
            FOREIGN KEY (id_extra) REFERENCES main.extras(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cotizaciones_paquete'
    ) THEN
        ALTER TABLE main.cotizaciones
            ADD CONSTRAINT fk_cotizaciones_paquete
            FOREIGN KEY (id_paquete) REFERENCES main.paquetes(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cotizaciones_opcion_alimento'
    ) THEN
        ALTER TABLE main.cotizaciones
            ADD CONSTRAINT fk_cotizaciones_opcion_alimento
            FOREIGN KEY (id_opcion_alimento) REFERENCES main.opciones_alimentos(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cotizaciones_mampara'
    ) THEN
        ALTER TABLE main.cotizaciones
            ADD CONSTRAINT fk_cotizaciones_mampara
            FOREIGN KEY (id_mampara) REFERENCES main.mamparas(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cotizaciones_tematica'
    ) THEN
        ALTER TABLE main.cotizaciones
            ADD CONSTRAINT fk_cotizaciones_tematica
            FOREIGN KEY (id_tematica) REFERENCES main.tematicas(id);
    END IF;
END $$;

-- Add references to tables in inventario
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_opciones_alimentos_materia_prima'
    ) THEN
        ALTER TABLE main.opciones_alimentos
            ADD CONSTRAINT fk_opciones_alimentos_materia_prima
            FOREIGN KEY (id_materia_prima) REFERENCES inventario.materias_primas(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_recetas_insumos_materia_prima'
    ) THEN
        ALTER TABLE main.recetas_insumos
            ADD CONSTRAINT fk_recetas_insumos_materia_prima
            FOREIGN KEY (id_materia_prima) REFERENCES inventario.materias_primas(id) ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_recetas_insumos_unidad_medida'
    ) THEN
        ALTER TABLE main.recetas_insumos
            ADD CONSTRAINT fk_recetas_insumos_unidad_medida
            FOREIGN KEY (id_unidad_medida) REFERENCES inventario.unidades_medida(id) ON DELETE RESTRICT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_finanzas_materia_prima'
    ) THEN
        ALTER TABLE finanzas.finanzas
            ADD CONSTRAINT fk_finanzas_materia_prima
            FOREIGN KEY (id_materia_prima) REFERENCES inventario.materias_primas(id);
    END IF;
END $$;

-- Self-references for refunds
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_finanzas_reembolso'
    ) THEN
        ALTER TABLE finanzas.finanzas
            ADD CONSTRAINT fk_finanzas_reembolso
            FOREIGN KEY (id_reembolso) REFERENCES finanzas.finanzas(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_finanzas_pago'
    ) THEN
        ALTER TABLE finanzas.finanzas
            ADD CONSTRAINT fk_finanzas_pago
            FOREIGN KEY (id_pago) REFERENCES finanzas.pagos(id);
    END IF;
END $$;

-- ==========================================
-- Create indexes
-- ==========================================

-- Schema seguridad
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'seguridad' AND tablename = 'tokens' AND indexname = 'idx_tokens_usuario')
    THEN CREATE INDEX idx_tokens_usuario ON seguridad.tokens (id_usuario); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'seguridad' AND tablename = 'tokens' AND indexname = 'idx_tokens_estado')
    THEN CREATE INDEX idx_tokens_estado ON seguridad.tokens (estado); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'seguridad' AND tablename = 'tokens' AND indexname = 'idx_tokens_expiracion')
    THEN CREATE INDEX idx_tokens_expiracion ON seguridad.tokens (fecha_expiracion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'seguridad' AND tablename = 'usuario_roles' AND indexname = 'idx_usuario_roles_usuario')
    THEN CREATE INDEX idx_usuario_roles_usuario ON seguridad.usuario_roles (id_usuario); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'seguridad' AND tablename = 'usuario_roles' AND indexname = 'idx_usuario_roles_rol')
    THEN CREATE INDEX idx_usuario_roles_rol ON seguridad.usuario_roles (id_rol); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'seguridad' AND tablename = 'rol_permisos' AND indexname = 'idx_rol_permisos_rol')
    THEN CREATE INDEX idx_rol_permisos_rol ON seguridad.rol_permisos (id_rol); END IF;
END $$;

-- Schema main
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'cotizaciones' AND indexname = 'idx_cotizaciones_usuario')
    THEN CREATE INDEX idx_cotizaciones_usuario ON main.cotizaciones (id_usuario); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'cotizaciones' AND indexname = 'idx_cotizaciones_codigo')
    THEN CREATE INDEX idx_cotizaciones_codigo ON main.cotizaciones (codigo_seguimiento); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'cotizaciones' AND indexname = 'idx_cotizaciones_fecha')
    THEN CREATE INDEX idx_cotizaciones_fecha ON main.cotizaciones (fecha_evento); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'cotizaciones' AND indexname = 'idx_cotizaciones_estado')
    THEN CREATE INDEX idx_cotizaciones_estado ON main.cotizaciones (estado); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'cotizaciones' AND indexname = 'idx_cotizaciones_expiracion')
    THEN CREATE INDEX idx_cotizaciones_expiracion ON main.cotizaciones (fecha_expiracion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'reservas' AND indexname = 'idx_reservas_codigo')
    THEN CREATE INDEX idx_reservas_codigo ON main.reservas (codigo_seguimiento); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'reservas' AND indexname = 'idx_reservas_cotizacion')
    THEN CREATE INDEX idx_reservas_cotizacion ON main.reservas (id_cotizacion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'cotizacion_extras' AND indexname = 'idx_cotizacion_extras_cotizacion')
    THEN CREATE INDEX idx_cotizacion_extras_cotizacion ON main.cotizacion_extras (id_cotizacion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'notificaciones' AND indexname = 'idx_notificaciones_usuario')
    THEN CREATE INDEX idx_notificaciones_usuario ON main.notificaciones (id_usuario); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'notificaciones' AND indexname = 'idx_notificaciones_cotizacion')
    THEN CREATE INDEX idx_notificaciones_cotizacion ON main.notificaciones (id_cotizacion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'notificaciones' AND indexname = 'idx_notificaciones_reserva')
    THEN CREATE INDEX idx_notificaciones_reserva ON main.notificaciones (id_reserva); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'main' AND tablename = 'notificaciones' AND indexname = 'idx_notificaciones_estado')
    THEN CREATE INDEX idx_notificaciones_estado ON main.notificaciones (estado); END IF;

    -- Existing main schema indexes...
END $$;

-- Schema finanzas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'finanzas' AND tablename = 'finanzas' AND indexname = 'idx_finanzas_cotizacion')
    THEN CREATE INDEX idx_finanzas_cotizacion ON finanzas.finanzas (id_cotizacion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'finanzas' AND tablename = 'finanzas' AND indexname = 'idx_finanzas_pago')
    THEN CREATE INDEX idx_finanzas_pago ON finanzas.finanzas (id_pago); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'finanzas' AND tablename = 'finanzas' AND indexname = 'idx_finanzas_reembolso')
    THEN CREATE INDEX idx_finanzas_reembolso ON finanzas.finanzas (id_reembolso); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'finanzas' AND tablename = 'finanzas' AND indexname = 'idx_finanzas_transaccion')
    THEN CREATE INDEX idx_finanzas_transaccion ON finanzas.finanzas (id_transaccion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'finanzas' AND tablename = 'pagos' AND indexname = 'idx_pagos_cotizacion')
    THEN CREATE INDEX idx_pagos_cotizacion ON finanzas.pagos (id_cotizacion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'finanzas' AND tablename = 'pagos' AND indexname = 'idx_pagos_transaccion')
    THEN CREATE INDEX idx_pagos_transaccion ON finanzas.pagos (id_transaccion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'finanzas' AND tablename = 'reembolsos' AND indexname = 'idx_reembolsos_pago')
    THEN CREATE INDEX idx_reembolsos_pago ON finanzas.reembolsos (id_pago); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'finanzas' AND tablename = 'reembolsos' AND indexname = 'idx_reembolsos_transaccion')
    THEN CREATE INDEX idx_reembolsos_transaccion ON finanzas.reembolsos (id_transaccion); END IF;

    -- Existing finanzas schema indexes...
END $$;

-- Schema inventario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND tablename = 'reservas_inventario' AND indexname = 'idx_reservas_inventario_materia')
    THEN CREATE INDEX idx_reservas_inventario_materia ON inventario.reservas_inventario (id_materia_prima); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND tablename = 'reservas_inventario' AND indexname = 'idx_reservas_inventario_reserva')
    THEN CREATE INDEX idx_reservas_inventario_reserva ON inventario.reservas_inventario (id_reserva); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND tablename = 'reservas_inventario' AND indexname = 'idx_reservas_inventario_cotizacion')
    THEN CREATE INDEX idx_reservas_inventario_cotizacion ON inventario.reservas_inventario (id_cotizacion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND tablename = 'reservas_inventario' AND indexname = 'idx_reservas_inventario_fecha')
    THEN CREATE INDEX idx_reservas_inventario_fecha ON inventario.reservas_inventario (fecha_evento); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND tablename = 'reservas_inventario' AND indexname = 'idx_reservas_inventario_estado')
    THEN CREATE INDEX idx_reservas_inventario_estado ON inventario.reservas_inventario (estado); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND tablename = 'movimientos_inventario' AND indexname = 'idx_movimientos_inventario_cotizacion')
    THEN CREATE INDEX idx_movimientos_inventario_cotizacion ON inventario.movimientos_inventario (id_cotizacion); END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'inventario' AND tablename = 'movimientos_inventario' AND indexname = 'idx_movimientos_inventario_lote')
    THEN CREATE INDEX idx_movimientos_inventario_lote ON inventario.movimientos_inventario (id_lote); END IF;

    -- Existing inventario schema indexes...
END $$;

-- ==========================================
-- Creation of views
-- ==========================================

-- Vista vw_disponibilidad_inventario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'inventario' AND viewname = 'vw_disponibilidad_inventario') THEN
        CREATE OR REPLACE VIEW inventario.vw_disponibilidad_inventario AS
        WITH reservas_futuras AS (
            SELECT
                mp.id AS id_materia_prima,
                mp.nombre,
                SUM(CASE
                    WHEN ri.estado = 'confirmada' THEN ri.cantidad
                    WHEN ri.estado = 'proyectada' THEN ri.cantidad * 0.8 -- Probabilistic estimation
                    ELSE 0
                END) AS cantidad_reservada,
                ri.fecha_evento
            FROM inventario.reservas_inventario ri
            JOIN inventario.materias_primas mp ON ri.id_materia_prima = mp.id
            WHERE ri.estado IN ('proyectada', 'confirmada')
            GROUP BY mp.id, mp.nombre, ri.fecha_evento
        ),
        stock_por_lote AS (
            SELECT
                l.id_materia_prima,
                mp.nombre,
                SUM(l.cantidad_actual) AS stock_actual,
                MIN(l.fecha_caducidad) AS proxima_caducidad
            FROM inventario.lotes l
            JOIN inventario.materias_primas mp ON l.id_materia_prima = mp.id
            WHERE l.cantidad_actual > 0
            GROUP BY l.id_materia_prima, mp.nombre
        )
        SELECT
            mp.id AS id_materia_prima,
            mp.nombre,
            mp.unidad_medida,
            COALESCE(spl.stock_actual, 0) AS stock_actual_lotes,
            mp.stock_actual AS stock_actual_sistema,
            mp.stock_minimo,
            fecha_calculo.fecha,
            COALESCE(rf.cantidad_reservada, 0) AS cantidad_reservada,
            COALESCE(spl.stock_actual, 0) - COALESCE(rf.cantidad_reservada, 0) AS disponibilidad_proyectada,
            CASE
                WHEN COALESCE(spl.stock_actual, 0) - COALESCE(rf.cantidad_reservada, 0) <= 0 THEN 'Sin disponibilidad'
                WHEN COALESCE(spl.stock_actual, 0) - COALESCE(rf.cantidad_reservada, 0) < mp.stock_minimo THEN 'Disponibilidad limitada'
                ELSE 'Disponible'
            END AS estado_disponibilidad,
            spl.proxima_caducidad
        FROM inventario.materias_primas mp
        LEFT JOIN reservas_futuras rf ON mp.id = rf.id_materia_prima
        LEFT JOIN stock_por_lote spl ON mp.id = spl.id_materia_prima
        CROSS JOIN (SELECT CURRENT_DATE AS fecha) fecha_calculo
        WHERE mp.activo = true
        ORDER BY mp.nombre, rf.fecha_evento;
    END IF;
END $$;

-- Vista vw_proyeccion_inventario (by date)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'inventario' AND viewname = 'vw_proyeccion_inventario') THEN
        CREATE OR REPLACE VIEW inventario.vw_proyeccion_inventario AS
        WITH fecha_proyeccion AS (
            SELECT generate_series(
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '90 days',
                INTERVAL '1 day'
            )::DATE AS fecha
        ),
        reservas_por_fecha AS (
            SELECT
                id_materia_prima,
                fecha_evento,
                SUM(CASE
                    WHEN estado = 'confirmada' THEN cantidad
                    WHEN estado = 'proyectada' THEN cantidad * 0.8
                    ELSE 0
                END) AS cantidad_reservada
            FROM inventario.reservas_inventario
            WHERE estado IN ('proyectada', 'confirmada')
            GROUP BY id_materia_prima, fecha_evento
        ),
        stock_inicial AS (
            SELECT
                mp.id AS id_materia_prima,
                mp.nombre,
                mp.unidad_medida,
                mp.stock_actual,
                mp.stock_minimo
            FROM inventario.materias_primas mp
            WHERE mp.activo = true
        )
        SELECT
            si.id_materia_prima,
            si.nombre,
            si.unidad_medida,
            fp.fecha,
            si.stock_actual AS stock_inicial,
            si.stock_minimo,
            COALESCE(SUM(rpf.cantidad_reservada) FILTER (
                WHERE rpf.fecha_evento <= fp.fecha
            ) OVER (
                PARTITION BY si.id_materia_prima
                ORDER BY fp.fecha
            ), 0) AS consumo_acumulado,
            si.stock_actual - COALESCE(SUM(rpf.cantidad_reservada) FILTER (
                WHERE rpf.fecha_evento <= fp.fecha
            ) OVER (
                PARTITION BY si.id_materia_prima
                ORDER BY fp.fecha
            ), 0) AS stock_proyectado,
            CASE
                WHEN si.stock_actual - COALESCE(SUM(rpf.cantidad_reservada) FILTER (
                    WHERE rpf.fecha_evento <= fp.fecha
                ) OVER (
                    PARTITION BY si.id_materia_prima
                    ORDER BY fp.fecha
                ), 0) <= 0 THEN 'Sin stock'
                WHEN si.stock_actual - COALESCE(SUM(rpf.cantidad_reservada) FILTER (
                    WHERE rpf.fecha_evento <= fp.fecha
                ) OVER (
                    PARTITION BY si.id_materia_prima
                    ORDER BY fp.fecha
                ), 0) < si.stock_minimo THEN 'Stock bajo'
                ELSE 'Stock adecuado'
            END AS estado_stock
        FROM stock_inicial si
        CROSS JOIN fecha_proyeccion fp
        LEFT JOIN reservas_por_fecha rpf ON si.id_materia_prima = rpf.id_materia_prima
        ORDER BY si.nombre, fp.fecha;
    END IF;
END $$;

-- Vista vw_lotes_por_caducidad (FIFO)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'inventario' AND viewname = 'vw_lotes_por_caducidad') THEN
        CREATE OR REPLACE VIEW inventario.vw_lotes_por_caducidad AS
        SELECT
            l.id,
            l.id_materia_prima,
            mp.nombre AS materia_prima,
            l.codigo_lote,
            l.fecha_produccion,
            l.fecha_caducidad,
            l.cantidad_inicial,
            l.cantidad_actual,
            um.abreviatura AS unidad,
            l.costo_unitario,
            l.ubicacion,
            CASE
                WHEN l.fecha_caducidad < CURRENT_DATE THEN 'Caducado'
                WHEN l.fecha_caducidad <= CURRENT_DATE + INTERVAL '7 days' THEN 'Próximo a caducar'
                WHEN l.fecha_caducidad <= CURRENT_DATE + INTERVAL '30 days' THEN 'Vence pronto'
                ELSE 'Vigente'
            END AS estado_caducidad,
            CASE
                WHEN l.fecha_caducidad < CURRENT_DATE THEN 1
                WHEN l.fecha_caducidad <= CURRENT_DATE + INTERVAL '7 days' THEN 2
                WHEN l.fecha_caducidad <= CURRENT_DATE + INTERVAL '30 days' THEN 3
                ELSE 4
            END AS prioridad_consumo
        FROM inventario.lotes l
        JOIN inventario.materias_primas mp ON l.id_materia_prima = mp.id
        LEFT JOIN inventario.unidades_medida um ON mp.id_unidad_medida = um.id
        WHERE l.cantidad_actual > 0
        ORDER BY l.id_materia_prima, prioridad_consumo, l.fecha_caducidad;
    END IF;
END $$;

-- Vista vw_cotizaciones_disponibilidad
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'main' AND viewname = 'vw_cotizaciones_disponibilidad') THEN
        CREATE OR REPLACE VIEW main.vw_cotizaciones_disponibilidad AS
        SELECT
            c.id,
            c.codigo_seguimiento,
            c.id_usuario,
            u.nombre AS nombre_usuario,
            c.fecha_evento,
            c.hora_inicio,
            c.hora_fin,
            c.estado,
            c.fecha_expiracion,
            CASE
                WHEN c.fecha_expiracion < CURRENT_TIMESTAMP THEN 'Expirada'
                WHEN dispo.disponibilidad_horario = false THEN 'Horario no disponible'
                WHEN dispo.disponibilidad_inventario = false THEN 'Inventario insuficiente'
                ELSE 'Disponible'
            END AS estado_disponibilidad,
            dispo.disponibilidad_horario,
            dispo.disponibilidad_inventario,
            c.total,
            c.fecha_creacion
        FROM main.cotizaciones c
        JOIN usuarios.usuarios u ON c.id_usuario = u.id
        LEFT JOIN LATERAL (
            SELECT
                -- Check if the time slot is available
                NOT EXISTS (
                    SELECT 1
                    FROM main.reservas r
                    WHERE r.fecha_reserva = c.fecha_evento
                    AND r.estado = 'confirmada'
                    AND (
                        (r.hora_inicio <= c.hora_inicio AND r.hora_fin > c.hora_inicio) OR
                        (r.hora_inicio < c.hora_fin AND r.hora_fin >= c.hora_fin) OR
                        (r.hora_inicio >= c.hora_inicio AND r.hora_fin <= c.hora_fin)
                    )
                ) AS disponibilidad_horario,

                -- Check if the inventory will be available
                NOT EXISTS (
                    SELECT 1
                    FROM inventario.reservas_inventario ri
                    JOIN inventario.materias_primas mp ON ri.id_materia_prima = mp.id
                    WHERE ri.fecha_evento = c.fecha_evento
                    AND ri.estado IN ('proyectada', 'confirmada')
                    GROUP BY ri.id_materia_prima, mp.stock_actual, mp.stock_minimo
                    HAVING SUM(ri.cantidad) > mp.stock_actual
                ) AS disponibilidad_inventario
        ) AS dispo ON true
        WHERE c.activo = true;
    END IF;
END $$;

-- Vista vw_pagos_transacciones
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'finanzas' AND viewname = 'vw_pagos_transacciones') THEN
        CREATE OR REPLACE VIEW finanzas.vw_pagos_transacciones AS
        SELECT
            p.id,
            p.id_reserva,
            p.id_cotizacion,
            r.codigo_seguimiento AS codigo_reserva,
            c.codigo_seguimiento AS codigo_cotizacion,
            p.monto,
            p.fecha_pago,
            p.estado,
            p.metodo_pago,
            p.referencia_pago,
            p.id_transaccion,
            u.nombre AS procesado_por,
            COALESCE(SUM(ref.monto_reembolso), 0) AS monto_reembolsado,
            CASE
                WHEN p.estado = 'completado' AND COALESCE(SUM(ref.monto_reembolso), 0) = 0 THEN 'Completado'
                WHEN p.estado = 'completado' AND COALESCE(SUM(ref.monto_reembolso), 0) > 0 AND COALESCE(SUM(ref.monto_reembolso), 0) < p.monto THEN 'Reembolso parcial'
                WHEN p.estado = 'completado' AND COALESCE(SUM(ref.monto_reembolso), 0) = p.monto THEN 'Reembolsado total'
                WHEN p.estado = 'pendiente' THEN 'Pendiente'
                WHEN p.estado = 'fallido' THEN 'Fallido'
                ELSE p.estado::text
            END AS estado_completo,
            p.fecha_creacion,
            p.fecha_actualizacion
        FROM finanzas.pagos p
        LEFT JOIN main.reservas r ON p.id_reserva = r.id
        LEFT JOIN main.cotizaciones c ON p.id_cotizacion = c.id
        LEFT JOIN usuarios.usuarios u ON p.id_usuario = u.id
        LEFT JOIN finanzas.reembolsos ref ON p.id = ref.id_pago AND ref.estado IN ('completado', 'pendiente')
        GROUP BY
            p.id,
            p.id_reserva,
            p.id_cotizacion,
            r.codigo_seguimiento,
            c.codigo_seguimiento,
            p.monto,
            p.fecha_pago,
            p.estado,
            p.metodo_pago,
            p.referencia_pago,
            p.id_transaccion,
            u.nombre,
            p.fecha_creacion,
            p.fecha_actualizacion;
    END IF;
END $$;

-- Vista vw_reporte_financiero
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'finanzas' AND viewname = 'vw_reporte_financiero') THEN
        CREATE OR REPLACE VIEW finanzas.vw_reporte_financiero AS
        SELECT
            f.id,
            f.tipo,
            f.monto,
            f.fecha,
            f.descripcion,
            c.nombre AS categoria,
            f.id_reserva,
            f.id_cotizacion,
            r.codigo_seguimiento AS codigo_reserva,
            cot.codigo_seguimiento AS codigo_cotizacion,
            u.nombre AS usuario,
            p.id AS id_pago,
            p.metodo_pago,
            p.id_transaccion,
            f.id_reembolso,
            (SELECT fr.id_transaccion FROM finanzas.finanzas fr WHERE fr.id = f.id_reembolso) AS transaccion_reembolso,
            f.fecha_creacion
        FROM finanzas.finanzas f
        LEFT JOIN finanzas.categorias c ON f.id_categoria = c.id
        LEFT JOIN main.reservas r ON f.id_reserva = r.id
        LEFT JOIN main.cotizaciones cot ON f.id_cotizacion = cot.id
        LEFT JOIN usuarios.usuarios u ON f.id_usuario = u.id
        LEFT JOIN finanzas.pagos p ON f.id_pago = p.id
        WHERE f.activo = true
        ORDER BY f.fecha DESC;
    END IF;
END $$;

-- View for audit report
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'usuarios' AND viewname = 'vw_reporte_auditoria') THEN
        CREATE OR REPLACE VIEW usuarios.vw_reporte_auditoria AS
        SELECT
            ra.id,
            ra.nombre_tabla,
            ra.tipo_operacion,
            ra.id_usuario,
            u.nombre AS usuario,
            ra.fecha_operacion,
            ra.direccion_ip,
            ra.agente_usuario,
            t.token_jti,
            t.estado AS estado_token,
            ra.datos_anteriores,
            ra.datos_nuevos
        FROM usuarios.registro_auditoria ra
        LEFT JOIN usuarios.usuarios u ON ra.id_usuario = u.id
        LEFT JOIN seguridad.tokens t ON ra.id_token = t.id
        ORDER BY ra.fecha_operacion DESC;
    END IF;
END $$;

-- View for notifications report
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'main' AND viewname = 'vw_reporte_notificaciones') THEN
        CREATE OR REPLACE VIEW main.vw_reporte_notificaciones AS
        SELECT
            n.id,
            n.id_usuario,
            u.nombre AS usuario,
            u.email,
            n.tipo,
            n.titulo,
            n.mensaje,
            n.fecha_envio,
            n.estado,
            n.fecha_lectura,
            n.metodo_envio,
            n.id_cotizacion,
            n.id_reserva,
            c.codigo_seguimiento AS codigo_cotizacion,
            r.codigo_seguimiento AS codigo_reserva,
            n.fecha_creacion
        FROM main.notificaciones n
        JOIN usuarios.usuarios u ON n.id_usuario = u.id
        LEFT JOIN main.cotizaciones c ON n.id_cotizacion = c.id
        LEFT JOIN main.reservas r ON n.id_reserva = r.id
        ORDER BY n.fecha_envio DESC;
    END IF;
END $$;

-- ==========================================
-- Creation of functions for the new system
-- ==========================================

-- Function to create a tracking PIN
CREATE OR REPLACE FUNCTION main.generar_codigo_seguimiento()
RETURNS VARCHAR(10)
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Avoiding similar looking characters
    result VARCHAR(10) := '';
    i INTEGER;
    position INTEGER;
BEGIN
    -- Generate a 6-character random code
    FOR i IN 1..6 LOOP
        position := 1 + CAST(RANDOM() * (LENGTH(chars) - 1) AS INTEGER);
        result := result || SUBSTRING(chars FROM position FOR 1);
    END LOOP;

    -- Add timestamp component for uniqueness (last 4 chars)
    result := result || TO_CHAR(CURRENT_TIMESTAMP, 'MMSS');

    RETURN result;
END;
$$;

-- Function to handle JWT token validation
CREATE OR REPLACE FUNCTION seguridad.validar_token(token_jti VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    token_valid BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM seguridad.tokens
        WHERE token_jti = validar_token.token_jti
        AND estado = 'activo'
        AND fecha_expiracion > CURRENT_TIMESTAMP
    ) INTO token_valid;

    RETURN token_valid;
END;
$$;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION seguridad.verificar_permiso(
    p_id_usuario INTEGER,
    p_permiso VARCHAR,
    p_nivel seguridad.enum_permisos_nivel DEFAULT 'lectura'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    has_permission BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM seguridad.usuario_roles ur
        JOIN seguridad.rol_permisos rp ON ur.id_rol = rp.id_rol
        JOIN seguridad.permisos p ON rp.id_permiso = p.id
        WHERE ur.id_usuario = p_id_usuario
        AND p.nombre = p_permiso
        AND ur.activo = true
        AND CASE
            WHEN p_nivel = 'lectura' THEN true
            WHEN p_nivel = 'escritura' THEN rp.nivel IN ('escritura', 'administrador')
            WHEN p_nivel = 'administrador' THEN rp.nivel = 'administrador'
        END
    ) INTO has_permission;

    RETURN has_permission;
END;
$$;

-- Enhanced audit function using JWT tokens
CREATE OR REPLACE FUNCTION usuarios.funcion_auditoria_mejorada()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_usuario INTEGER;
    v_id_token INTEGER;
    v_ip VARCHAR(45);
    v_agente TEXT;
BEGIN
    -- Try to get user ID from context
    BEGIN
        v_id_usuario := NULLIF(current_setting('jwt.claims.user_id', TRUE), '')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        v_id_usuario := NULL;
    END;

    -- Try to get token ID from context
    BEGIN
        v_id_token := NULLIF(current_setting('jwt.claims.jti', TRUE), '')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        v_id_token := NULL;
    END;

    -- Try to get IP from context
    BEGIN
        v_ip := NULLIF(current_setting('request.ip', TRUE), '');
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;

    -- Try to get user agent from context
    BEGIN
        v_agente := NULLIF(current_setting('request.user_agent', TRUE), '');
    EXCEPTION WHEN OTHERS THEN
        v_agente := NULL;
    END;

    -- Insert audit record with the contextual information
    IF TG_OP = 'DELETE' THEN
        INSERT INTO usuarios.registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos,
            direccion_ip,
            agente_usuario,
            id_token
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            v_id_usuario,
            row_to_json(OLD),
            NULL,
            v_ip,
            v_agente,
            v_id_token
        );
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO usuarios.registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos,
            direccion_ip,
            agente_usuario,
            id_token
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            v_id_usuario,
            row_to_json(OLD),
            row_to_json(NEW),
            v_ip,
            v_agente,
            v_id_token
        );
        RETURN NEW;

    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO usuarios.registro_auditoria(
            nombre_tabla,
            tipo_operacion,
            id_usuario,
            datos_anteriores,
            datos_nuevos,
            direccion_ip,
            agente_usuario,
            id_token
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            v_id_usuario,
            NULL,
            row_to_json(NEW),
            v_ip,
            v_agente,
            v_id_token
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$;

-- Function to create a quotation
CREATE OR REPLACE FUNCTION main.crear_cotizacion(
    p_id_usuario INTEGER,
    p_id_paquete INTEGER,
    p_id_opcion_alimento INTEGER,
    p_id_mampara INTEGER,
    p_id_tematica INTEGER,
    p_fecha_evento DATE,
    p_hora_inicio TIME,
    p_hora_fin TIME,
    p_nombre_festejado VARCHAR(100),
    p_edad_festejado INTEGER,
    p_comentarios TEXT,
    p_extras JSON DEFAULT NULL
)
RETURNS TABLE(id INTEGER, codigo_seguimiento VARCHAR, total NUMERIC)
LANGUAGE plpgsql
AS $$
DECLARE
    v_codigo VARCHAR(10);
    v_total NUMERIC(10,2) := 0;
    v_cotizacion_id INTEGER;
    v_expiracion TIMESTAMP;
    v_ip VARCHAR(45);
    v_agente TEXT;
    v_extra RECORD;
    v_precio_paquete NUMERIC(10,2);
BEGIN
    -- Generate tracking code
    v_codigo := main.generar_codigo_seguimiento();

    -- Set expiration date (48 hours from now)
    v_expiracion := CURRENT_TIMESTAMP + INTERVAL '48 hours';

    -- Try to get IP and user agent from context
    BEGIN
        v_ip := NULLIF(current_setting('request.ip', TRUE), '');
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;

    BEGIN
        v_agente := NULLIF(current_setting('request.user_agent', TRUE), '');
    EXCEPTION WHEN OTHERS THEN
        v_agente := NULL;
    END;

    -- Calculate package price based on day of week
    SELECT
        CASE
            WHEN EXTRACT(DOW FROM p_fecha_evento) BETWEEN 1 AND 4 THEN precio_lunes_jueves
            ELSE precio_viernes_domingo
        END INTO v_precio_paquete
    FROM main.paquetes
    WHERE id = p_id_paquete;

    -- Calculate base price
    v_total := v_precio_paquete;

    -- Add mampara price
    SELECT v_total + precio INTO v_total
    FROM main.mamparas
    WHERE id = p_id_mampara;

    -- Add food option price if specified
    IF p_id_opcion_alimento IS NOT NULL THEN
        SELECT v_total + precio_extra INTO v_total
        FROM main.opciones_alimentos
        WHERE id = p_id_opcion_alimento;
    END IF;

    -- Apply Tuesday fee if applicable
    IF EXTRACT(DOW FROM p_fecha_evento) = 2 THEN
        v_total := v_total + 1500;
    END IF;

    -- Create the quotation
    INSERT INTO main.cotizaciones (
        id_usuario,
        codigo_seguimiento,
        id_paquete,
        id_opcion_alimento,
        id_mampara,
        id_tematica,
        fecha_evento,
        hora_inicio,
        hora_fin,
        nombre_festejado,
        edad_festejado,
        comentarios,
        total,
        estado,
        fecha_expiracion,
        ip_cliente,
        agente_usuario
    ) VALUES (
        p_id_usuario,
        v_codigo,
        p_id_paquete,
        p_id_opcion_alimento,
        p_id_mampara,
        p_id_tematica,
        p_fecha_evento,
        p_hora_inicio,
        p_hora_fin,
        p_nombre_festejado,
        p_edad_festejado,
        p_comentarios,
        v_total,
        'creada',
        v_expiracion,
        v_ip,
        v_agente
    ) RETURNING id INTO v_cotizacion_id;

    -- Add extras if provided
    IF p_extras IS NOT NULL THEN
        FOR v_extra IN SELECT * FROM json_to_recordset(p_extras) AS x(id_extra INTEGER, cantidad INTEGER)
        LOOP
            INSERT INTO main.cotizacion_extras (id_cotizacion, id_extra, cantidad)
            VALUES (v_cotizacion_id, v_extra.id_extra, v_extra.cantidad);

            -- Update total with extras
            SELECT v_total + (e.precio * v_extra.cantidad) INTO v_total
            FROM main.extras e
            WHERE e.id = v_extra.id_extra;
        END LOOP;

        -- Update the total in cotizaciones
        UPDATE main.cotizaciones SET total = v_total WHERE id = v_cotizacion_id;
    END IF;

    -- Create notification for the user
    INSERT INTO main.notificaciones (
        id_usuario,
        id_cotizacion,
        tipo,
        titulo,
        mensaje,
        metodo_envio,
        datos_envio
    ) VALUES (
        p_id_usuario,
        v_cotizacion_id,
        'cotizacion',
        'Nueva cotización creada',
        'Se ha creado una cotización con código: ' || v_codigo || '. Esta cotización expira el ' ||
        TO_CHAR(v_expiracion, 'DD/MM/YYYY HH24:MI'),
        'email',
        jsonb_build_object(
            'codigo', v_codigo,
            'total', v_total,
            'expiracion', v_expiracion
        )
    );

    -- Reserve inventory provisionally
    IF p_id_opcion_alimento IS NOT NULL THEN
        INSERT INTO inventario.reservas_inventario (
            id_materia_prima,
            id_cotizacion,
            cantidad,
            fecha_evento,
            estado
        )
        SELECT
            oa.id_materia_prima,
            v_cotizacion_id,
            oa.cantidad,
            p_fecha_evento,
            'proyectada'
        FROM main.opciones_alimentos oa
        WHERE oa.id = p_id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;
    END IF;

    -- Return the result
    RETURN QUERY
    SELECT v_cotizacion_id, v_codigo, v_total;
END;
$$;

-- Function to convert quotation to reservation
CREATE OR REPLACE FUNCTION main.convertir_cotizacion_a_reserva(
    p_codigo_cotizacion VARCHAR,
    p_id_usuario INTEGER
)
RETURNS TABLE(id INTEGER, codigo_seguimiento VARCHAR, total NUMERIC)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cotizacion RECORD;
    v_extras RECORD;
    v_reserva_id INTEGER;
    v_codigo VARCHAR(10);
    v_total NUMERIC(10,2);
BEGIN
    -- Find the quotation
    SELECT * INTO v_cotizacion
    FROM main.cotizaciones c
    WHERE c.codigo_seguimiento = p_codigo_cotizacion
    AND c.estado = 'creada'
    AND c.fecha_expiracion > CURRENT_TIMESTAMP;

    -- Check if quotation exists and is valid
    IF v_cotizacion.id IS NULL THEN
        RAISE EXCEPTION 'Cotización no encontrada, expirada o ya procesada';
    END IF;

    -- Generate tracking code for the reservation
    v_codigo := main.generar_codigo_seguimiento();

    -- Create reservation from quotation
    INSERT INTO main.reservas (
        id_cotizacion,
        id_usuario,
        id_paquete,
        id_opcion_alimento,
        id_mampara,
        id_tematica,
        fecha_reserva,
        hora_inicio,
        hora_fin,
        nombre_festejado,
        edad_festejado,
        comentarios,
        total,
        estado,
        codigo_seguimiento
    ) VALUES (
        v_cotizacion.id,
        p_id_usuario,
        v_cotizacion.id_paquete,
        v_cotizacion.id_opcion_alimento,
        v_cotizacion.id_mampara,
        v_cotizacion.id_tematica,
        v_cotizacion.fecha_evento,
        v_cotizacion.hora_inicio,
        v_cotizacion.hora_fin,
        v_cotizacion.nombre_festejado,
        v_cotizacion.edad_festejado,
        v_cotizacion.comentarios,
        v_cotizacion.total,
        'pendiente',
        v_codigo
    ) RETURNING id, total INTO v_reserva_id, v_total;

    -- Copy extras from quotation to reservation
    FOR v_extras IN
        SELECT id_extra, cantidad
        FROM main.cotizacion_extras
        WHERE id_cotizacion = v_cotizacion.id
    LOOP
        INSERT INTO main.reserva_extras (id_reserva, id_extra, cantidad)
        VALUES (v_reserva_id, v_extras.id_extra, v_extras.cantidad);
    END LOOP;

    -- Update quotation status
    UPDATE main.cotizaciones
    SET estado = 'confirmada',
        fecha_confirmacion = CURRENT_TIMESTAMP
    WHERE id = v_cotizacion.id;

    -- Update inventory reservations
    UPDATE inventario.reservas_inventario
    SET id_reserva = v_reserva_id,
        estado = 'confirmada'
    WHERE id_cotizacion = v_cotizacion.id
    AND estado = 'proyectada';

    -- Create notification for the user
    INSERT INTO main.notificaciones (
        id_usuario,
        id_cotizacion,
        id_reserva,
        tipo,
        titulo,
        mensaje,
        metodo_envio,
        datos_envio
    ) VALUES (
        p_id_usuario,
        v_cotizacion.id,
        v_reserva_id,
        'reserva',
        'Reservación creada',
        'Se ha creado una reservación con código: ' || v_codigo || ' a partir de la cotización ' ||
        p_codigo_cotizacion || '. Por favor realice el pago para confirmar.',
        'email',
        jsonb_build_object(
            'codigo_cotizacion', p_codigo_cotizacion,
            'codigo_reserva', v_codigo,
            'total', v_total
        )
    );

    -- Return the result
    RETURN QUERY
    SELECT v_reserva_id, v_codigo, v_total;
END;
$$;

-- Function to process payment
CREATE OR REPLACE FUNCTION finanzas.procesar_pago(
    p_codigo_reserva VARCHAR,
    p_monto NUMERIC(10,2),
    p_metodo_pago finanzas.enum_metodo_pago,
    p_referencia_pago VARCHAR,
    p_id_transaccion VARCHAR,
    p_datos_transaccion JSONB,
    p_id_usuario INTEGER,
    p_es_pago_parcial BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(id INTEGER, estado finanzas.enum_pagos_estado, monto NUMERIC)
LANGUAGE plpgsql
AS $$
DECLARE
    v_reserva RECORD;
    v_pago_id INTEGER;
    v_estado finanzas.enum_pagos_estado := 'completado';
    v_categoria_id INTEGER;
BEGIN
    -- Find the reservation
    SELECT * INTO v_reserva
    FROM main.reservas r
    WHERE r.codigo_seguimiento = p_codigo_reserva
    AND r.estado IN ('pendiente', 'confirmada');

    -- Check if reservation exists
    IF v_reserva.id IS NULL THEN
        RAISE EXCEPTION 'Reservación no encontrada o no está en estado válido para pagos';
    END IF;

    -- Calculate total paid so far
    DECLARE
        v_total_pagado NUMERIC(10,2);
    BEGIN
        SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
        FROM finanzas.pagos
        WHERE id_reserva = v_reserva.id
        AND estado = 'completado';

        -- Validate payment amount
        IF v_total_pagado + p_monto > v_reserva.total THEN
            RAISE EXCEPTION 'El monto total de pagos excede el valor de la reservación';
        END IF;
    END;

    -- Create payment record
    INSERT INTO finanzas.pagos (
        id_reserva,
        id_cotizacion,
        monto,
        fecha_pago,
        estado,
        metodo_pago,
        referencia_pago,
        es_pago_parcial,
        id_usuario,
        id_transaccion,
        datos_transaccion
    ) VALUES (
        v_reserva.id,
        v_reserva.id_cotizacion,
        p_monto,
        CURRENT_DATE,
        v_estado,
        p_metodo_pago,
        p_referencia_pago,
        p_es_pago_parcial,
        p_id_usuario,
        p_id_transaccion,
        p_datos_transaccion
    ) RETURNING id INTO v_pago_id;

    -- If payment completes the reservation amount, update reservation status
    DECLARE
        v_total_pagado NUMERIC(10,2);
    BEGIN
        SELECT COALESCE(SUM(monto), 0) INTO v_total_pagado
        FROM finanzas.pagos
        WHERE id_reserva = v_reserva.id
        AND estado = 'completado';

        IF v_total_pagado >= v_reserva.total THEN
            UPDATE main.reservas
            SET estado = 'confirmada'
            WHERE id = v_reserva.id;

            -- Update inventory reservation status if not already confirmed
            UPDATE inventario.reservas_inventario
            SET estado = 'confirmada'
            WHERE id_reserva = v_reserva.id
            AND estado != 'confirmada';
        END IF;
    END;

    -- Get or create the 'Reservación' category
    SELECT id INTO v_categoria_id
    FROM finanzas.categorias
    WHERE nombre = 'Reservación'
    AND activo = true;

    IF v_categoria_id IS NULL THEN
        INSERT INTO finanzas.categorias(nombre, color, activo)
        VALUES ('Reservación', '#4CAF50', TRUE)
        RETURNING id INTO v_categoria_id;
    END IF;

    -- Create financial record
    INSERT INTO finanzas.finanzas (
        id_reserva,
        id_cotizacion,
        tipo,
        monto,
        fecha,
        descripcion,
        id_usuario,
        id_categoria,
        id_pago,
        id_transaccion
    ) VALUES (
        v_reserva.id,
        v_reserva.id_cotizacion,
        'ingreso',
        p_monto,
        CURRENT_DATE,
        CASE
            WHEN p_es_pago_parcial THEN 'Pago parcial de reserva ' || p_codigo_reserva
            ELSE 'Pago completo de reserva ' || p_codigo_reserva
        END,
        p_id_usuario,
        v_categoria_id,
        v_pago_id,
        p_id_transaccion
    );

    -- Create notification for the user
    INSERT INTO main.notificaciones (
        id_usuario,
        id_reserva,
        tipo,
        titulo,
        mensaje,
        metodo_envio,
        datos_envio
    ) VALUES (
        v_reserva.id_usuario,
        v_reserva.id,
        'pago',
        'Pago procesado',
        'Se ha procesado un pago por $' || p_monto || ' para la reservación ' ||
        p_codigo_reserva || '. Estado de pago: ' || v_estado,
        'email',
        jsonb_build_object(
            'codigo_reserva', p_codigo_reserva,
            'monto', p_monto,
            'metodo_pago', p_metodo_pago,
            'estado', v_estado,
            'es_pago_parcial', p_es_pago_parcial
        )
    );

    -- Return the result
    RETURN QUERY
    SELECT v_pago_id, v_estado, p_monto;
END;
$$;

-- Function to process refund
CREATE OR REPLACE FUNCTION finanzas.procesar_reembolso(
    p_id_pago INTEGER,
    p_monto_reembolso NUMERIC(10,2),
    p_motivo TEXT,
    p_referencia VARCHAR,
    p_id_transaccion VARCHAR,
    p_id_usuario INTEGER
)
RETURNS TABLE(id INTEGER, estado finanzas.enum_pagos_estado, monto NUMERIC)
LANGUAGE plpgsql
AS $$
DECLARE
    v_pago RECORD;
    v_reembolso_id INTEGER;
    v_estado finanzas.enum_pagos_estado := 'reembolsado';
    v_categoria_id INTEGER;
    v_reserva_id INTEGER;
    v_codigo_reserva VARCHAR;
BEGIN
    -- Find the payment
    SELECT p.*, r.id AS reserva_id, r.codigo_seguimiento
    INTO v_pago
    FROM finanzas.pagos p
    LEFT JOIN main.reservas r ON p.id_reserva = r.id
    WHERE p.id = p_id_pago
    AND p.estado = 'completado';

    -- Check if payment exists and is valid for refund
    IF v_pago.id IS NULL THEN
        RAISE EXCEPTION 'Pago no encontrado o no está en estado válido para reembolso';
    END IF;

    -- Validate refund amount
    IF p_monto_reembolso > v_pago.monto THEN
        RAISE EXCEPTION 'El monto de reembolso no puede ser mayor que el monto del pago';
    END IF;

    -- Store reservation info
    v_reserva_id := v_pago.reserva_id;
    v_codigo_reserva := v_pago.codigo_seguimiento;

    -- Create refund record
    INSERT INTO finanzas.reembolsos (
        id_pago,
        monto_reembolso,
        fecha_reembolso,
        motivo,
        referencia,
        id_transaccion,
        estado,
        id_usuario
    ) VALUES (
        p_id_pago,
        p_monto_reembolso,
        CURRENT_DATE,
        p_motivo,
        p_referencia,
        p_id_transaccion,
        'completado',
        p_id_usuario
    ) RETURNING id INTO v_reembolso_id;

    -- Update payment status based on refund amount
    IF p_monto_reembolso = v_pago.monto THEN
        UPDATE finanzas.pagos
        SET estado = 'reembolsado'
        WHERE id = p_id_pago;
    ELSE
        UPDATE finanzas.pagos
        SET estado = 'parcial_reembolsado'
        WHERE id = p_id_pago;
    END IF;

    -- Get or create the 'Reembolso' category
    SELECT id INTO v_categoria_id
    FROM finanzas.categorias
    WHERE nombre = 'Reembolso'
    AND activo = true;

    IF v_categoria_id IS NULL THEN
        INSERT INTO finanzas.categorias(nombre, color, activo)
        VALUES ('Reembolso', '#F44336', TRUE)
        RETURNING id INTO v_categoria_id;
    END IF;

    -- Create financial record for the refund
    INSERT INTO finanzas.finanzas (
        id_reserva,
        id_cotizacion,
        tipo,
        monto,
        fecha,
        descripcion,
        id_usuario,
        id_categoria,
        id_pago,
        id_transaccion,
        id_reembolso
    ) VALUES (
        v_pago.id_reserva,
        v_pago.id_cotizacion,
        'reembolso',
        p_monto_reembolso,
        CURRENT_DATE,
        'Reembolso de pago ID ' || p_id_pago || ': ' || p_motivo,
        p_id_usuario,
        v_categoria_id,
        p_id_pago,
        p_id_transaccion,
        (SELECT id FROM finanzas.finanzas WHERE id_pago = p_id_pago LIMIT 1)
    );

    -- If this was a full refund and there are no other valid payments, update reservation status
    IF p_monto_reembolso = v_pago.monto AND v_reserva_id IS NOT NULL THEN
        DECLARE
            v_valid_payments INTEGER;
        BEGIN
            SELECT COUNT(*) INTO v_valid_payments
            FROM finanzas.pagos
            WHERE id_reserva = v_reserva_id
            AND estado IN ('completado', 'parcial_reembolsado');

            IF v_valid_payments = 0 THEN
                UPDATE main.reservas
                SET estado = 'pendiente'
                WHERE id = v_reserva_id;
            END IF;
        END;
    END IF;

    -- Create notification for the user
    IF v_reserva_id IS NOT NULL THEN
        INSERT INTO main.notificaciones (
            id_usuario,
            id_reserva,
            tipo,
            titulo,
            mensaje,
            metodo_envio,
            datos_envio
        ) VALUES (
            v_pago.id_usuario,
            v_reserva_id,
            'pago',
            'Reembolso procesado',
            'Se ha procesado un reembolso por $' || p_monto_reembolso || ' para la reservación ' ||
            v_codigo_reserva || '.',
            'email',
            jsonb_build_object(
                'codigo_reserva', v_codigo_reserva,
                'monto_reembolso', p_monto_reembolso,
                'motivo', p_motivo
            )
        );
    END IF;

    -- Return the result
    RETURN QUERY
    SELECT v_reembolso_id, v_estado, p_monto_reembolso;
END;
$$;

-- Function to handle FIFO inventory consumption
CREATE OR REPLACE FUNCTION inventario.consumir_lotes_fifo(
    p_id_materia_prima INTEGER,
    p_cantidad NUMERIC(10,2),
    p_id_usuario INTEGER,
    p_id_reserva INTEGER DEFAULT NULL,
    p_descripcion TEXT DEFAULT 'Consumo FIFO de inventario'
)
RETURNS TABLE(lotes_consumidos INTEGER, cantidad_total NUMERIC)
LANGUAGE plpgsql
AS $$
DECLARE
    v_cantidad_restante NUMERIC(10,2) := p_cantidad;
    v_cantidad_consumida NUMERIC(10,2) := 0;
    v_lote RECORD;
    v_cantidad_lote NUMERIC(10,2);
    v_lotes_count INTEGER := 0;
BEGIN
    -- Validate there's enough inventory
    DECLARE
        v_stock_actual NUMERIC(10,2);
    BEGIN
        SELECT stock_actual INTO v_stock_actual
        FROM inventario.materias_primas
        WHERE id = p_id_materia_prima;

        IF v_stock_actual < p_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente: % < %', v_stock_actual, p_cantidad;
        END IF;
    END;

    -- Consume inventory from lots using FIFO (first expiring first)
    FOR v_lote IN
        SELECT id, cantidad_actual
        FROM inventario.lotes
        WHERE id_materia_prima = p_id_materia_prima
        AND cantidad_actual > 0
        ORDER BY fecha_caducidad, fecha_produccion
    LOOP
        -- Determine how much to take from this lot
        v_cantidad_lote := LEAST(v_lote.cantidad_actual, v_cantidad_restante);

        -- Update lot quantity
        UPDATE inventario.lotes
        SET cantidad_actual = cantidad_actual - v_cantidad_lote
        WHERE id = v_lote.id;

        -- Record movement
        INSERT INTO inventario.movimientos_inventario (
            id_materia_prima,
            id_lote,
            id_reserva,
            tipo_movimiento,
            cantidad,
            descripcion,
            id_usuario
        ) VALUES (
            p_id_materia_prima,
            v_lote.id,
            p_id_reserva,
            'salida',
            v_cantidad_lote,
            p_descripcion || ' - Lote ID: ' || v_lote.id,
            p_id_usuario
        );

        -- Update counters
        v_cantidad_restante := v_cantidad_restante - v_cantidad_lote;
        v_cantidad_consumida := v_cantidad_consumida + v_cantidad_lote;
        v_lotes_count := v_lotes_count + 1;

        -- If quantity fulfilled, exit
        IF v_cantidad_restante <= 0 THEN
            EXIT;
        END IF;
    END LOOP;

    -- Update materia_prima stock (trigger will handle this)

    -- Return results
    RETURN QUERY
    SELECT v_lotes_count, v_cantidad_consumida;
END;
$$;

-- Function to update inventory projections
CREATE OR REPLACE FUNCTION inventario.actualizar_proyecciones_inventario(
    p_fecha_inicio DATE DEFAULT CURRENT_DATE,
    p_fecha_fin DATE DEFAULT CURRENT_DATE + INTERVAL '90 days'
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
    v_materia_prima RECORD;
    v_fecha DATE;
    v_consumo NUMERIC(10,2);
BEGIN
    -- Clean up old projections outside requested range
    DELETE FROM inventario.reservas_inventario
    WHERE estado = 'proyectada'
    AND fecha_evento < p_fecha_inicio;

    -- For each active materia prima
    FOR v_materia_prima IN
        SELECT id, nombre
        FROM inventario.materias_primas
        WHERE activo = true
    LOOP
        -- For each day in range
        FOR v_fecha IN
            SELECT generate_series(p_fecha_inicio, p_fecha_fin, '1 day'::interval)::date
        LOOP
            -- Calculate projected consumption based on historical data
            SELECT COALESCE(AVG(ABS(mi.cantidad)), 0) INTO v_consumo
            FROM inventario.movimientos_inventario mi
            WHERE mi.id_materia_prima = v_materia_prima.id
            AND mi.tipo_movimiento = 'salida'
            AND DATE_PART('dow', mi.fecha) = DATE_PART('dow', v_fecha)
            AND mi.fecha >= CURRENT_DATE - INTERVAL '90 days'
            AND mi.fecha < CURRENT_DATE;

            -- Only create projection if there is consumption
            IF v_consumo > 0 THEN
                -- Check if projection already exists
                IF NOT EXISTS (
                    SELECT 1
                    FROM inventario.reservas_inventario
                    WHERE id_materia_prima = v_materia_prima.id
                    AND fecha_evento = v_fecha
                    AND estado = 'proyectada'
                    AND id_reserva IS NULL
                    AND id_cotizacion IS NULL
                ) THEN
                    -- Create projection
                    INSERT INTO inventario.reservas_inventario (
                        id_materia_prima,
                        cantidad,
                        fecha_evento,
                        estado
                    ) VALUES (
                        v_materia_prima.id,
                        v_consumo,
                        v_fecha,
                        'proyectada'
                    );

                    v_count := v_count + 1;
                END IF;
            END IF;
        END LOOP;
    END LOOP;

    RETURN v_count;
END;
$$;

-- Function to create notification
CREATE OR REPLACE FUNCTION main.enviar_notificacion(
    p_id_usuario INTEGER,
    p_tipo main.enum_notificaciones_tipo,
    p_titulo VARCHAR(255),
    p_mensaje TEXT,
    p_metodo_envio VARCHAR(20),
    p_id_cotizacion INTEGER DEFAULT NULL,
    p_id_reserva INTEGER DEFAULT NULL,
    p_datos_envio JSONB DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_notificacion_id INTEGER;
BEGIN
    INSERT INTO main.notificaciones (
        id_usuario,
        id_cotizacion,
        id_reserva,
        tipo,
        titulo,
        mensaje,
        metodo_envio,
        datos_envio
    ) VALUES (
        p_id_usuario,
        p_id_cotizacion,
        p_id_reserva,
        p_tipo,
        p_titulo,
        p_mensaje,
        p_metodo_envio,
        p_datos_envio
    ) RETURNING id INTO v_notificacion_id;

    -- Here you would implement the actual notification sending
    -- For example, connecting to an email service or SMS gateway

    RETURN v_notificacion_id;
END;
$$;

-- ==========================================
-- Creation/replacement of triggers
-- ==========================================

-- Replace existing audit triggers with improved version
DO $$
BEGIN
    -- Drop existing triggers
    DROP TRIGGER IF EXISTS aud_usuarios ON usuarios.usuarios;
    DROP TRIGGER IF EXISTS aud_reservas ON main.reservas;
    DROP TRIGGER IF EXISTS aud_finanzas ON finanzas.finanzas;
    DROP TRIGGER IF EXISTS aud_pagos ON finanzas.pagos;
    DROP TRIGGER IF EXISTS aud_unidades_medida ON inventario.unidades_medida;
    DROP TRIGGER IF EXISTS aud_conversiones_medida ON inventario.conversiones_medida;
    DROP TRIGGER IF EXISTS aud_tipos_ajuste_inventario ON inventario.tipos_ajuste_inventario;
    DROP TRIGGER IF EXISTS aud_lotes ON inventario.lotes;
    DROP TRIGGER IF EXISTS aud_recetas_insumos ON main.recetas_insumos;
    DROP TRIGGER IF EXISTS aud_ordenes_compra ON inventario.ordenes_compra;
    DROP TRIGGER IF EXISTS aud_detalle_orden_compra ON inventario.detalle_orden_compra;
    DROP TRIGGER IF EXISTS aud_alertas_inventario ON inventario.alertas_inventario;

    -- Create new triggers with improved audit function
    CREATE TRIGGER aud_usuarios_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON usuarios.usuarios
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();

    CREATE TRIGGER aud_reservas_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON main.reservas
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();

    CREATE TRIGGER aud_cotizaciones_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON main.cotizaciones
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();

    CREATE TRIGGER aud_finanzas_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON finanzas.finanzas
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();

    CREATE TRIGGER aud_pagos_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON finanzas.pagos
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();

    CREATE TRIGGER aud_reembolsos_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON finanzas.reembolsos
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();

    CREATE TRIGGER aud_unidades_medida_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON inventario.unidades_medida
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();

    CREATE TRIGGER aud_lotes_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON inventario.lotes
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();

    CREATE TRIGGER aud_reservas_inventario_mejorado
        AFTER INSERT OR UPDATE OR DELETE
        ON inventario.reservas_inventario
        FOR EACH ROW
    EXECUTE PROCEDURE usuarios.funcion_auditoria_mejorada();
END $$;

-- Trigger for quotation expiration
CREATE OR REPLACE FUNCTION main.expirar_cotizaciones()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- If quotation has expired, mark it as expired
    IF NEW.fecha_expiracion < CURRENT_TIMESTAMP AND NEW.estado = 'creada' THEN
        NEW.estado := 'expirada';

        -- Release provisional inventory
        UPDATE inventario.reservas_inventario
        SET estado = 'cancelada'
        WHERE id_cotizacion = NEW.id
        AND estado = 'proyectada';

        -- Notify the user
        INSERT INTO main.notificaciones (
            id_usuario,
            id_cotizacion,
            tipo,
            titulo,
            mensaje,
            metodo_envio,
            datos_envio
        ) VALUES (
            NEW.id_usuario,
            NEW.id,
            'cotizacion',
            'Cotización expirada',
            'La cotización con código ' || NEW.codigo_seguimiento || ' ha expirado.',
            'email',
            jsonb_build_object(
                'codigo', NEW.codigo_seguimiento,
                'total', NEW.total
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for quotation expiration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_expirar_cotizaciones') THEN
        CREATE TRIGGER trigger_expirar_cotizaciones
            BEFORE UPDATE
            ON main.cotizaciones
            FOR EACH ROW
        EXECUTE PROCEDURE main.expirar_cotizaciones();
    END IF;
END $$;

-- Trigger to check availability before confirming a reservation
CREATE OR REPLACE FUNCTION main.verificar_disponibilidad_reserva()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflicto BOOLEAN;
    v_inventario_disponible BOOLEAN;
BEGIN
    -- Only check when status changes to 'confirmada'
    IF NEW.estado = 'confirmada' AND OLD.estado != 'confirmada' THEN
        -- Check for time slot conflicts
        SELECT EXISTS (
            SELECT 1
            FROM main.reservas r
            WHERE r.fecha_reserva = NEW.fecha_reserva
            AND r.estado = 'confirmada'
            AND r.id != NEW.id
            AND (
                (r.hora_inicio <= NEW.hora_inicio AND r.hora_fin > NEW.hora_inicio) OR
                (r.hora_inicio < NEW.hora_fin AND r.hora_fin >= NEW.hora_fin) OR
                (r.hora_inicio >= NEW.hora_inicio AND r.hora_fin <= NEW.hora_fin)
            )
        ) INTO v_conflicto;

        IF v_conflicto THEN
            RAISE EXCEPTION 'No se puede confirmar la reserva: conflicto con otra reserva en el mismo horario';
        END IF;

        -- Check for inventory availability
        IF NEW.id_opcion_alimento IS NOT NULL THEN
            SELECT NOT EXISTS (
                SELECT 1
                FROM main.opciones_alimentos oa
                JOIN inventario.materias_primas mp ON oa.id_materia_prima = mp.id
                WHERE oa.id = NEW.id_opcion_alimento
                AND oa.id_materia_prima IS NOT NULL
                AND mp.stock_actual < oa.cantidad
            ) INTO v_inventario_disponible;

            IF NOT v_inventario_disponible THEN
                RAISE EXCEPTION 'No hay suficiente inventario para la opción de alimento seleccionada';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for availability verification
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_verificar_disponibilidad') THEN
        CREATE TRIGGER trigger_verificar_disponibilidad
            BEFORE UPDATE
            ON main.reservas
            FOR EACH ROW
        EXECUTE PROCEDURE main.verificar_disponibilidad_reserva();
    END IF;
END $$;

-- Trigger for FIFO inventory management when confirming a reservation
CREATE OR REPLACE FUNCTION inventario.gestionar_lotes_reserva()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_usuario INTEGER;
BEGIN
    -- Get user from context or use a default
    BEGIN
        v_id_usuario := NULLIF(current_setting('jwt.claims.user_id', TRUE), '')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        -- Default to reservation owner if no context user
        v_id_usuario := NEW.id_usuario;
    END;

    -- Only proceed if confirming a reservation
    IF NEW.estado = 'confirmada' AND OLD.estado != 'confirmada' THEN
        -- Handle food option inventory using FIFO
        IF NEW.id_opcion_alimento IS NOT NULL THEN
            DECLARE
                v_materia_prima INTEGER;
                v_cantidad NUMERIC(10,2);
            BEGIN
                -- Get materia prima info from the food option
                SELECT id_materia_prima, cantidad INTO v_materia_prima, v_cantidad
                FROM main.opciones_alimentos
                WHERE id = NEW.id_opcion_alimento
                AND id_materia_prima IS NOT NULL;

                IF v_materia_prima IS NOT NULL AND v_cantidad > 0 THEN
                    -- Consume inventory using FIFO
                    PERFORM * FROM inventario.consumir_lotes_fifo(
                        v_materia_prima,
                        v_cantidad,
                        NEW.id,
                        v_id_usuario,
                        'Consumo para reservación #' || NEW.id || ' (' || NEW.codigo_seguimiento || ')'
                    );
                END IF;
            END;
        END IF;

        -- Notify the user
        INSERT INTO main.notificaciones (
            id_usuario,
            id_reserva,
            tipo,
            titulo,
            mensaje,
            metodo_envio,
            datos_envio
        ) VALUES (
            NEW.id_usuario,
            NEW.id,
            'reserva',
            'Reservación confirmada',
            'Su reservación con código ' || NEW.codigo_seguimiento || ' ha sido confirmada para el ' ||
            TO_CHAR(NEW.fecha_reserva, 'DD/MM/YYYY') || ' de ' || TO_CHAR(NEW.hora_inicio, 'HH24:MI') ||
            ' a ' || TO_CHAR(NEW.hora_fin, 'HH24:MI') || '.',
            'email',
            jsonb_build_object(
                'codigo', NEW.codigo_seguimiento,
                'fecha', NEW.fecha_reserva,
                'hora_inicio', NEW.hora_inicio,
                'hora_fin', NEW.hora_fin
            )
        );
    ELSIF NEW.estado = 'cancelada' AND OLD.estado = 'confirmada' THEN
        -- Handle cancellation - mark inventory reservations as cancelled
        UPDATE inventario.reservas_inventario
        SET estado = 'cancelada'
        WHERE id_reserva = NEW.id
        AND estado = 'confirmada';

        -- Notify the user
        INSERT INTO main.notificaciones (
            id_usuario,
            id_reserva,
            tipo,
            titulo,
            mensaje,
            metodo_envio,
            datos_envio
        ) VALUES (
            NEW.id_usuario,
            NEW.id,
            'reserva',
            'Reservación cancelada',
            'Su reservación con código ' || NEW.codigo_seguimiento || ' ha sido cancelada.',
            'email',
            jsonb_build_object(
                'codigo', NEW.codigo_seguimiento,
                'fecha', NEW.fecha_reserva
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for FIFO inventory management
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_gestionar_lotes_reserva') THEN
        CREATE TRIGGER trigger_gestionar_lotes_reserva
            AFTER UPDATE
            ON main.reservas
            FOR EACH ROW
        EXECUTE PROCEDURE inventario.gestionar_lotes_reserva();
    END IF;
END $$;

-- Trigger for batch alerts
CREATE OR REPLACE FUNCTION inventario.verificar_caducidad_lotes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- If creating or updating a lot with soon expiration
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.fecha_caducidad <> NEW.fecha_caducidad) THEN
        IF NEW.fecha_caducidad IS NOT NULL AND NEW.fecha_caducidad <= CURRENT_DATE + INTERVAL '7 days' AND NEW.cantidad_actual > 0 THEN
            -- Insert alerts for admin users
            INSERT INTO inventario.alertas_inventario (
                id_materia_prima,
                tipo_alerta,
                mensaje,
                id_usuario_destinatario,
                prioridad,
                accion_requerida
            )
            SELECT
                NEW.id_materia_prima,
                'caducidad',
                'LOTE PRÓXIMO A CADUCAR: Lote ' || NEW.codigo_lote || ' de ' || mp.nombre ||
                ' caducará el ' || TO_CHAR(NEW.fecha_caducidad, 'DD/MM/YYYY') ||
                '. Cantidad: ' || NEW.cantidad_actual || ' ' || um.abreviatura,
                u.id,
                CASE
                    WHEN NEW.fecha_caducidad <= CURRENT_DATE THEN 1
                    WHEN NEW.fecha_caducidad <= CURRENT_DATE + INTERVAL '3 days' THEN 2
                    ELSE 3
                END,
                'Utilizar este lote primero o disponer adecuadamente si ya está caducado.'
            FROM inventario.materias_primas mp
            JOIN usuarios.usuarios u ON u.tipo_usuario = 'admin' OR u.tipo_usuario = 'inventario'
            LEFT JOIN inventario.unidades_medida um ON mp.id_unidad_medida = um.id
            WHERE mp.id = NEW.id_materia_prima
            AND u.activo = true;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for batch alerts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_verificar_caducidad_lotes') THEN
        CREATE TRIGGER trigger_verificar_caducidad_lotes
            AFTER INSERT OR UPDATE
            ON inventario.lotes
            FOR EACH ROW
        EXECUTE PROCEDURE inventario.verificar_caducidad_lotes();
    END IF;
END $$;

-- Trigger to update quotation extras total
CREATE OR REPLACE FUNCTION main.actualizar_total_cotizacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    total_extras DECIMAL;
    total_base DECIMAL;
BEGIN
    -- Calculate extras total
    SELECT COALESCE(SUM(e.precio * ce.cantidad), 0)
    INTO total_extras
    FROM main.cotizacion_extras ce
    JOIN main.extras e ON e.id = ce.id_extra
    WHERE ce.id_cotizacion = CASE
        WHEN TG_OP = 'DELETE' THEN OLD.id_cotizacion
        ELSE NEW.id_cotizacion
    END;

    -- Get base total from quotation
    SELECT total INTO total_base
    FROM main.cotizaciones
    WHERE id = CASE
        WHEN TG_OP = 'DELETE' THEN OLD.id_cotizacion
        ELSE NEW.id_cotizacion
    END;

    -- Calculate new total
    total_base := (total_base - total_extras) + total_extras;

    -- Update quotation total
    UPDATE main.cotizaciones
    SET total = total_base
    WHERE id = CASE
        WHEN TG_OP = 'DELETE' THEN OLD.id_cotizacion
        ELSE NEW.id_cotizacion
    END;

    RETURN NULL;
END;
$$;

-- Create trigger for quotation extras total
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_actualizar_total_cotizacion') THEN
        CREATE TRIGGER trigger_actualizar_total_cotizacion
            AFTER INSERT OR UPDATE OR DELETE
            ON main.cotizacion_extras
            FOR EACH ROW
        EXECUTE PROCEDURE main.actualizar_total_cotizacion();
    END IF;
END $$;

-- Trigger to mark alerts as read
-- Trigger to mark alerts as read
CREATE OR REPLACE FUNCTION inventario.marcar_alerta_leida()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.leida = TRUE AND OLD.leida = FALSE THEN
        NEW.fecha_lectura := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for alert reading
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_marcar_alerta_leida') THEN
        CREATE TRIGGER trg_marcar_alerta_leida
            BEFORE UPDATE
            ON inventario.alertas_inventario
            FOR EACH ROW
            WHEN (NEW.leida IS DISTINCT FROM OLD.leida)
        EXECUTE PROCEDURE inventario.marcar_alerta_leida();
    END IF;
END $$;

-- Trigger for resolving alerts
CREATE OR REPLACE FUNCTION inventario.resolver_alerta()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.resuelta = TRUE AND OLD.resuelta = FALSE THEN
        NEW.fecha_resolucion := CURRENT_TIMESTAMP;

        -- Try to get user ID from context
        BEGIN
            NEW.id_usuario_resolucion := NULLIF(current_setting('jwt.claims.user_id', TRUE), '')::INTEGER;
        EXCEPTION WHEN OTHERS THEN
            -- Keep as is
        END;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for alert resolution
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_resolver_alerta') THEN
        CREATE TRIGGER trg_resolver_alerta
            BEFORE UPDATE
            ON inventario.alertas_inventario
            FOR EACH ROW
            WHEN (NEW.resuelta IS DISTINCT FROM OLD.resuelta)
        EXECUTE PROCEDURE inventario.resolver_alerta();
    END IF;
END $$;

-- Trigger to mark notifications as read
CREATE OR REPLACE FUNCTION main.marcar_notificacion_leida()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.estado = 'leida' AND OLD.estado = 'enviada' THEN
        NEW.fecha_lectura := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$;

-- Create trigger for notification reading
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_marcar_notificacion_leida') THEN
        CREATE TRIGGER trg_marcar_notificacion_leida
            BEFORE UPDATE
            ON main.notificaciones
            FOR EACH ROW
            WHEN (NEW.estado IS DISTINCT FROM OLD.estado)
        EXECUTE PROCEDURE main.marcar_notificacion_leida();
    END IF;
END $$;

-- Function to check for expired quotations
CREATE OR REPLACE FUNCTION main.verificar_cotizaciones_expiradas()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Mark expired quotations
    UPDATE main.cotizaciones
    SET estado = 'expirada'
    WHERE estado = 'creada'
    AND fecha_expiracion < CURRENT_TIMESTAMP
    RETURNING id INTO v_count;

    -- Release inventory reservations for expired quotations
    UPDATE inventario.reservas_inventario
    SET estado = 'cancelada'
    WHERE id_cotizacion IN (
        SELECT id
        FROM main.cotizaciones
        WHERE estado = 'expirada'
    )
    AND estado = 'proyectada';

    -- Send notifications for expired quotations
    INSERT INTO main.notificaciones (
        id_usuario,
        id_cotizacion,
        tipo,
        titulo,
        mensaje,
        metodo_envio,
        datos_envio
    )
    SELECT
        c.id_usuario,
        c.id,
        'cotizacion',
        'Cotización expirada',
        'La cotización con código ' || c.codigo_seguimiento || ' ha expirado.',
        'email',
        jsonb_build_object(
            'codigo', c.codigo_seguimiento,
            'total', c.total
        )
    FROM main.cotizaciones c
    WHERE c.estado = 'expirada'
    AND c.id NOT IN (
        SELECT id_cotizacion
        FROM main.notificaciones
        WHERE tipo = 'cotizacion'
        AND titulo = 'Cotización expirada'
    );

    RETURN v_count;
END;
$$;

-- JWT Helper Functions
CREATE OR REPLACE FUNCTION seguridad.crear_token(
    p_id_usuario INTEGER,
    p_ip VARCHAR(45) DEFAULT NULL,
    p_agente_usuario TEXT DEFAULT NULL,
    p_tiempo_validez INTERVAL DEFAULT INTERVAL '24 hours'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_token_id INTEGER;
    v_token_jti VARCHAR(100);
    v_fecha_expiracion TIMESTAMP;
    v_payload JSONB;
BEGIN
    -- Generate a unique JTI (JWT ID)
    v_token_jti := gen_random_uuid()::TEXT;

    -- Calculate expiration date
    v_fecha_expiracion := CURRENT_TIMESTAMP + p_tiempo_validez;

    -- Insert token record
    INSERT INTO seguridad.tokens (
        id_usuario,
        token_jti,
        fecha_emision,
        fecha_expiracion,
        estado,
        direccion_ip,
        agente_usuario
    ) VALUES (
        p_id_usuario,
        v_token_jti,
        CURRENT_TIMESTAMP,
        v_fecha_expiracion,
        'activo',
        p_ip,
        p_agente_usuario
    ) RETURNING id INTO v_token_id;

    -- Get user information
    SELECT jsonb_build_object(
        'user_id', u.id,
        'email', u.email,
        'name', u.nombre,
        'tipo', u.tipo_usuario,
        'jti', v_token_jti,
        'iat', extract(epoch from CURRENT_TIMESTAMP),
        'exp', extract(epoch from v_fecha_expiracion),
        'roles', (
            SELECT jsonb_agg(r.nombre)
            FROM seguridad.usuario_roles ur
            JOIN seguridad.roles r ON r.id = ur.id_rol
            WHERE ur.id_usuario = u.id
        )
    ) INTO v_payload
    FROM usuarios.usuarios u
    WHERE u.id = p_id_usuario;

    -- Return token payload
    RETURN v_payload;
END;
$$;

-- Revoke token function
CREATE OR REPLACE FUNCTION seguridad.revocar_token(
    p_token_jti VARCHAR(100),
    p_razon TEXT DEFAULT 'Revocado por sistema'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_actualizado BOOLEAN;
BEGIN
    UPDATE seguridad.tokens
    SET estado = 'revocado',
        fecha_revocacion = CURRENT_TIMESTAMP,
        razon_revocacion = p_razon,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE token_jti = p_token_jti
    AND estado = 'activo'
    RETURNING TRUE INTO v_actualizado;

    RETURN COALESCE(v_actualizado, FALSE);
END;
$$;

-- Check if current token is valid
CREATE OR REPLACE FUNCTION seguridad.es_token_valido()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_token_jti VARCHAR(100);
    v_valido BOOLEAN;
BEGIN
    -- Try to get token JTI from context
    BEGIN
        v_token_jti := NULLIF(current_setting('jwt.claims.jti', TRUE), '');
    EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
    END;

    -- If no token JTI found, return false
    IF v_token_jti IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check token validity
    SELECT EXISTS (
        SELECT 1
        FROM seguridad.tokens
        WHERE token_jti = v_token_jti
        AND estado = 'activo'
        AND fecha_expiracion > CURRENT_TIMESTAMP
    ) INTO v_valido;

    RETURN v_valido;
END;
$$;

-- Trigger para crear pago para reserva (COMENTADO para implementar nuevo flujo de pago)
/*
-- Trigger to clean up expired tokens
CREATE OR REPLACE FUNCTION seguridad.limpiar_tokens_expirados()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Mark expired tokens
    UPDATE seguridad.tokens
    SET estado = 'expirado',
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE estado = 'activo'
    AND fecha_expiracion < CURRENT_TIMESTAMP;

    RETURN NULL;
END;
$$;

-- Create trigger for token cleanup
DO $$
BEGIN
    -- Create the trigger if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_limpiar_tokens_expirados') THEN
        CREATE TRIGGER trg_limpiar_tokens_expirados
            AFTER INSERT
            ON seguridad.tokens
            FOR STATEMENT
        EXECUTE PROCEDURE seguridad.limpiar_tokens_expirados();
    END IF;

    -- Add a scheduled maintenance event (would be implemented via cron or similar in the application)
    COMMENT ON FUNCTION seguridad.limpiar_tokens_expirados() IS
        'Función para marcar tokens expirados. Debe ejecutarse periódicamente vía cron o similar.';
END $$;

COMMENT ON TRIGGER trigger_crear_pago_reserva ON main.reservas IS 'Trigger que crea automáticamente un pago cuando se crea una reserva';
*/
-- ==========================================
-- Inicialización de datos básicos
-- ==========================================

-- Create default roles and permissions
DO $$
DECLARE
    v_admin_role_id INTEGER;
    v_cliente_role_id INTEGER;
    v_inventario_role_id INTEGER;
    v_finanzas_role_id INTEGER;
BEGIN
    -- Create roles if they don't exist
    INSERT INTO seguridad.roles (nombre, descripcion)
    VALUES
        ('admin', 'Administrador con acceso total')
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id INTO v_admin_role_id;

    INSERT INTO seguridad.roles (nombre, descripcion)
    VALUES
        ('cliente', 'Usuario cliente con acceso limitado')
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id INTO v_cliente_role_id;

    INSERT INTO seguridad.roles (nombre, descripcion)
    VALUES
        ('inventario', 'Gestor de inventario')
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id INTO v_inventario_role_id;

    INSERT INTO seguridad.roles (nombre, descripcion)
    VALUES
        ('finanzas', 'Gestor financiero')
    ON CONFLICT (nombre) DO NOTHING
    RETURNING id INTO v_finanzas_role_id;

    -- If we didn't get the IDs from the insert, get them now
    IF v_admin_role_id IS NULL THEN
        SELECT id INTO v_admin_role_id FROM seguridad.roles WHERE nombre = 'admin';
    END IF;

    IF v_cliente_role_id IS NULL THEN
        SELECT id INTO v_cliente_role_id FROM seguridad.roles WHERE nombre = 'cliente';
    END IF;

    IF v_inventario_role_id IS NULL THEN
        SELECT id INTO v_inventario_role_id FROM seguridad.roles WHERE nombre = 'inventario';
    END IF;

    IF v_finanzas_role_id IS NULL THEN
        SELECT id INTO v_finanzas_role_id FROM seguridad.roles WHERE nombre = 'finanzas';
    END IF;

    -- Create basic permissions
    INSERT INTO seguridad.permisos (nombre, descripcion, modulo)
    VALUES
        ('usuario_ver', 'Ver usuarios', 'usuarios'),
        ('usuario_crear', 'Crear usuarios', 'usuarios'),
        ('usuario_editar', 'Editar usuarios', 'usuarios'),
        ('usuario_eliminar', 'Eliminar usuarios', 'usuarios'),
        ('reserva_ver', 'Ver reservas', 'reservas'),
        ('reserva_crear', 'Crear reservas', 'reservas'),
        ('reserva_editar', 'Editar reservas', 'reservas'),
        ('reserva_eliminar', 'Eliminar reservas', 'reservas'),
        ('cotizacion_ver', 'Ver cotizaciones', 'cotizaciones'),
        ('cotizacion_crear', 'Crear cotizaciones', 'cotizaciones'),
        ('cotizacion_editar', 'Editar cotizaciones', 'cotizaciones'),
        ('cotizacion_confirmar', 'Confirmar cotizaciones', 'cotizaciones'),
        ('inventario_ver', 'Ver inventario', 'inventario'),
        ('inventario_editar', 'Editar inventario', 'inventario'),
        ('finanzas_ver', 'Ver finanzas', 'finanzas'),
        ('finanzas_editar', 'Editar finanzas', 'finanzas'),
        ('reportes_ver', 'Ver reportes', 'reportes')
    ON CONFLICT (nombre) DO NOTHING;

    -- Assign permissions to roles
    -- Admin role - all permissions at admin level
    INSERT INTO seguridad.rol_permisos (id_rol, id_permiso, nivel)
    SELECT v_admin_role_id, p.id, 'administrador'::seguridad.enum_permisos_nivel
    FROM seguridad.permisos p
    ON CONFLICT (id_rol, id_permiso) DO NOTHING;

    -- Cliente role - limited permissions
    INSERT INTO seguridad.rol_permisos (id_rol, id_permiso, nivel)
    SELECT v_cliente_role_id, p.id, 'lectura'::seguridad.enum_permisos_nivel
    FROM seguridad.permisos p
    WHERE p.nombre IN ('reserva_ver', 'cotizacion_ver', 'cotizacion_crear')
    ON CONFLICT (id_rol, id_permiso) DO NOTHING;

    -- Inventario role
    INSERT INTO seguridad.rol_permisos (id_rol, id_permiso, nivel)
    SELECT v_inventario_role_id, p.id,
        CASE
            WHEN p.nombre LIKE 'inventario%' THEN 'escritura'::seguridad.enum_permisos_nivel
            ELSE 'lectura'::seguridad.enum_permisos_nivel
        END
    FROM seguridad.permisos p
    WHERE p.nombre IN ('inventario_ver', 'inventario_editar', 'reportes_ver')
    ON CONFLICT (id_rol, id_permiso) DO NOTHING;

    -- Finanzas role
    INSERT INTO seguridad.rol_permisos (id_rol, id_permiso, nivel)
    SELECT v_finanzas_role_id, p.id,
        CASE
            WHEN p.nombre LIKE 'finanzas%' THEN 'escritura'::seguridad.enum_permisos_nivel
            ELSE 'lectura'::seguridad.enum_permisos_nivel
        END
    FROM seguridad.permisos p
    WHERE p.nombre IN ('finanzas_ver', 'finanzas_editar', 'reportes_ver', 'reserva_ver')
    ON CONFLICT (id_rol, id_permiso) DO NOTHING;
END $$;

-- Create default financials categories
DO $$
BEGIN
    -- Create basic finance categories
    INSERT INTO finanzas.categorias (nombre, color)
    VALUES
        ('Reservación', '#4CAF50'),
        ('Reembolso', '#F44336'),
        ('Compra Inventario', '#2196F3'),
        ('Gastos Operativos', '#FF9800'),
        ('Nómina', '#9C27B0'),
        ('Otros', '#607D8B')
    ON CONFLICT (nombre) DO NOTHING;
END $$;

-- ==========================================
-- Final configuration
-- ==========================================

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Confirmar la transacción
COMMIT;

-- Log para confirmar la ejecución exitosa
DO $$
BEGIN
    RAISE NOTICE 'Script de inicialización mejorado ejecutado correctamente.';
    RAISE NOTICE 'Se implementaron las mejoras propuestas:';
    RAISE NOTICE '- Sistema de seguridad basado en JWT';
    RAISE NOTICE '- Flujo de cotización → reserva → pago';
    RAISE NOTICE '- Gestión de inventario por lotes con FIFO';
    RAISE NOTICE '- Sistema de reembolsos y transacciones financieras';
    RAISE NOTICE '- Sistema de notificaciones automáticas';
    RAISE NOTICE '- Proyecciones de inventario y reservas';
END $$;

