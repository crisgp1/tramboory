-- ==========================================
-- Script de inicialización completo para la base de datos Tramboory
-- ==========================================

-- Usamos una transacción para mantener atomicidad (ACID)
BEGIN;

-- Creación del esquema si no existe
CREATE SCHEMA IF NOT EXISTS tramboory;

-- Conexión al esquema correcto
SET search_path TO tramboory;

-- ==========================================
-- Definición de tipos enumerados
-- ==========================================
DO $$
BEGIN
    -- Verificar y crear enum_usuarios_tipo_usuario si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'enum_usuarios_tipo_usuario' AND n.nspname = 'tramboory') THEN
        CREATE TYPE tramboory.enum_usuarios_tipo_usuario AS ENUM ('cliente', 'admin');
    END IF;

    -- Verificar y crear enum_reservas_estado si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'enum_reservas_estado' AND n.nspname = 'tramboory') THEN
        CREATE TYPE tramboory.enum_reservas_estado AS ENUM ('pendiente', 'confirmada', 'cancelada');
    END IF;

    -- Verificar y crear enum_finanzas_tipo si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'enum_finanzas_tipo' AND n.nspname = 'tramboory') THEN
        CREATE TYPE tramboory.enum_finanzas_tipo AS ENUM ('ingreso', 'gasto');
    END IF;

    -- Verificar y crear enum_pagos_estado si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'enum_pagos_estado' AND n.nspname = 'tramboory') THEN
        CREATE TYPE tramboory.enum_pagos_estado AS ENUM ('pendiente', 'completado', 'fallido');
    END IF;

    -- Verificar y crear enum_turno si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'enum_turno' AND n.nspname = 'tramboory') THEN
        CREATE TYPE tramboory.enum_turno AS ENUM ('manana', 'tarde', 'ambos');
    END IF;

    -- Verificar y crear enum_ordenes_compra_estado si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'enum_ordenes_compra_estado' AND n.nspname = 'tramboory') THEN
        CREATE TYPE tramboory.enum_ordenes_compra_estado AS ENUM ('pendiente', 'aprobada', 'recibida', 'cancelada');
    END IF;

    -- Verificar y crear enum_tipo_alerta si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'enum_tipo_alerta' AND n.nspname = 'tramboory') THEN
        CREATE TYPE tramboory.enum_tipo_alerta AS ENUM ('stock_bajo', 'caducidad', 'vencimiento_proveedor', 'ajuste_requerido');
    END IF;
END
$$;

-- ==========================================
-- Creación de tablas
-- ==========================================

-- Tabla usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL UNIQUE,
    clave_hash          VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20),
    direccion           TEXT,
    tipo_usuario        tramboory.enum_usuarios_tipo_usuario NOT NULL,
    id_personalizado    VARCHAR(100),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla categorias
CREATE TABLE IF NOT EXISTS categorias (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    color               VARCHAR(7) DEFAULT '#000000' NOT NULL
        CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla extras
CREATE TABLE IF NOT EXISTS extras (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio              NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla paquetes_alimentos
CREATE TABLE IF NOT EXISTS paquetes_alimentos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

-- Tabla paquetes
CREATE TABLE IF NOT EXISTS paquetes (
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

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'tramboory' 
        AND tablename = 'paquetes' 
        AND indexname = 'idx_paquetes_paquete_alimento'
    ) THEN
        CREATE INDEX idx_paquetes_paquete_alimento ON paquetes (id_paquete_alimento);
    END IF;
END $$;

-- Tabla tematicas
CREATE TABLE IF NOT EXISTS tematicas (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    foto                VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla mamparas
CREATE TABLE IF NOT EXISTS mamparas (
    id                  SERIAL PRIMARY KEY,
    id_tematica         INTEGER NOT NULL REFERENCES tematicas(id) ON DELETE RESTRICT,
    piezas              INTEGER NOT NULL CHECK (piezas > 0),
    precio              NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    foto                VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'tramboory' 
        AND tablename = 'mamparas' 
        AND indexname = 'idx_mamparas_tematica'
    ) THEN
        CREATE INDEX idx_mamparas_tematica ON mamparas (id_tematica);
    END IF;
END $$;

-- Tabla registro_auditoria
CREATE TABLE IF NOT EXISTS registro_auditoria (
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

-- Tabla auditoria
CREATE TABLE IF NOT EXISTS auditoria (
    id              SERIAL PRIMARY KEY,
    id_usuario      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_usuario  VARCHAR(100) NOT NULL,
    fecha_operacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transaccion     TEXT NOT NULL
);

-- Tabla proveedores
CREATE TABLE IF NOT EXISTS proveedores (
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

-- Tabla unidades_medida
CREATE TABLE IF NOT EXISTS unidades_medida (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(50) NOT NULL UNIQUE,
    abreviatura         VARCHAR(10) NOT NULL UNIQUE,
    tipo                VARCHAR(20) NOT NULL 
        CHECK (tipo = ANY (ARRAY['masa', 'volumen', 'unidad', 'longitud', 'area'])),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla materias_primas
CREATE TABLE IF NOT EXISTS materias_primas (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    unidad_medida       VARCHAR(50) NOT NULL,
    stock_actual        NUMERIC(10, 2) DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo        NUMERIC(10, 2) DEFAULT 0 CHECK (stock_minimo >= 0),
    costo_unitario      NUMERIC(10, 2) DEFAULT 0 CHECK (costo_unitario >= 0),
    fecha_caducidad     DATE,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_unidad_medida    INTEGER REFERENCES unidades_medida(id),
    proveedor_id        INTEGER REFERENCES proveedores(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Tabla opciones_alimentos
CREATE TABLE IF NOT EXISTS opciones_alimentos (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio_extra        NUMERIC(10, 2) NOT NULL CHECK (precio_extra >= 0),
    disponible          BOOLEAN DEFAULT TRUE,
    turno               tramboory.enum_turno DEFAULT 'ambos',
    platillo_adulto     VARCHAR(100) NOT NULL,
    platillo_nino       VARCHAR(100) NOT NULL,
    opcion_papas        BOOLEAN DEFAULT FALSE,
    precio_papas        NUMERIC(10, 2) DEFAULT 19.00 CHECK (precio_papas >= 0),
    precio_adulto       NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio_adulto >= 0),
    precio_nino         NUMERIC(10, 2) DEFAULT 0.00 CHECK (precio_nino >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_materia_prima    INTEGER REFERENCES materias_primas(id),
    cantidad            NUMERIC(10, 2) DEFAULT 1
);

-- Tabla reservas
CREATE TABLE IF NOT EXISTS reservas (
    id                  SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_paquete          INTEGER NOT NULL REFERENCES paquetes(id),
    id_opcion_alimento  INTEGER REFERENCES opciones_alimentos(id),
    id_mampara          INTEGER NOT NULL REFERENCES mamparas(id),
    id_tematica         INTEGER NOT NULL REFERENCES tematicas(id),
    fecha_reserva       DATE NOT NULL,
    estado              tramboory.enum_reservas_estado DEFAULT 'pendiente' NOT NULL,
    total               NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    nombre_festejado    VARCHAR(100) NOT NULL,
    edad_festejado      INTEGER NOT NULL CHECK (edad_festejado > 0),
    comentarios         TEXT,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horario_valido CHECK (hora_fin > hora_inicio)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reservas' AND indexname = 'idx_reservas_fecha')
    THEN CREATE INDEX idx_reservas_fecha ON reservas (fecha_reserva); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reservas' AND indexname = 'idx_reservas_usuario')
    THEN CREATE INDEX idx_reservas_usuario ON reservas (id_usuario); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reservas' AND indexname = 'idx_reservas_paquete')
    THEN CREATE INDEX idx_reservas_paquete ON reservas (id_paquete); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reservas' AND indexname = 'idx_reservas_opcion_alimento')
    THEN CREATE INDEX idx_reservas_opcion_alimento ON reservas (id_opcion_alimento); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reservas' AND indexname = 'idx_reservas_mampara')
    THEN CREATE INDEX idx_reservas_mampara ON reservas (id_mampara); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reservas' AND indexname = 'idx_reservas_tematica')
    THEN CREATE INDEX idx_reservas_tematica ON reservas (id_tematica); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reservas' AND indexname = 'idx_reservas_estado')
    THEN CREATE INDEX idx_reservas_estado ON reservas (id, estado); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reservas' AND indexname = 'idx_reservas_horario')
    THEN 
        CREATE UNIQUE INDEX idx_reservas_horario 
        ON reservas (fecha_reserva, hora_inicio, hora_fin)
        WHERE (estado <> 'cancelada');
    END IF;
END $$;

-- Tabla finanzas
CREATE TABLE IF NOT EXISTS finanzas (
    id                  SERIAL PRIMARY KEY,
    id_reserva          INTEGER REFERENCES reservas(id),
    tipo                tramboory.enum_finanzas_tipo NOT NULL,
    monto               NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha               DATE NOT NULL,
    descripcion         TEXT,
    factura_pdf         VARCHAR(255),
    factura_xml         VARCHAR(255),
    archivo_prueba      VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_categoria        INTEGER REFERENCES categorias(id),
    id_usuario          INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_materia_prima    INTEGER REFERENCES materias_primas(id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'finanzas' AND indexname = 'idx_finanzas_fecha')
    THEN CREATE INDEX idx_finanzas_fecha ON finanzas (fecha); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'finanzas' AND indexname = 'idx_finanzas_reserva')
    THEN CREATE INDEX idx_finanzas_reserva ON finanzas (id_reserva); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'finanzas' AND indexname = 'idx_finanzas_categoria')
    THEN CREATE INDEX idx_finanzas_categoria ON finanzas (id_categoria); END IF;
END $$;

-- Tabla pagos
CREATE TABLE IF NOT EXISTS pagos (
    id                  SERIAL PRIMARY KEY,
    id_reserva          INTEGER NOT NULL REFERENCES reservas(id),
    monto               NUMERIC(10, 2) NOT NULL CHECK (monto > 0),
    fecha_pago          DATE NOT NULL,
    estado              tramboory.enum_pagos_estado DEFAULT 'pendiente' NOT NULL,
    metodo_pago         VARCHAR(50),
    referencia_pago     VARCHAR(100),
    es_pago_parcial     BOOLEAN DEFAULT FALSE,
    notas               TEXT,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'pagos' AND indexname = 'idx_pagos_fecha')
    THEN CREATE INDEX idx_pagos_fecha ON pagos (fecha_pago); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'pagos' AND indexname = 'idx_pagos_reserva')
    THEN CREATE INDEX idx_pagos_reserva ON pagos (id_reserva); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'pagos' AND indexname = 'idx_pagos_compuesto')
    THEN CREATE INDEX idx_pagos_compuesto ON pagos (id_reserva, estado, fecha_pago); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'pagos' AND indexname = 'idx_pagos_reserva_estado')
    THEN CREATE INDEX idx_pagos_reserva_estado ON pagos (id_reserva, estado); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'pagos' AND indexname = 'idx_pagos_reserva_estado_fecha')
    THEN CREATE INDEX idx_pagos_reserva_estado_fecha ON pagos (id_reserva, estado, fecha_pago); END IF;
END $$;

-- Tabla reserva_extras
CREATE TABLE IF NOT EXISTS reserva_extras (
    id_reserva          INTEGER NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    id_extra            INTEGER NOT NULL REFERENCES extras(id) ON DELETE CASCADE,
    cantidad            INTEGER DEFAULT 1 NOT NULL CHECK (cantidad > 0),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_reserva, id_extra)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reserva_extras' AND indexname = 'idx_reserva_extras_reserva')
    THEN CREATE INDEX idx_reserva_extras_reserva ON reserva_extras (id_reserva); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'reserva_extras' AND indexname = 'idx_reserva_extras_extra')
    THEN CREATE INDEX idx_reserva_extras_extra ON reserva_extras (id_extra); END IF;
END $$;

-- Tabla conversiones_medida
CREATE TABLE IF NOT EXISTS conversiones_medida (
    id_unidad_origen    INTEGER NOT NULL REFERENCES unidades_medida(id) ON DELETE RESTRICT,
    id_unidad_destino   INTEGER NOT NULL REFERENCES unidades_medida(id) ON DELETE RESTRICT,
    factor_conversion   NUMERIC(15, 6) NOT NULL CHECK (factor_conversion > 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_unidad_origen, id_unidad_destino)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'conversiones_medida' AND indexname = 'idx_conversiones_origen')
    THEN CREATE INDEX idx_conversiones_origen ON conversiones_medida (id_unidad_origen); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'conversiones_medida' AND indexname = 'idx_conversiones_destino')
    THEN CREATE INDEX idx_conversiones_destino ON conversiones_medida (id_unidad_destino); END IF;
END $$;

-- Tabla tipos_ajuste_inventario
CREATE TABLE IF NOT EXISTS tipos_ajuste_inventario (
    id                    SERIAL PRIMARY KEY,
    nombre                VARCHAR(50) NOT NULL UNIQUE,
    descripcion           TEXT,
    afecta_costos         BOOLEAN DEFAULT TRUE,
    requiere_autorizacion BOOLEAN DEFAULT FALSE,
    activo                BOOLEAN DEFAULT TRUE,
    fecha_creacion        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla lotes
CREATE TABLE IF NOT EXISTS lotes (
    id                  SERIAL PRIMARY KEY,
    id_materia_prima    INTEGER NOT NULL REFERENCES materias_primas(id) ON DELETE RESTRICT,
    codigo_lote         VARCHAR(50) NOT NULL,
    fecha_produccion    DATE,
    fecha_caducidad     DATE,
    cantidad_inicial    NUMERIC(10, 2) NOT NULL CHECK (cantidad_inicial > 0),
    cantidad_actual     NUMERIC(10, 2) NOT NULL,
    costo_unitario      NUMERIC(10, 2) NOT NULL CHECK (costo_unitario >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lote_materia_codigo UNIQUE (id_materia_prima, codigo_lote),
    CONSTRAINT ck_lotes_cantidad_actual_valida CHECK (cantidad_actual >= 0 AND cantidad_actual <= cantidad_inicial)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'lotes' AND indexname = 'idx_lotes_materia_prima')
    THEN CREATE INDEX idx_lotes_materia_prima ON lotes (id_materia_prima); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'lotes' AND indexname = 'idx_lotes_caducidad')
    THEN CREATE INDEX idx_lotes_caducidad ON lotes (fecha_caducidad); END IF;
END $$;

-- Tabla recetas_insumos
CREATE TABLE IF NOT EXISTS recetas_insumos (
    id_opcion_alimento  INTEGER NOT NULL REFERENCES opciones_alimentos(id) ON DELETE CASCADE,
    id_materia_prima    INTEGER NOT NULL REFERENCES materias_primas(id) ON DELETE RESTRICT,
    cantidad_requerida  NUMERIC(10, 3) NOT NULL CHECK (cantidad_requerida > 0),
    id_unidad_medida    INTEGER NOT NULL REFERENCES unidades_medida(id) ON DELETE RESTRICT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_opcion_alimento, id_materia_prima)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'recetas_insumos' AND indexname = 'idx_recetas_opcion_alimento')
    THEN CREATE INDEX idx_recetas_opcion_alimento ON recetas_insumos (id_opcion_alimento); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'recetas_insumos' AND indexname = 'idx_recetas_materia_prima')
    THEN CREATE INDEX idx_recetas_materia_prima ON recetas_insumos (id_materia_prima); END IF;
END $$;

-- Tabla ordenes_compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id                     SERIAL PRIMARY KEY,
    id_proveedor           INTEGER NOT NULL REFERENCES proveedores(id) ON DELETE RESTRICT,
    numero_orden           VARCHAR(50) NOT NULL UNIQUE,
    fecha_solicitud        DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_entrega_esperada DATE,
    estado                 tramboory.enum_ordenes_compra_estado DEFAULT 'pendiente' NOT NULL,
    total_estimado         NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (total_estimado >= 0),
    notas                  TEXT,
    id_usuario_creador     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    id_usuario_autorizador INTEGER REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha_autorizacion     TIMESTAMP,
    activo                 BOOLEAN DEFAULT TRUE,
    fecha_creacion         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'ordenes_compra' AND indexname = 'idx_ordenes_compra_proveedor')
    THEN CREATE INDEX idx_ordenes_compra_proveedor ON ordenes_compra (id_proveedor); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'ordenes_compra' AND indexname = 'idx_ordenes_compra_estado')
    THEN CREATE INDEX idx_ordenes_compra_estado ON ordenes_compra (estado); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'ordenes_compra' AND indexname = 'idx_ordenes_compra_fecha')
    THEN CREATE INDEX idx_ordenes_compra_fecha ON ordenes_compra (fecha_solicitud); END IF;
END $$;

-- Tabla movimientos_inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id               SERIAL PRIMARY KEY,
    id_materia_prima INTEGER NOT NULL REFERENCES materias_primas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_proveedor     INTEGER REFERENCES proveedores(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_reserva       INTEGER REFERENCES reservas(id),
    tipo_movimiento  VARCHAR(20) NOT NULL CHECK (tipo_movimiento = ANY (ARRAY['entrada', 'salida', 'ajuste'])),
    cantidad         NUMERIC(10, 2) NOT NULL CHECK (cantidad <> 0),
    fecha            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion      TEXT,
    id_usuario       INTEGER NOT NULL REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    id_tipo_ajuste   INTEGER REFERENCES tipos_ajuste_inventario(id),
    id_lote          INTEGER REFERENCES lotes(id) ON DELETE RESTRICT,
    id_orden_compra  INTEGER REFERENCES ordenes_compra(id) ON DELETE RESTRICT
);

-- Tabla detalle_orden_compra
CREATE TABLE IF NOT EXISTS detalle_orden_compra (
    id                  SERIAL PRIMARY KEY,
    id_orden_compra     INTEGER NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    id_materia_prima    INTEGER NOT NULL REFERENCES materias_primas(id) ON DELETE RESTRICT,
    cantidad            NUMERIC(10, 2) NOT NULL CHECK (cantidad > 0),
    id_unidad_medida    INTEGER NOT NULL REFERENCES unidades_medida(id) ON DELETE RESTRICT,
    precio_unitario     NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal            NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    cantidad_recibida   NUMERIC(10, 2) DEFAULT 0 CHECK (cantidad_recibida >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_detalle_orden_materia UNIQUE (id_orden_compra, id_materia_prima)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'detalle_orden_compra' AND indexname = 'idx_detalle_orden_compra')
    THEN CREATE INDEX idx_detalle_orden_compra ON detalle_orden_compra (id_orden_compra); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'detalle_orden_compra' AND indexname = 'idx_detalle_materia_prima')
    THEN CREATE INDEX idx_detalle_materia_prima ON detalle_orden_compra (id_materia_prima); END IF;
END $$;

-- Tabla alertas_inventario
CREATE TABLE IF NOT EXISTS alertas_inventario (
    id                      SERIAL PRIMARY KEY,
    id_materia_prima        INTEGER REFERENCES materias_primas(id) ON DELETE CASCADE,
    tipo_alerta             tramboory.enum_tipo_alerta NOT NULL,
    mensaje                 TEXT NOT NULL,
    fecha_alerta            TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    leida                   BOOLEAN DEFAULT FALSE,
    fecha_lectura           TIMESTAMP,
    id_usuario_destinatario INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    activo                  BOOLEAN DEFAULT TRUE,
    fecha_creacion          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'alertas_inventario' AND indexname = 'idx_alertas_materia_prima')
    THEN CREATE INDEX idx_alertas_materia_prima ON alertas_inventario (id_materia_prima); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'alertas_inventario' AND indexname = 'idx_alertas_tipo')
    THEN CREATE INDEX idx_alertas_tipo ON alertas_inventario (tipo_alerta); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'alertas_inventario' AND indexname = 'idx_alertas_leida')
    THEN CREATE INDEX idx_alertas_leida ON alertas_inventario (leida); END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'tramboory' AND tablename = 'alertas_inventario' AND indexname = 'idx_alertas_usuario')
    THEN CREATE INDEX idx_alertas_usuario ON alertas_inventario (id_usuario_destinatario); END IF;
END $$;

-- ==========================================
-- Creación de vistas
-- ==========================================

-- Vista vw_reporte_inventario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'tramboory' AND viewname = 'vw_reporte_inventario') THEN
        CREATE VIEW vw_reporte_inventario AS
        SELECT mp.id,
               mp.nombre,
               mp.unidad_medida,
               mp.stock_actual,
               mp.stock_minimo,
               mp.fecha_caducidad,
               CASE
                   WHEN mp.fecha_caducidad < CURRENT_DATE THEN 'Caducado'::text
                   WHEN mp.fecha_caducidad >= CURRENT_DATE AND mp.fecha_caducidad <= (CURRENT_DATE + '7 days'::interval)
                       THEN 'Por caducar'::text
                   ELSE 'Vigente'::text
                   END AS estado_caducidad
        FROM tramboory.materias_primas mp;
    END IF;
END $$;

-- Vista vw_reporte_caducidades
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'tramboory' AND viewname = 'vw_reporte_caducidades') THEN
        CREATE VIEW vw_reporte_caducidades AS
        SELECT mp.id,
               mp.nombre,
               mp.unidad_medida,
               mp.stock_actual,
               mp.fecha_caducidad,
               CASE
                   WHEN mp.fecha_caducidad < CURRENT_DATE THEN 'Caducado'::text
                   WHEN mp.fecha_caducidad <= (CURRENT_DATE + '7 days'::interval) THEN 'Próximo a caducar'::text
                   WHEN mp.fecha_caducidad <= (CURRENT_DATE + '30 days'::interval) THEN 'Caducidad próxima'::text
                   ELSE 'Vigente'::text
                   END AS estado_caducidad,
               CASE
                   WHEN mp.fecha_caducidad < CURRENT_DATE THEN 1
                   WHEN mp.fecha_caducidad <= (CURRENT_DATE + '7 days'::interval) THEN 2
                   WHEN mp.fecha_caducidad <= (CURRENT_DATE + '30 days'::interval) THEN 3
                   ELSE 4
                   END AS prioridad_alerta
        FROM tramboory.materias_primas mp
        WHERE mp.activo = true
          AND mp.fecha_caducidad IS NOT NULL
        ORDER BY (
                     CASE
                         WHEN mp.fecha_caducidad < CURRENT_DATE THEN 1
                         WHEN mp.fecha_caducidad <= (CURRENT_DATE + '7 days'::interval) THEN 2
                         WHEN mp.fecha_caducidad <= (CURRENT_DATE + '30 days'::interval) THEN 3
                         ELSE 4
                         END), mp.fecha_caducidad;
    END IF;
END $$;

-- Vista vw_reporte_stock_bajo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'tramboory' AND viewname = 'vw_reporte_stock_bajo') THEN
        CREATE VIEW vw_reporte_stock_bajo AS
        SELECT mp.id,
               mp.nombre,
               mp.unidad_medida,
               mp.stock_actual,
               mp.stock_minimo,
               um.abreviatura AS unidad_abreviada,
               CASE
                   WHEN mp.stock_actual = 0::numeric THEN 'Sin existencias'::text
                   WHEN mp.stock_actual <= (mp.stock_minimo * 0.5) THEN 'Crítico'::text
                   WHEN mp.stock_actual <= mp.stock_minimo THEN 'Bajo'::text
                   ELSE 'Normal'::text
                   END        AS estado_stock,
               CASE
                   WHEN mp.stock_actual = 0::numeric THEN 1
                   WHEN mp.stock_actual <= (mp.stock_minimo * 0.5) THEN 2
                   WHEN mp.stock_actual <= mp.stock_minimo THEN 3
                   ELSE 4
                   END        AS prioridad_alerta
        FROM tramboory.materias_primas mp
                 LEFT JOIN tramboory.unidades_medida um ON um.id = mp.id_unidad_medida
        WHERE mp.activo = true
        ORDER BY (
                     CASE
                         WHEN mp.stock_actual = 0::numeric THEN 1
                         WHEN mp.stock_actual <= (mp.stock_minimo * 0.5) THEN 2
                         WHEN mp.stock_actual <= mp.stock_minimo THEN 3
                         ELSE 4
                         END), mp.stock_actual;
    END IF;
END $$;

-- Vista vw_reporte_movimientos_inventario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'tramboory' AND viewname = 'vw_reporte_movimientos_inventario') THEN
        CREATE VIEW vw_reporte_movimientos_inventario AS
        SELECT mi.id,
               mp.nombre       AS materia_prima,
               mi.tipo_movimiento,
               mi.cantidad,
               um.abreviatura  AS unidad,
               p.nombre        AS proveedor,
               r.id            AS id_reserva,
               tai.nombre      AS tipo_ajuste,
               u.nombre        AS usuario,
               oc.numero_orden AS orden_compra,
               mi.fecha,
               mi.descripcion
        FROM tramboory.movimientos_inventario mi
                 LEFT JOIN tramboory.materias_primas mp ON mi.id_materia_prima = mp.id
                 LEFT JOIN tramboory.unidades_medida um ON mp.id_unidad_medida = um.id
                 LEFT JOIN tramboory.proveedores p ON mi.id_proveedor = p.id
                 LEFT JOIN tramboory.reservas r ON mi.id_reserva = r.id
                 LEFT JOIN tramboory.tipos_ajuste_inventario tai ON mi.id_tipo_ajuste = tai.id
                 LEFT JOIN tramboory.usuarios u ON mi.id_usuario = u.id
                 LEFT JOIN tramboory.ordenes_compra oc ON mi.id_orden_compra = oc.id
        ORDER BY mi.fecha DESC;
    END IF;
END $$;

-- ==========================================
-- Creación de funciones
-- ==========================================

-- Función funcion_auditoria
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

-- Función validar_reserva
CREATE OR REPLACE FUNCTION validar_reserva() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar si existe una reserva confirmada que se solape con la nueva
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

-- Función aplicar_fee_martes
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

-- Función calcular_total_extras
CREATE OR REPLACE FUNCTION calcular_total_extras(p_id_reserva INTEGER) 
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

-- Función actualizar_total_reserva
CREATE OR REPLACE FUNCTION actualizar_total_reserva() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
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
    SELECT total INTO total_base
    FROM tramboory.reservas
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id_reserva
        ELSE NEW.id_reserva
    END;
    
    -- Actualizar el total en la tabla reservas
    UPDATE tramboory.reservas
    SET total = total_base + total_extras
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id_reserva
        ELSE NEW.id_reserva
    END;
    
    RETURN NULL;
END;
$$;

-- Función ajustar_fecha_reserva
CREATE OR REPLACE FUNCTION ajustar_fecha_reserva() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Asegurar que la fecha se guarde en la zona horaria correcta
    NEW.fecha_reserva := NEW.fecha_reserva::DATE;
    RETURN NEW;
END;
$$;

-- Función fn_actualizar_estado_pago
CREATE OR REPLACE FUNCTION fn_actualizar_estado_pago() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar fecha_actualizacion
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    
    -- Si el pago se marca como completado
    IF NEW.estado = 'completado' AND OLD.estado != 'completado' THEN
        -- Verificar si este pago completa el total de la reserva
        IF (
            SELECT COALESCE(SUM(monto), 0)
            FROM tramboory.pagos
            WHERE id_reserva = NEW.id_reserva
            AND estado = 'completado'
        ) >= (
            SELECT total
            FROM tramboory.reservas
            WHERE id = NEW.id_reserva
        ) THEN
            -- Actualizar estado de la reserva a confirmada
            UPDATE tramboory.reservas
            SET estado = 'confirmada'
            WHERE id = NEW.id_reserva;

            -- Crear registro en finanzas
            INSERT INTO tramboory.finanzas (
                id_reserva,
                tipo,
                monto,
                fecha,
                descripcion,
                id_usuario
            ) VALUES (
                NEW.id_reserva,
                'ingreso',
                NEW.monto,
                CURRENT_DATE,
                'Pago de reserva',
                (SELECT id_usuario FROM tramboory.reservas WHERE id = NEW.id_reserva)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Función actualizar_stock_reserva
CREATE OR REPLACE FUNCTION actualizar_stock_reserva() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.estado = 'confirmada' AND OLD.estado != 'confirmada' THEN
        -- Restar materias primas al confirmar reserva
        INSERT INTO tramboory.movimientos_inventario (id_materia_prima, id_reserva, tipo_movimiento, cantidad, id_usuario)
        SELECT oa.id_materia_prima, NEW.id, 'salida', oa.cantidad, NEW.id_usuario
        FROM tramboory.opciones_alimentos oa
        WHERE oa.id = NEW.id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;

        UPDATE tramboory.materias_primas mp
        SET stock_actual = stock_actual - oa.cantidad
        FROM tramboory.opciones_alimentos oa
        WHERE mp.id = oa.id_materia_prima 
        AND oa.id = NEW.id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;

    ELSIF NEW.estado = 'cancelada' AND OLD.estado = 'confirmada' THEN
        -- Devolver materias primas al cancelar reserva confirmada
        INSERT INTO tramboory.movimientos_inventario (id_materia_prima, id_reserva, tipo_movimiento, cantidad, id_usuario)
        SELECT oa.id_materia_prima, NEW.id, 'entrada', oa.cantidad, NEW.id_usuario
        FROM tramboory.opciones_alimentos oa
        WHERE oa.id = NEW.id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;

        UPDATE tramboory.materias_primas mp
        SET stock_actual = stock_actual + oa.cantidad
        FROM tramboory.opciones_alimentos oa
        WHERE mp.id = oa.id_materia_prima 
        AND oa.id = NEW.id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;
    END IF;

    RETURN NEW;
END;
$$;

-- Función actualizar_total_orden_compra
CREATE OR REPLACE FUNCTION actualizar_total_orden_compra() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar el total de la orden de compra
    UPDATE tramboory.ordenes_compra
    SET total_estimado = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM tramboory.detalle_orden_compra
        WHERE id_orden_compra = NEW.id_orden_compra
        AND activo = true
    )
    WHERE id = NEW.id_orden_compra;

    RETURN NEW;
END;
$$;

-- Función actualizar_stock_recepcion_orden
CREATE OR REPLACE FUNCTION actualizar_stock_recepcion_orden() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_tipo_ajuste INTEGER;
BEGIN
    -- Solo proceder si el estado cambió a 'recibida'
    IF NEW.estado = 'recibida' AND OLD.estado != 'recibida' THEN
        -- Obtener el id del tipo de ajuste para entrada de inventario
        SELECT id INTO v_id_tipo_ajuste
        FROM tramboory.tipos_ajuste_inventario
        WHERE nombre = 'Ajuste de inventario'
        LIMIT 1;

        -- Para cada detalle de la orden, crear un movimiento de inventario
        INSERT INTO tramboory.movimientos_inventario (
            id_materia_prima,
            id_proveedor,
            tipo_movimiento,
            cantidad,
            descripcion,
            id_usuario,
            id_tipo_ajuste,
            id_orden_compra
        )
        SELECT
            d.id_materia_prima,
            NEW.id_proveedor,
            'entrada',
            d.cantidad_recibida,
            'Recepción de orden de compra #' || NEW.numero_orden,
            NEW.id_usuario_autorizador,
            v_id_tipo_ajuste,
            NEW.id
        FROM tramboory.detalle_orden_compra d
        WHERE d.id_orden_compra = NEW.id
        AND d.cantidad_recibida > 0;

        -- Actualizar stock en materias primas
        UPDATE tramboory.materias_primas mp
        SET stock_actual = mp.stock_actual + d.cantidad_recibida
        FROM tramboory.detalle_orden_compra d
        WHERE mp.id = d.id_materia_prima
        AND d.id_orden_compra = NEW.id
        AND d.cantidad_recibida > 0;
    END IF;

    RETURN NEW;
END;
$$;

-- Función crear_alerta_stock_minimo
CREATE OR REPLACE FUNCTION crear_alerta_stock_minimo() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si el stock actual llega a ser menor que el stock mínimo
    IF NEW.stock_actual <= NEW.stock_minimo AND
       (OLD.stock_actual > OLD.stock_minimo OR OLD.stock_actual IS NULL) THEN

        -- Insertar alerta para cada administrador
        INSERT INTO tramboory.alertas_inventario (
            id_materia_prima,
            tipo_alerta,
            mensaje,
            id_usuario_destinatario
        )
        SELECT
            NEW.id,
            'stock_bajo',
            'La materia prima "' || NEW.nombre || '" ha llegado a su nivel mínimo de stock (' ||
            NEW.stock_actual || ' ' || um.abreviatura || ')',
            u.id
        FROM tramboory.usuarios u
        LEFT JOIN tramboory.unidades_medida um ON um.id = NEW.id_unidad_medida
        WHERE u.tipo_usuario = 'admin'
        AND u.activo = true;
    END IF;

    RETURN NEW;
END;
$$;

-- Función crear_alerta_caducidad
CREATE OR REPLACE FUNCTION crear_alerta_caducidad() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si la fecha de caducidad está a 7 días o menos
    IF NEW.fecha_caducidad IS NOT NULL AND
       NEW.fecha_caducidad <= (CURRENT_DATE + INTERVAL '7 days') AND
       (OLD.fecha_caducidad IS NULL OR OLD.fecha_caducidad > (CURRENT_DATE + INTERVAL '7 days')) THEN

        -- Insertar alerta para cada administrador
        INSERT INTO tramboory.alertas_inventario (
            id_materia_prima,
            tipo_alerta,
            mensaje,
            id_usuario_destinatario
        )
        SELECT
            NEW.id,
            'caducidad',
            'La materia prima "' || NEW.nombre || '" caducará el ' ||
            to_char(NEW.fecha_caducidad, 'DD/MM/YYYY'),
            u.id
        FROM tramboory.usuarios u
        WHERE u.tipo_usuario = 'admin'
        AND u.activo = true;
    END IF;

    RETURN NEW;
END;
$$;

-- Función crear_pago_para_reserva
CREATE OR REPLACE FUNCTION crear_pago_para_reserva() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Crear pago pendiente
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
        'pendiente'    -- estado inicial siempre pendiente
    );
    RETURN NEW;
END;
$$;

-- Función actualizar_estado_reserva_y_finanza
CREATE OR REPLACE FUNCTION actualizar_estado_reserva_y_finanza() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
DECLARE
    categoria_id INT;
BEGIN
    -- Solo procedemos si hay un cambio de estado
    IF OLD.estado <> NEW.estado THEN
        IF NEW.estado = 'completado' THEN
            -- Verificar si los pagos completan el total
            DECLARE
                total_pagado NUMERIC(10, 2);
                total_reserva NUMERIC(10, 2);
            BEGIN
                -- Calcular total pagado incluyendo este pago
                SELECT COALESCE(SUM(monto), 0) INTO total_pagado
                FROM tramboory.pagos
                WHERE id_reserva = NEW.id_reserva 
                AND estado = 'completado';

                -- Obtener total de la reserva
                SELECT total INTO total_reserva
                FROM tramboory.reservas
                WHERE id = NEW.id_reserva;

                -- Solo actualizar a confirmada si el total está cubierto
                IF total_pagado >= total_reserva THEN
                    -- Actualizar estado de la reserva a confirmada
                    UPDATE tramboory.reservas
                    SET estado = 'confirmada'
                    WHERE id = NEW.id_reserva;

                    -- Obtener o crear la categoría 'Reservación'
                    SELECT id INTO categoria_id
                    FROM tramboory.categorias
                    WHERE nombre = 'Reservación'
                    AND activo = true;

                    IF categoria_id IS NULL THEN
                        INSERT INTO tramboory.categorias(nombre, color, activo)
                        VALUES ('Reservación', '#000000', TRUE)
                        RETURNING id INTO categoria_id;
                    END IF;

                    -- Crear registro en finanzas
                    INSERT INTO tramboory.finanzas (
                        id_reserva,
                        tipo,
                        monto,
                        fecha,
                        descripcion,
                        id_usuario,
                        id_categoria
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
                        r.id_usuario,
                        categoria_id
                    FROM tramboory.reservas r
                    WHERE r.id = NEW.id_reserva;
                END IF;
            END;
        ELSIF NEW.estado = 'fallido' THEN
            -- Si el pago falla, verificar si hay otros pagos completados
            DECLARE
                total_pagado NUMERIC(10, 2);
            BEGIN
                SELECT COALESCE(SUM(monto), 0) INTO total_pagado
                FROM tramboory.pagos
                WHERE id_reserva = NEW.id_reserva 
                AND estado = 'completado'
                AND id != NEW.id;

                -- Si no hay otros pagos completados, volver a pendiente
                IF total_pagado = 0 THEN
                    UPDATE tramboory.reservas
                    SET estado = 'pendiente'
                    WHERE id = NEW.id_reserva;
                END IF;
            END;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Función fn_pre_validar_movimiento
CREATE OR REPLACE FUNCTION fn_pre_validar_movimiento() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
DECLARE
    stock_disponible NUMERIC(10,2);
BEGIN
    -- Verificar que la cantidad sea mayor que 0
    IF NEW.cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad de un movimiento debe ser mayor a 0.';
    END IF;

    -- Si es "salida", verificar que haya suficiente stock
    IF NEW.tipo_movimiento = 'salida' THEN
        SELECT stock_actual INTO stock_disponible
        FROM tramboory.materias_primas
        WHERE id = NEW.id_materia_prima FOR UPDATE;

        IF stock_disponible < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para la salida. Disponible=%, Requerido=%',
                stock_disponible, NEW.cantidad;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Función fn_ajustar_stock
CREATE OR REPLACE FUNCTION fn_ajustar_stock() 
RETURNS trigger 
LANGUAGE plpgsql
AS $$
DECLARE
    v_materia INT;
    v_cambio  NUMERIC(10,2);
    v_stock   NUMERIC(10,2);
    v_minimo  NUMERIC(10,2);
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_materia := NEW.id_materia_prima;
        IF NEW.tipo_movimiento = 'entrada' THEN
            v_cambio := +NEW.cantidad;
        ELSIF NEW.tipo_movimiento = 'salida' THEN
            v_cambio := -NEW.cantidad;
        ELSE
            v_cambio := 0;  -- 'ajuste' -> la lógica puede variar
        END IF;

        UPDATE tramboory.materias_primas
            SET stock_actual = stock_actual + v_cambio
            WHERE id = v_materia
            RETURNING stock_actual, stock_minimo INTO v_stock, v_minimo;

        IF v_stock < v_minimo THEN
            RAISE NOTICE '⚠️ Stock de materia prima % por debajo del mínimo: %.2f < %.2f',
                v_materia, v_stock, v_minimo;
        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Revertir efecto del movimiento anterior
        v_materia := OLD.id_materia_prima;

        IF OLD.tipo_movimiento = 'entrada' THEN
            v_cambio := -OLD.cantidad;
        ELSIF OLD.tipo_movimiento = 'salida' THEN
            v_cambio := +OLD.cantidad;
        ELSE
            v_cambio := 0;
        END IF;

        UPDATE tramboory.materias_primas
            SET stock_actual = stock_actual + v_cambio
            WHERE id = v_materia
            RETURNING stock_actual, stock_minimo INTO v_stock, v_minimo;

        -- Aplicar efecto del movimiento nuevo
        v_materia := NEW.id_materia_prima;
        IF NEW.tipo_movimiento = 'entrada' THEN
            v_cambio := +NEW.cantidad;
        ELSIF NEW.tipo_movimiento = 'salida' THEN
            v_cambio := -NEW.cantidad;
        ELSE
            v_cambio := 0;
        END IF;

        UPDATE tramboory.materias_primas
            SET stock_actual = stock_actual + v_cambio
            WHERE id = v_materia
            RETURNING stock_actual, stock_minimo INTO v_stock, v_minimo;

        IF v_stock < v_minimo THEN
            RAISE NOTICE '⚠️ Stock de materia prima % por debajo del mínimo: %.2f < %.2f',
                v_materia, v_stock, v_minimo;
        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Revertir el efecto del movimiento viejo
        v_materia := OLD.id_materia_prima;
        IF OLD.tipo_movimiento = 'entrada' THEN
            v_cambio := -OLD.cantidad;
        ELSIF OLD.tipo_movimiento = 'salida' THEN
            v_cambio := +OLD.cantidad;
        ELSE
            v_cambio := 0;
        END IF;

        UPDATE tramboory.materias_primas
            SET stock_actual = stock_actual + v_cambio
            WHERE id = v_materia
            RETURNING stock_actual, stock_minimo INTO v_stock, v_minimo;

        IF v_stock < v_minimo THEN
            RAISE NOTICE '⚠️ Stock de materia prima % por debajo del mínimo: %.2f < %.2f',
                v_materia, v_stock, v_minimo;
        END IF;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;

-- Función fn_validar_fecha_reserva
CREATE OR REPLACE FUNCTION fn_validar_fecha_reserva()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo aplicar la validación en operaciones INSERT
    IF TG_OP = 'INSERT' THEN
        -- Verificar que la fecha de reserva sea futura
        IF NEW.fecha_reserva < CURRENT_DATE THEN
            RAISE EXCEPTION 'La fecha de reserva debe ser igual o posterior a la fecha actual';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Creación de triggers
-- ==========================================

-- Triggers para auditoría
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_usuarios') THEN
        CREATE TRIGGER aud_usuarios
            AFTER INSERT OR UPDATE OR DELETE
            ON usuarios
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_reservas') THEN
        CREATE TRIGGER aud_reservas
            AFTER INSERT OR UPDATE OR DELETE
            ON reservas
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_finanzas') THEN
        CREATE TRIGGER aud_finanzas
            AFTER INSERT OR UPDATE OR DELETE
            ON finanzas
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_pagos') THEN
        CREATE TRIGGER aud_pagos
            AFTER INSERT OR UPDATE OR DELETE
            ON pagos
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_unidades_medida') THEN
        CREATE TRIGGER aud_unidades_medida
            AFTER INSERT OR UPDATE OR DELETE
            ON unidades_medida
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_conversiones_medida') THEN
        CREATE TRIGGER aud_conversiones_medida
            AFTER INSERT OR UPDATE OR DELETE
            ON conversiones_medida
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_tipos_ajuste_inventario') THEN
        CREATE TRIGGER aud_tipos_ajuste_inventario
            AFTER INSERT OR UPDATE OR DELETE
            ON tipos_ajuste_inventario
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_lotes') THEN
        CREATE TRIGGER aud_lotes
            AFTER INSERT OR UPDATE OR DELETE
            ON lotes
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_recetas_insumos') THEN
        CREATE TRIGGER aud_recetas_insumos
            AFTER INSERT OR UPDATE OR DELETE
            ON recetas_insumos
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_ordenes_compra') THEN
        CREATE TRIGGER aud_ordenes_compra
            AFTER INSERT OR UPDATE OR DELETE
            ON ordenes_compra
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_detalle_orden_compra') THEN
        CREATE TRIGGER aud_detalle_orden_compra
            AFTER INSERT OR UPDATE OR DELETE
            ON detalle_orden_compra
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'aud_alertas_inventario') THEN
        CREATE TRIGGER aud_alertas_inventario
            AFTER INSERT OR UPDATE OR DELETE
            ON alertas_inventario
            FOR EACH ROW
        EXECUTE PROCEDURE funcion_auditoria();
    END IF;
END $$;

-- Trigger para verificar reservas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'verificar_reserva') THEN
        CREATE TRIGGER verificar_reserva
            BEFORE INSERT OR UPDATE
            ON reservas
            FOR EACH ROW
        EXECUTE PROCEDURE validar_reserva();
    END IF;
END $$;

-- Trigger para el fee de martes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_fee_martes') THEN
        CREATE TRIGGER trigger_fee_martes
            BEFORE INSERT OR UPDATE
            ON reservas
            FOR EACH ROW
        EXECUTE PROCEDURE aplicar_fee_martes();
    END IF;
END $$;

-- Trigger para actualizar total de reserva
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_actualizar_total_reserva') THEN
        CREATE TRIGGER trigger_actualizar_total_reserva
            AFTER INSERT OR UPDATE OR DELETE
            ON reserva_extras
            FOR EACH ROW
        EXECUTE PROCEDURE actualizar_total_reserva();
    END IF;
END $$;

-- Trigger para ajustar fecha de reserva
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_ajustar_fecha_reserva') THEN
        CREATE TRIGGER trigger_ajustar_fecha_reserva
            BEFORE INSERT OR UPDATE
            ON reservas
            FOR EACH ROW
        EXECUTE PROCEDURE ajustar_fecha_reserva();
    END IF;
END $$;

-- Trigger para actualizar estado de pago
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_actualizar_estado_pago') THEN
        CREATE TRIGGER trigger_actualizar_estado_pago
            BEFORE UPDATE
            ON pagos
            FOR EACH ROW
        EXECUTE PROCEDURE fn_actualizar_estado_pago();
    END IF;
END $$;

-- Trigger para actualizar stock en reserva
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_actualizar_stock_reserva') THEN
        CREATE TRIGGER trg_actualizar_stock_reserva
            AFTER UPDATE
            ON reservas
            FOR EACH ROW
        EXECUTE PROCEDURE actualizar_stock_reserva();
    END IF;
END $$;

-- Trigger para actualizar total de orden de compra
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_actualizar_total_orden_compra') THEN
        CREATE TRIGGER trg_actualizar_total_orden_compra
            AFTER INSERT OR UPDATE OR DELETE
            ON detalle_orden_compra
            FOR EACH ROW
        EXECUTE PROCEDURE actualizar_total_orden_compra();
    END IF;
END $$;

-- Trigger para actualizar stock en recepción de orden
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_actualizar_stock_recepcion_orden') THEN
        CREATE TRIGGER trg_actualizar_stock_recepcion_orden
            AFTER UPDATE
            ON ordenes_compra
            FOR EACH ROW
            WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
        EXECUTE PROCEDURE actualizar_stock_recepcion_orden();
    END IF;
END $$;

-- Trigger para alerta de stock mínimo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_alerta_stock_minimo') THEN
        CREATE TRIGGER trg_alerta_stock_minimo
            AFTER UPDATE
            ON materias_primas
            FOR EACH ROW
            WHEN (NEW.stock_actual IS DISTINCT FROM OLD.stock_actual)
        EXECUTE PROCEDURE crear_alerta_stock_minimo();
    END IF;
END $$;

-- Triggers para alerta de caducidad
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_alerta_caducidad_insert') THEN
        CREATE TRIGGER trg_alerta_caducidad_insert
            AFTER INSERT
            ON materias_primas
            FOR EACH ROW
            WHEN (NEW.fecha_caducidad IS NOT NULL AND NEW.fecha_caducidad <= (CURRENT_DATE + INTERVAL '7 days'))
        EXECUTE PROCEDURE crear_alerta_caducidad();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_alerta_caducidad_update') THEN
        CREATE TRIGGER trg_alerta_caducidad_update
            AFTER UPDATE
            ON materias_primas
            FOR EACH ROW
            WHEN (NEW.fecha_caducidad IS DISTINCT FROM OLD.fecha_caducidad AND NEW.fecha_caducidad IS NOT NULL AND
                  NEW.fecha_caducidad <= (CURRENT_DATE + INTERVAL '7 days'))
        EXECUTE PROCEDURE crear_alerta_caducidad();
    END IF;
END $$;

-- Trigger para crear pago para reserva
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_crear_pago_reserva') THEN
        CREATE TRIGGER trigger_crear_pago_reserva
            AFTER INSERT
            ON reservas
            FOR EACH ROW
        EXECUTE PROCEDURE crear_pago_para_reserva();
    END IF;
END $$;

COMMENT ON TRIGGER trigger_crear_pago_reserva ON reservas IS 'Trigger que crea automáticamente un pago cuando se crea una reserva';

-- Trigger para actualizar estado de reserva y finanza
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_actualizar_estado_reserva_y_finanza') THEN
        CREATE TRIGGER trigger_actualizar_estado_reserva_y_finanza
            AFTER UPDATE
            ON pagos
            FOR EACH ROW
            WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
        EXECUTE PROCEDURE actualizar_estado_reserva_y_finanza();
    END IF;
END $$;

COMMENT ON TRIGGER trigger_actualizar_estado_reserva_y_finanza ON pagos IS 'Trigger que maneja los cambios de estado en pagos y sus efectos';

-- Trigger para validar movimiento
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pre_validar_mov_inventario') THEN
        CREATE TRIGGER trg_pre_validar_mov_inventario
            BEFORE INSERT OR UPDATE
            ON movimientos_inventario
            FOR EACH ROW
        EXECUTE PROCEDURE fn_pre_validar_movimiento();
    END IF;
END $$;

-- Trigger para ajustar stock
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_post_ajustar_stock') THEN
        CREATE TRIGGER trg_post_ajustar_stock
            AFTER INSERT OR UPDATE OR DELETE
            ON movimientos_inventario
            FOR EACH ROW
        EXECUTE PROCEDURE fn_ajustar_stock();
    END IF;
END $$;

-- Trigger para validar fecha reserva
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_validar_fecha_reserva') THEN
        CREATE TRIGGER trg_validar_fecha_reserva
            BEFORE INSERT ON reservas
            FOR EACH ROW 
        EXECUTE PROCEDURE fn_validar_fecha_reserva();
    END IF;
END $$;

-- ==========================================
-- SOLUCIÓN AL PROBLEMA DE LA RESTRICCIÓN
-- ==========================================

-- Eliminar la restricción que requiere que la fecha de reserva sea igual o superior a la fecha actual
-- Este check fue reemplazado por el trigger trg_validar_fecha_reserva que solo valida al insertar
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_fecha_reserva_check;

-- Confirmar la transacción
COMMIT;

-- Log para confirmar la ejecución exitosa
DO $$
BEGIN
    RAISE NOTICE 'Script de inicialización ejecutado correctamente.';
END $$;