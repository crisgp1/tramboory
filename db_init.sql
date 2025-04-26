-- Script consolidado para inicializar la base de datos Tramboory
-- Adaptado para entorno Docker

-- Crear la base de datos y los schemas
DROP DATABASE IF EXISTS tramboory;
CREATE DATABASE tramboory;
\c tramboory;

-- Crear los schemas
CREATE SCHEMA main;
CREATE SCHEMA inventory;

-- Asignar permisos al usuario postgres (por defecto en Docker)
ALTER SCHEMA main OWNER TO postgres;
ALTER SCHEMA inventory OWNER TO postgres;

-- Comentarios para documentación
COMMENT ON SCHEMA main IS 'Schema principal para gestión de usuarios, reservas, pagos y configuración general';
COMMENT ON SCHEMA inventory IS 'Schema para la gestión de inventario, materias primas, proveedores y órdenes de compra';

-- ENUMs para el schema main
CREATE TYPE main.enum_usuarios_tipo_usuario AS ENUM ('cliente', 'admin');
ALTER TYPE main.enum_usuarios_tipo_usuario OWNER TO postgres;

CREATE TYPE main.enum_reservas_estado AS ENUM ('pendiente', 'confirmada', 'cancelada');
ALTER TYPE main.enum_reservas_estado OWNER TO postgres;

CREATE TYPE main.enum_finanzas_tipo AS ENUM ('ingreso', 'gasto');
ALTER TYPE main.enum_finanzas_tipo OWNER TO postgres;

CREATE TYPE main.enum_pagos_estado AS ENUM ('pendiente', 'completado', 'fallido');
ALTER TYPE main.enum_pagos_estado OWNER TO postgres;

-- ENUMs para el schema main (continuación)
CREATE TYPE main.enum_turno AS ENUM ('manana', 'tarde', 'ambos');
ALTER TYPE main.enum_turno OWNER TO postgres;

-- ENUMs para el schema inventory
CREATE TYPE inventory.enum_ordenes_compra_estado AS ENUM ('pendiente', 'aprobada', 'recibida', 'cancelada');
ALTER TYPE inventory.enum_ordenes_compra_estado OWNER TO postgres;

CREATE TYPE inventory.enum_tipo_alerta AS ENUM ('stock_bajo', 'caducidad', 'vencimiento_proveedor', 'ajuste_requerido');
ALTER TYPE inventory.enum_tipo_alerta OWNER TO postgres;

-- Creación de tablas del schema inventory
CREATE TABLE inventory.proveedores (
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
ALTER TABLE inventory.proveedores OWNER TO postgres;

CREATE TABLE inventory.unidades_medida (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(50) NOT NULL UNIQUE,
    abreviatura         VARCHAR(10) NOT NULL UNIQUE,
    tipo                VARCHAR(20) NOT NULL
        CONSTRAINT unidades_medida_tipo_check
            CHECK (tipo = ANY (ARRAY['masa', 'volumen', 'unidad', 'longitud', 'area'])),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE inventory.unidades_medida OWNER TO postgres;

CREATE TABLE inventory.materias_primas (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    unidad_medida       VARCHAR(50) NOT NULL,
    stock_actual        NUMERIC(10, 2) DEFAULT 0
        CONSTRAINT materias_primas_stock_actual_check
            CHECK (stock_actual >= 0),
    stock_minimo        NUMERIC(10, 2) DEFAULT 0
        CONSTRAINT materias_primas_stock_minimo_check
            CHECK (stock_minimo >= 0),
    costo_unitario      NUMERIC(10, 2) DEFAULT 0
        CONSTRAINT materias_primas_costo_unitario_check
            CHECK (costo_unitario >= 0),
    fecha_caducidad     DATE,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_unidad_medida    INTEGER REFERENCES inventory.unidades_medida,
    proveedor_id        INTEGER REFERENCES inventory.proveedores ON UPDATE CASCADE ON DELETE RESTRICT
);
ALTER TABLE inventory.materias_primas OWNER TO postgres;

CREATE TABLE inventory.paquetes_alimentos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);
ALTER TABLE inventory.paquetes_alimentos OWNER TO postgres;

CREATE TABLE inventory.conversiones_medida (
    id_unidad_origen    INTEGER NOT NULL REFERENCES inventory.unidades_medida ON DELETE RESTRICT,
    id_unidad_destino   INTEGER NOT NULL REFERENCES inventory.unidades_medida ON DELETE RESTRICT,
    factor_conversion   NUMERIC(15, 6) NOT NULL
        CONSTRAINT conversiones_medida_factor_conversion_check
            CHECK (factor_conversion > 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_unidad_origen, id_unidad_destino)
);
ALTER TABLE inventory.conversiones_medida OWNER TO postgres;
CREATE INDEX idx_conversiones_origen ON inventory.conversiones_medida (id_unidad_origen);
CREATE INDEX idx_conversiones_destino ON inventory.conversiones_medida (id_unidad_destino);

CREATE TABLE inventory.tipos_ajuste_inventario (
    id                    SERIAL PRIMARY KEY,
    nombre                VARCHAR(50) NOT NULL UNIQUE,
    descripcion           TEXT,
    afecta_costos         BOOLEAN DEFAULT TRUE,
    requiere_autorizacion BOOLEAN DEFAULT FALSE,
    activo                BOOLEAN DEFAULT TRUE,
    fecha_creacion        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE inventory.tipos_ajuste_inventario OWNER TO postgres;

CREATE TABLE inventory.lotes (
    id                  SERIAL PRIMARY KEY,
    id_materia_prima    INTEGER NOT NULL REFERENCES inventory.materias_primas ON DELETE RESTRICT,
    codigo_lote         VARCHAR(50) NOT NULL,
    fecha_produccion    DATE,
    fecha_caducidad     DATE,
    cantidad_inicial    NUMERIC(10, 2) NOT NULL
        CONSTRAINT lotes_cantidad_inicial_check
            CHECK (cantidad_inicial > 0),
    cantidad_actual     NUMERIC(10, 2) NOT NULL,
    costo_unitario      NUMERIC(10, 2) NOT NULL
        CONSTRAINT lotes_costo_unitario_check
            CHECK (costo_unitario >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_lote_materia_codigo UNIQUE (id_materia_prima, codigo_lote),
    CONSTRAINT ck_lotes_cantidad_actual_valida CHECK (cantidad_actual >= 0 AND cantidad_actual <= cantidad_inicial)
);
ALTER TABLE inventory.lotes OWNER TO postgres;
CREATE INDEX idx_lotes_materia_prima ON inventory.lotes (id_materia_prima);
CREATE INDEX idx_lotes_caducidad ON inventory.lotes (fecha_caducidad);

CREATE TABLE inventory.ordenes_compra (
    id                     SERIAL PRIMARY KEY,
    id_proveedor           INTEGER NOT NULL REFERENCES inventory.proveedores ON DELETE RESTRICT,
    numero_orden           VARCHAR(50) NOT NULL UNIQUE,
    fecha_solicitud        DATE DEFAULT CURRENT_DATE NOT NULL,
    fecha_entrega_esperada DATE,
    estado                 inventory.enum_ordenes_compra_estado DEFAULT 'pendiente' NOT NULL,
    total_estimado         NUMERIC(12, 2) DEFAULT 0 NOT NULL
        CONSTRAINT ordenes_compra_total_estimado_check
            CHECK (total_estimado >= 0),
    notas                  TEXT,
    id_usuario_creador     INTEGER NOT NULL,  -- Referencia a main.usuarios
    id_usuario_autorizador INTEGER,           -- Referencia a main.usuarios
    fecha_autorizacion     TIMESTAMP,
    activo                 BOOLEAN DEFAULT TRUE,
    fecha_creacion         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE inventory.ordenes_compra OWNER TO postgres;
CREATE INDEX idx_ordenes_compra_proveedor ON inventory.ordenes_compra (id_proveedor);
CREATE INDEX idx_ordenes_compra_estado ON inventory.ordenes_compra (estado);
CREATE INDEX idx_ordenes_compra_fecha ON inventory.ordenes_compra (fecha_solicitud);

-- Creación de tablas del schema main
CREATE TABLE main.usuarios (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    email               VARCHAR(100) NOT NULL UNIQUE,
    clave_hash          VARCHAR(255) NOT NULL,
    telefono            VARCHAR(20),
    direccion           TEXT,
    tipo_usuario        main.enum_usuarios_tipo_usuario NOT NULL,
    id_personalizado    VARCHAR(100),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE main.usuarios OWNER TO postgres;

CREATE TABLE main.registro_auditoria (
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
ALTER TABLE main.registro_auditoria OWNER TO postgres;

CREATE TABLE main.auditoria (
    id              SERIAL PRIMARY KEY,
    id_usuario      INTEGER NOT NULL REFERENCES main.usuarios ON DELETE CASCADE,
    nombre_usuario  VARCHAR(100) NOT NULL,
    fecha_operacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transaccion     TEXT NOT NULL
);
ALTER TABLE main.auditoria OWNER TO postgres;

CREATE TABLE main.categorias (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL UNIQUE,
    color               VARCHAR(7) DEFAULT '#000000' NOT NULL
        CONSTRAINT categorias_color_check
            CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE main.categorias OWNER TO postgres;

CREATE TABLE main.extras (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio              NUMERIC(10, 2) NOT NULL
        CONSTRAINT extras_precio_check
            CHECK (precio >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE main.extras OWNER TO postgres;

CREATE TABLE main.paquetes (
    id                     SERIAL PRIMARY KEY,
    nombre                 VARCHAR(100) NOT NULL,
    descripcion            TEXT,
    precio_lunes_jueves    NUMERIC(10, 2) NOT NULL
        CONSTRAINT paquetes_precio_lunes_jueves_check
            CHECK (precio_lunes_jueves >= 0),
    precio_viernes_domingo NUMERIC(10, 2) NOT NULL
        CONSTRAINT paquetes_precio_viernes_domingo_check
            CHECK (precio_viernes_domingo >= 0),
    id_paquete_alimento    INTEGER REFERENCES inventory.paquetes_alimentos,
    activo                 BOOLEAN DEFAULT TRUE,
    fecha_creacion         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE main.paquetes OWNER TO postgres;
CREATE INDEX idx_paquetes_paquete_alimento ON main.paquetes (id_paquete_alimento);

CREATE TABLE main.tematicas (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    foto                VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE main.tematicas OWNER TO postgres;

CREATE TABLE main.mamparas (
    id                  SERIAL PRIMARY KEY,
    id_tematica         INTEGER NOT NULL REFERENCES main.tematicas ON DELETE RESTRICT,
    piezas              INTEGER NOT NULL
        CONSTRAINT mamparas_piezas_check
            CHECK (piezas > 0),
    precio              NUMERIC(10, 2) NOT NULL
        CONSTRAINT mamparas_precio_check
            CHECK (precio >= 0),
    foto                VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE main.mamparas OWNER TO postgres;
CREATE INDEX idx_mamparas_tematica ON main.mamparas (id_tematica);

-- Añadimos opciones_alimentos al schema main
CREATE TABLE main.opciones_alimentos (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    descripcion         TEXT,
    precio_extra        NUMERIC(10, 2) NOT NULL
        CONSTRAINT opciones_alimentos_precio_extra_check
            CHECK (precio_extra >= 0),
    disponible          BOOLEAN DEFAULT TRUE,
    turno               main.enum_turno DEFAULT 'ambos',
    platillo_adulto     VARCHAR(100) NOT NULL,
    platillo_nino       VARCHAR(100) NOT NULL,
    opcion_papas        BOOLEAN DEFAULT FALSE,
    precio_papas        NUMERIC(10, 2) DEFAULT 19.00
        CONSTRAINT opciones_alimentos_precio_papas_check
            CHECK (precio_papas >= 0),
    precio_adulto       NUMERIC(10, 2) DEFAULT 0.00
        CONSTRAINT opciones_alimentos_precio_adulto_check
            CHECK (precio_adulto >= 0),
    precio_nino         NUMERIC(10, 2) DEFAULT 0.00
        CONSTRAINT opciones_alimentos_precio_nino_check
            CHECK (precio_nino >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_materia_prima    INTEGER REFERENCES inventory.materias_primas,
    cantidad            NUMERIC(10, 2) DEFAULT 1
);
ALTER TABLE main.opciones_alimentos OWNER TO postgres;

CREATE TABLE main.reservas (
    id                  SERIAL PRIMARY KEY,
    id_usuario          INTEGER NOT NULL REFERENCES main.usuarios ON DELETE CASCADE,
    id_paquete          INTEGER NOT NULL REFERENCES main.paquetes,
    id_opcion_alimento  INTEGER REFERENCES main.opciones_alimentos,
    id_mampara          INTEGER NOT NULL REFERENCES main.mamparas,
    id_tematica         INTEGER NOT NULL REFERENCES main.tematicas,
    fecha_reserva       DATE NOT NULL,
    estado              main.enum_reservas_estado DEFAULT 'pendiente' NOT NULL,
    total               NUMERIC(10, 2) NOT NULL
        CONSTRAINT reservas_total_check
            CHECK (total >= 0),
    nombre_festejado    VARCHAR(100) NOT NULL,
    edad_festejado      INTEGER NOT NULL
        CONSTRAINT reservas_edad_festejado_check
            CHECK (edad_festejado > 0),
    comentarios         TEXT,
    hora_inicio         TIME NOT NULL,
    hora_fin            TIME NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horario_valido CHECK (hora_fin > hora_inicio)
);
ALTER TABLE main.reservas OWNER TO postgres;
CREATE INDEX idx_reservas_fecha ON main.reservas (fecha_reserva);
CREATE INDEX idx_reservas_usuario ON main.reservas (id_usuario);
CREATE INDEX idx_reservas_paquete ON main.reservas (id_paquete);
CREATE INDEX idx_reservas_opcion_alimento ON main.reservas (id_opcion_alimento);
CREATE INDEX idx_reservas_mampara ON main.reservas (id_mampara);
CREATE INDEX idx_reservas_tematica ON main.reservas (id_tematica);
CREATE INDEX idx_reservas_estado ON main.reservas (id, estado);
CREATE UNIQUE INDEX idx_reservas_horario ON main.reservas (fecha_reserva, hora_inicio, hora_fin)
    WHERE (estado <> 'cancelada');

CREATE TABLE main.reserva_extras (
    id_reserva          INTEGER NOT NULL REFERENCES main.reservas ON DELETE CASCADE,
    id_extra            INTEGER NOT NULL REFERENCES main.extras ON DELETE CASCADE,
    cantidad            INTEGER DEFAULT 1 NOT NULL
        CONSTRAINT reserva_extras_cantidad_check
            CHECK (cantidad > 0),
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_reserva, id_extra)
);
ALTER TABLE main.reserva_extras OWNER TO postgres;
CREATE INDEX idx_reserva_extras_reserva ON main.reserva_extras (id_reserva);
CREATE INDEX idx_reserva_extras_extra ON main.reserva_extras (id_extra);

CREATE TABLE main.pagos (
    id                  SERIAL PRIMARY KEY,
    id_reserva          INTEGER NOT NULL REFERENCES main.reservas,
    monto               NUMERIC(10, 2) NOT NULL
        CONSTRAINT pagos_monto_check
            CHECK (monto > 0),
    fecha_pago          DATE NOT NULL,
    estado              main.enum_pagos_estado DEFAULT 'pendiente' NOT NULL,
    metodo_pago         VARCHAR(50),
    referencia_pago     VARCHAR(100),
    es_pago_parcial     BOOLEAN DEFAULT FALSE,
    notas               TEXT,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE main.pagos OWNER TO postgres;
CREATE INDEX idx_pagos_fecha ON main.pagos (fecha_pago);
CREATE INDEX idx_pagos_reserva ON main.pagos (id_reserva);
CREATE INDEX idx_pagos_compuesto ON main.pagos (id_reserva, estado, fecha_pago);
CREATE INDEX idx_pagos_reserva_estado ON main.pagos (id_reserva, estado);
CREATE INDEX idx_pagos_reserva_estado_fecha ON main.pagos (id_reserva, estado, fecha_pago);

CREATE TABLE main.finanzas (
    id                  SERIAL PRIMARY KEY,
    id_reserva          INTEGER REFERENCES main.reservas,
    tipo                main.enum_finanzas_tipo NOT NULL,
    monto               NUMERIC(10, 2) NOT NULL
        CONSTRAINT finanzas_monto_check
            CHECK (monto > 0),
    fecha               DATE NOT NULL,
    descripcion         TEXT,
    factura_pdf         VARCHAR(255),
    factura_xml         VARCHAR(255),
    archivo_prueba      VARCHAR(255),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_categoria        INTEGER REFERENCES main.categorias,
    id_usuario          INTEGER NOT NULL REFERENCES main.usuarios ON DELETE CASCADE,
    id_materia_prima    INTEGER REFERENCES inventory.materias_primas
);
ALTER TABLE main.finanzas OWNER TO postgres;
CREATE INDEX idx_finanzas_fecha ON main.finanzas (fecha);
CREATE INDEX idx_finanzas_reserva ON main.finanzas (id_reserva);
CREATE INDEX idx_finanzas_categoria ON main.finanzas (id_categoria);

CREATE TABLE main.galeria_home (
    id                  SERIAL PRIMARY KEY,
    imagen_url          VARCHAR(255) NOT NULL,
    cloudinary_id       VARCHAR(100),
    descripcion         TEXT,
    orden               INTEGER NOT NULL,
    activo              BOOLEAN DEFAULT TRUE,
    es_promocion        BOOLEAN DEFAULT FALSE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE main.galeria_home OWNER TO postgres;

CREATE TABLE inventory.detalle_orden_compra (
    id                  SERIAL PRIMARY KEY,
    id_orden_compra     INTEGER NOT NULL REFERENCES inventory.ordenes_compra ON DELETE CASCADE,
    id_materia_prima    INTEGER NOT NULL REFERENCES inventory.materias_primas ON DELETE RESTRICT,
    cantidad            NUMERIC(10, 2) NOT NULL
        CONSTRAINT detalle_orden_compra_cantidad_check
            CHECK (cantidad > 0),
    id_unidad_medida    INTEGER NOT NULL REFERENCES inventory.unidades_medida ON DELETE RESTRICT,
    precio_unitario     NUMERIC(10, 2) NOT NULL
        CONSTRAINT detalle_orden_compra_precio_unitario_check
            CHECK (precio_unitario >= 0),
    subtotal            NUMERIC(12, 2) NOT NULL
        CONSTRAINT detalle_orden_compra_subtotal_check
            CHECK (subtotal >= 0),
    cantidad_recibida   NUMERIC(10, 2) DEFAULT 0
        CONSTRAINT detalle_orden_compra_cantidad_recibida_check
            CHECK (cantidad_recibida >= 0),
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_detalle_orden_materia UNIQUE (id_orden_compra, id_materia_prima)
);
ALTER TABLE inventory.detalle_orden_compra OWNER TO postgres;
CREATE INDEX idx_detalle_orden_compra ON inventory.detalle_orden_compra (id_orden_compra);
CREATE INDEX idx_detalle_materia_prima ON inventory.detalle_orden_compra (id_materia_prima);

CREATE TABLE inventory.alertas_inventario (
    id                      SERIAL PRIMARY KEY,
    id_materia_prima        INTEGER REFERENCES inventory.materias_primas ON DELETE CASCADE,
    tipo_alerta             inventory.enum_tipo_alerta NOT NULL,
    mensaje                 TEXT NOT NULL,
    fecha_alerta            TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    leida                   BOOLEAN DEFAULT FALSE,
    fecha_lectura           TIMESTAMP,
    id_usuario_destinatario INTEGER, -- Referencia a main.usuarios
    activo                  BOOLEAN DEFAULT TRUE,
    fecha_creacion          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE inventory.alertas_inventario OWNER TO postgres;
CREATE INDEX idx_alertas_materia_prima ON inventory.alertas_inventario (id_materia_prima);
CREATE INDEX idx_alertas_tipo ON inventory.alertas_inventario (tipo_alerta);
CREATE INDEX idx_alertas_leida ON inventory.alertas_inventario (leida);
CREATE INDEX idx_alertas_usuario ON inventory.alertas_inventario (id_usuario_destinatario);

CREATE TABLE inventory.recetas_insumos (
    id_opcion_alimento  INTEGER NOT NULL REFERENCES main.opciones_alimentos ON DELETE CASCADE,
    id_materia_prima    INTEGER NOT NULL REFERENCES inventory.materias_primas ON DELETE RESTRICT,
    cantidad_requerida  NUMERIC(10, 3) NOT NULL
        CONSTRAINT recetas_insumos_cantidad_requerida_check
            CHECK (cantidad_requerida > 0),
    id_unidad_medida    INTEGER NOT NULL REFERENCES inventory.unidades_medida ON DELETE RESTRICT,
    activo              BOOLEAN DEFAULT TRUE,
    fecha_creacion      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_opcion_alimento, id_materia_prima)
);
ALTER TABLE inventory.recetas_insumos OWNER TO postgres;
CREATE INDEX idx_recetas_opcion_alimento ON inventory.recetas_insumos (id_opcion_alimento);
CREATE INDEX idx_recetas_materia_prima ON inventory.recetas_insumos (id_materia_prima);

-- Ahora podemos crear la tabla movimientos_inventario que depende de tablas en ambos schemas
CREATE TABLE inventory.movimientos_inventario (
    id               SERIAL PRIMARY KEY,
    id_materia_prima INTEGER NOT NULL REFERENCES inventory.materias_primas ON UPDATE CASCADE ON DELETE RESTRICT,
    id_proveedor     INTEGER REFERENCES inventory.proveedores ON UPDATE CASCADE ON DELETE RESTRICT,
    id_reserva       INTEGER REFERENCES main.reservas,
    tipo_movimiento  VARCHAR(20) NOT NULL
        CONSTRAINT movimientos_inventario_tipo_movimiento_check
            CHECK (tipo_movimiento = ANY (ARRAY['entrada', 'salida', 'ajuste'])),
    cantidad         NUMERIC(10, 2) NOT NULL
        CONSTRAINT movimientos_inventario_cantidad_check
            CHECK (cantidad <> 0),
    fecha            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion      TEXT,
    id_usuario       INTEGER NOT NULL REFERENCES main.usuarios ON UPDATE CASCADE ON DELETE RESTRICT,
    id_tipo_ajuste   INTEGER REFERENCES inventory.tipos_ajuste_inventario,
    id_lote          INTEGER REFERENCES inventory.lotes ON DELETE RESTRICT,
    id_orden_compra  INTEGER REFERENCES inventory.ordenes_compra ON DELETE RESTRICT
);
ALTER TABLE inventory.movimientos_inventario OWNER TO postgres;

-- Establecemos las referencias pendientes en ordenes_compra
ALTER TABLE inventory.ordenes_compra ADD CONSTRAINT fk_usuario_creador 
    FOREIGN KEY (id_usuario_creador) REFERENCES main.usuarios(id) ON DELETE RESTRICT;
ALTER TABLE inventory.ordenes_compra ADD CONSTRAINT fk_usuario_autorizador
    FOREIGN KEY (id_usuario_autorizador) REFERENCES main.usuarios(id) ON DELETE RESTRICT;

-- Establecemos las referencias pendientes en alertas_inventario
ALTER TABLE inventory.alertas_inventario ADD CONSTRAINT fk_usuario_destinatario
    FOREIGN KEY (id_usuario_destinatario) REFERENCES main.usuarios(id) ON DELETE SET NULL;

-- Ahora podemos crear las vistas que dependen de tablas en ambos schemas
CREATE VIEW inventory.vw_reporte_inventario AS
SELECT mp.id,
       mp.nombre,
       mp.unidad_medida,
       mp.stock_actual,
       mp.stock_minimo,
       mp.fecha_caducidad,
       CASE
           WHEN mp.fecha_caducidad < CURRENT_DATE THEN 'Caducado'
           WHEN mp.fecha_caducidad >= CURRENT_DATE AND mp.fecha_caducidad <= (CURRENT_DATE + '7 days'::interval) THEN 'Por caducar'
           ELSE 'Vigente'
       END AS estado_caducidad
FROM inventory.materias_primas mp;
ALTER TABLE inventory.vw_reporte_inventario OWNER TO postgres;

CREATE VIEW inventory.vw_reporte_caducidades AS
SELECT mp.id,
       mp.nombre,
       mp.unidad_medida,
       mp.stock_actual,
       mp.fecha_caducidad,
       CASE
           WHEN mp.fecha_caducidad < CURRENT_DATE THEN 'Caducado'
           WHEN mp.fecha_caducidad <= (CURRENT_DATE + '7 days'::interval) THEN 'Próximo a caducar'
           WHEN mp.fecha_caducidad <= (CURRENT_DATE + '30 days'::interval) THEN 'Caducidad próxima'
           ELSE 'Vigente'
       END AS estado_caducidad,
       CASE
           WHEN mp.fecha_caducidad < CURRENT_DATE THEN 1
           WHEN mp.fecha_caducidad <= (CURRENT_DATE + '7 days'::interval) THEN 2
           WHEN mp.fecha_caducidad <= (CURRENT_DATE + '30 days'::interval) THEN 3
           ELSE 4
       END AS prioridad_alerta
FROM inventory.materias_primas mp
WHERE mp.activo = true AND mp.fecha_caducidad IS NOT NULL
ORDER BY (
    CASE
        WHEN mp.fecha_caducidad < CURRENT_DATE THEN 1
        WHEN mp.fecha_caducidad <= (CURRENT_DATE + '7 days'::interval) THEN 2
        WHEN mp.fecha_caducidad <= (CURRENT_DATE + '30 days'::interval) THEN 3
        ELSE 4
    END), mp.fecha_caducidad;
ALTER TABLE inventory.vw_reporte_caducidades OWNER TO postgres;

CREATE VIEW inventory.vw_reporte_stock_bajo AS
SELECT mp.id,
       mp.nombre,
       mp.unidad_medida,
       mp.stock_actual,
       mp.stock_minimo,
       um.abreviatura AS unidad_abreviada,
       CASE
           WHEN mp.stock_actual = 0::numeric THEN 'Sin existencias'
           WHEN mp.stock_actual <= (mp.stock_minimo * 0.5) THEN 'Crítico'
           WHEN mp.stock_actual <= mp.stock_minimo THEN 'Bajo'
           ELSE 'Normal'
       END AS estado_stock,
       CASE
           WHEN mp.stock_actual = 0::numeric THEN 1
           WHEN mp.stock_actual <= (mp.stock_minimo * 0.5) THEN 2
           WHEN mp.stock_actual <= mp.stock_minimo THEN 3
           ELSE 4
       END AS prioridad_alerta
FROM inventory.materias_primas mp
LEFT JOIN inventory.unidades_medida um ON um.id = mp.id_unidad_medida
WHERE mp.activo = true
ORDER BY (
    CASE
        WHEN mp.stock_actual = 0::numeric THEN 1
        WHEN mp.stock_actual <= (mp.stock_minimo * 0.5) THEN 2
        WHEN mp.stock_actual <= mp.stock_minimo THEN 3
        ELSE 4
    END), mp.stock_actual;
ALTER TABLE inventory.vw_reporte_stock_bajo OWNER TO postgres;

CREATE VIEW inventory.vw_reporte_movimientos_inventario AS
SELECT mi.id,
       mp.nombre AS materia_prima,
       mi.tipo_movimiento,
       mi.cantidad,
       um.abreviatura AS unidad,
       p.nombre AS proveedor,
       r.id AS id_reserva,
       tai.nombre AS tipo_ajuste,
       u.nombre AS usuario,
       oc.numero_orden AS orden_compra,
       mi.fecha,
       mi.descripcion
FROM inventory.movimientos_inventario mi
LEFT JOIN inventory.materias_primas mp ON mi.id_materia_prima = mp.id
LEFT JOIN inventory.unidades_medida um ON mp.id_unidad_medida = um.id
LEFT JOIN inventory.proveedores p ON mi.id_proveedor = p.id
LEFT JOIN main.reservas r ON mi.id_reserva = r.id
LEFT JOIN inventory.tipos_ajuste_inventario tai ON mi.id_tipo_ajuste = tai.id
LEFT JOIN main.usuarios u ON mi.id_usuario = u.id
LEFT JOIN inventory.ordenes_compra oc ON mi.id_orden_compra = oc.id
ORDER BY mi.fecha DESC;
ALTER TABLE inventory.vw_reporte_movimientos_inventario OWNER TO postgres;

-- Función de auditoría común a ambos schemas
CREATE OR REPLACE FUNCTION main.funcion_auditoria() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO main.registro_auditoria(
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
        INSERT INTO main.registro_auditoria(
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
        INSERT INTO main.registro_auditoria(
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
$$ LANGUAGE plpgsql;
ALTER FUNCTION main.funcion_auditoria() OWNER TO postgres;

-- Triggers de auditoría para las tablas principales
CREATE TRIGGER aud_usuarios
    AFTER INSERT OR UPDATE OR DELETE
    ON main.usuarios
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_unidades_medida
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.unidades_medida
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_reservas
    AFTER INSERT OR UPDATE OR DELETE
    ON main.reservas
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_finanzas
    AFTER INSERT OR UPDATE OR DELETE
    ON main.finanzas
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_pagos
    AFTER INSERT OR UPDATE OR DELETE
    ON main.pagos
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_conversiones_medida
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.conversiones_medida
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_tipos_ajuste_inventario
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.tipos_ajuste_inventario
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_lotes
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.lotes
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_recetas_insumos
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.recetas_insumos
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_ordenes_compra
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.ordenes_compra
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_detalle_orden_compra
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.detalle_orden_compra
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

CREATE TRIGGER aud_alertas_inventario
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.alertas_inventario
    FOR EACH ROW
    EXECUTE PROCEDURE main.funcion_auditoria();

-- Funciones y triggers específicos para reservas
CREATE OR REPLACE FUNCTION main.validar_reserva() RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si existe una reserva confirmada que se solape con la nueva
    IF EXISTS (
        SELECT 1
        FROM main.reservas r
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
$$ LANGUAGE plpgsql;
ALTER FUNCTION main.validar_reserva() OWNER TO postgres;

CREATE TRIGGER verificar_reserva
    BEFORE INSERT OR UPDATE
    ON main.reservas
    FOR EACH ROW
    EXECUTE PROCEDURE main.validar_reserva();

CREATE OR REPLACE FUNCTION main.aplicar_fee_martes() RETURNS TRIGGER AS $$
BEGIN
    -- Si es martes (dow=2), se suma 1500 al total
    IF EXTRACT(DOW FROM NEW.fecha_reserva) = 2 THEN
        NEW.total := NEW.total + 1500;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION main.aplicar_fee_martes() OWNER TO postgres;

CREATE TRIGGER trigger_fee_martes
    BEFORE INSERT OR UPDATE
    ON main.reservas
    FOR EACH ROW
    EXECUTE PROCEDURE main.aplicar_fee_martes();

CREATE OR REPLACE FUNCTION main.calcular_total_extras(p_id_reserva INTEGER) RETURNS NUMERIC AS $$
DECLARE
    total_extras DECIMAL;
BEGIN
    SELECT COALESCE(SUM(e.precio * re.cantidad), 0)
    INTO total_extras
    FROM main.reserva_extras re
    JOIN main.extras e ON e.id = re.id_extra
    WHERE re.id_reserva = p_id_reserva;
    
    RETURN total_extras;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION main.calcular_total_extras(INTEGER) OWNER TO postgres;

CREATE OR REPLACE FUNCTION main.actualizar_total_reserva() RETURNS TRIGGER AS $$
DECLARE
    total_extras DECIMAL;
    total_base DECIMAL;
BEGIN
    -- Calcular el total de extras
    total_extras := main.calcular_total_extras(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id_reserva
            ELSE NEW.id_reserva
        END
    );
    
    -- Obtener el total base de la reserva (sin extras)
    SELECT total INTO total_base
    FROM main.reservas
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id_reserva
        ELSE NEW.id_reserva
    END;
    
    -- Actualizar el total en la tabla reservas
    UPDATE main.reservas
    SET total = total_base + total_extras
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id_reserva
        ELSE NEW.id_reserva
    END;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION main.actualizar_total_reserva() OWNER TO postgres;

CREATE TRIGGER trigger_actualizar_total_reserva
    AFTER INSERT OR UPDATE OR DELETE
    ON main.reserva_extras
    FOR EACH ROW
    EXECUTE PROCEDURE main.actualizar_total_reserva();

CREATE OR REPLACE FUNCTION main.ajustar_fecha_reserva() RETURNS TRIGGER AS $$
BEGIN
    -- Asegurar que la fecha se guarde en la zona horaria correcta
    NEW.fecha_reserva := NEW.fecha_reserva::DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION main.ajustar_fecha_reserva() OWNER TO postgres;

CREATE TRIGGER trigger_ajustar_fecha_reserva
    BEFORE INSERT OR UPDATE
    ON main.reservas
    FOR EACH ROW
    EXECUTE PROCEDURE main.ajustar_fecha_reserva();

CREATE OR REPLACE FUNCTION main.fn_actualizar_estado_pago() RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar fecha_actualizacion
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    
    -- Si el pago se marca como completado
    IF NEW.estado = 'completado' AND OLD.estado != 'completado' THEN
        -- Verificar si este pago completa el total de la reserva
        IF (
            SELECT COALESCE(SUM(monto), 0)
            FROM main.pagos
            WHERE id_reserva = NEW.id_reserva
            AND estado = 'completado'
        ) >= (
            SELECT total
            FROM main.reservas
            WHERE id = NEW.id_reserva
        ) THEN
            -- Actualizar estado de la reserva a confirmada
            UPDATE main.reservas
            SET estado = 'confirmada'
            WHERE id = NEW.id_reserva;

            -- Crear registro en finanzas
            INSERT INTO main.finanzas (
                id_reserva,
                tipo,
                monto,
                descripcion,
                fecha,
                activo,
                fecha_creacion,
                fecha_actualizacion,
                id_usuario
            ) 
            SELECT
                NEW.id_reserva,
                'ingreso',
                NEW.monto,
                'Pago de reserva',
                CURRENT_DATE,
                true,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                r.id_usuario
            FROM main.reservas r
            WHERE r.id = NEW.id_reserva;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION main.fn_actualizar_estado_pago() OWNER TO postgres;

CREATE TRIGGER trigger_actualizar_estado_pago
    BEFORE UPDATE
    ON main.pagos
    FOR EACH ROW
    EXECUTE PROCEDURE main.fn_actualizar_estado_pago();

-- Funciones para gestión de inventario
CREATE OR REPLACE FUNCTION inventory.actualizar_stock_reserva() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'confirmada' AND OLD.estado != 'confirmada' THEN
        -- Restar materias primas al confirmar reserva
        INSERT INTO inventory.movimientos_inventario (id_materia_prima, id_reserva, tipo_movimiento, cantidad, id_usuario)
        SELECT oa.id_materia_prima, NEW.id, 'salida', oa.cantidad, NEW.id_usuario
        FROM main.opciones_alimentos oa
        WHERE oa.id = NEW.id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;

        UPDATE inventory.materias_primas mp
        SET stock_actual = stock_actual - oa.cantidad
        FROM main.opciones_alimentos oa
        WHERE mp.id = oa.id_materia_prima 
        AND oa.id = NEW.id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;

    ELSIF NEW.estado = 'cancelada' AND OLD.estado = 'confirmada' THEN
        -- Devolver materias primas al cancelar reserva confirmada
        INSERT INTO inventory.movimientos_inventario (id_materia_prima, id_reserva, tipo_movimiento, cantidad, id_usuario)
        SELECT oa.id_materia_prima, NEW.id, 'entrada', oa.cantidad, NEW.id_usuario
        FROM main.opciones_alimentos oa
        WHERE oa.id = NEW.id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;

        UPDATE inventory.materias_primas mp
        SET stock_actual = stock_actual + oa.cantidad
        FROM main.opciones_alimentos oa
        WHERE mp.id = oa.id_materia_prima 
        AND oa.id = NEW.id_opcion_alimento
        AND oa.id_materia_prima IS NOT NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION inventory.actualizar_stock_reserva() OWNER TO postgres;

CREATE TRIGGER trg_actualizar_stock_reserva
    AFTER UPDATE
    ON main.reservas
    FOR EACH ROW
    EXECUTE PROCEDURE inventory.actualizar_stock_reserva();

CREATE OR REPLACE FUNCTION inventory.actualizar_total_orden_compra() RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el total de la orden de compra
    UPDATE inventory.ordenes_compra
    SET total_estimado = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM inventory.detalle_orden_compra
        WHERE id_orden_compra = 
            CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.id_orden_compra
                ELSE NEW.id_orden_compra
            END
        AND activo = true
    )
    WHERE id = 
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id_orden_compra
            ELSE NEW.id_orden_compra
        END;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION inventory.actualizar_total_orden_compra() OWNER TO postgres;

CREATE TRIGGER trg_actualizar_total_orden_compra
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.detalle_orden_compra
    FOR EACH ROW
    EXECUTE PROCEDURE inventory.actualizar_total_orden_compra();

CREATE OR REPLACE FUNCTION inventory.actualizar_stock_recepcion_orden() RETURNS TRIGGER AS $$
DECLARE
    v_id_tipo_ajuste INTEGER;
BEGIN
    -- Solo proceder si el estado cambió a 'recibida'
    IF NEW.estado = 'recibida' AND OLD.estado != 'recibida' THEN
        -- Obtener el id del tipo de ajuste para entrada de inventario
        SELECT id INTO v_id_tipo_ajuste
        FROM inventory.tipos_ajuste_inventario
        WHERE nombre = 'Ajuste de inventario'
        LIMIT 1;

        -- Para cada detalle de la orden, crear un movimiento de inventario
        INSERT INTO inventory.movimientos_inventario (
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
        FROM inventory.detalle_orden_compra d
        WHERE d.id_orden_compra = NEW.id
        AND d.cantidad_recibida > 0;

        -- Actualizar stock en materias primas
        UPDATE inventory.materias_primas mp
        SET stock_actual = mp.stock_actual + d.cantidad_recibida
        FROM inventory.detalle_orden_compra d
        WHERE mp.id = d.id_materia_prima
        AND d.id_orden_compra = NEW.id
        AND d.cantidad_recibida > 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION inventory.actualizar_stock_recepcion_orden() OWNER TO postgres;

CREATE TRIGGER trg_actualizar_stock_recepcion_orden
    AFTER UPDATE
    ON inventory.ordenes_compra
    FOR EACH ROW
    WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
    EXECUTE PROCEDURE inventory.actualizar_stock_recepcion_orden();

CREATE OR REPLACE FUNCTION inventory.crear_alerta_stock_minimo() RETURNS TRIGGER AS $$
BEGIN
    -- Si el stock actual llega a ser menor que el stock mínimo
    IF NEW.stock_actual <= NEW.stock_minimo AND
       (OLD.stock_actual > OLD.stock_minimo OR OLD.stock_actual IS NULL) THEN

        -- Insertar alerta para cada administrador
        INSERT INTO inventory.alertas_inventario (
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
        FROM main.usuarios u
        LEFT JOIN inventory.unidades_medida um ON um.id = NEW.id_unidad_medida
        WHERE u.tipo_usuario = 'admin'
        AND u.activo = true;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION inventory.crear_alerta_stock_minimo() OWNER TO postgres;

CREATE TRIGGER trg_alerta_stock_minimo
    AFTER UPDATE
    ON inventory.materias_primas
    FOR EACH ROW
    WHEN (NEW.stock_actual IS DISTINCT FROM OLD.stock_actual)
    EXECUTE PROCEDURE inventory.crear_alerta_stock_minimo();

CREATE OR REPLACE FUNCTION inventory.crear_alerta_caducidad() RETURNS TRIGGER AS $$
BEGIN
    -- Si la fecha de caducidad está a 7 días o menos
    IF NEW.fecha_caducidad IS NOT NULL AND
       NEW.fecha_caducidad <= (CURRENT_DATE + INTERVAL '7 days') AND
       (OLD.fecha_caducidad IS NULL OR OLD.fecha_caducidad > (CURRENT_DATE + INTERVAL '7 days')) THEN

        -- Insertar alerta para cada administrador
        INSERT INTO inventory.alertas_inventario (
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
        FROM main.usuarios u
        WHERE u.tipo_usuario = 'admin'
        AND u.activo = true;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION inventory.crear_alerta_caducidad() OWNER TO postgres;

CREATE TRIGGER trg_alerta_caducidad_insert
    AFTER INSERT
    ON inventory.materias_primas
    FOR EACH ROW
    WHEN (NEW.fecha_caducidad IS NOT NULL AND NEW.fecha_caducidad <= (CURRENT_DATE + '7 days'::INTERVAL))
    EXECUTE PROCEDURE inventory.crear_alerta_caducidad();

CREATE TRIGGER trg_alerta_caducidad_update
    AFTER UPDATE
    ON inventory.materias_primas
    FOR EACH ROW
    WHEN (NEW.fecha_caducidad IS DISTINCT FROM OLD.fecha_caducidad AND NEW.fecha_caducidad IS NOT NULL AND
          NEW.fecha_caducidad <= (CURRENT_DATE + '7 days'::INTERVAL))
    EXECUTE PROCEDURE inventory.crear_alerta_caducidad();

CREATE OR REPLACE FUNCTION inventory.fn_pre_validar_movimiento() RETURNS TRIGGER AS $$
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
        FROM inventory.materias_primas
        WHERE id = NEW.id_materia_prima FOR UPDATE;

        IF stock_disponible < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para la salida. Disponible=%, Requerido=%',
                stock_disponible, NEW.cantidad;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
ALTER FUNCTION inventory.fn_pre_validar_movimiento() OWNER TO postgres;

CREATE TRIGGER trg_pre_validar_mov_inventario
    BEFORE INSERT OR UPDATE
    ON inventory.movimientos_inventario
    FOR EACH ROW
    EXECUTE PROCEDURE inventory.fn_pre_validar_movimiento();

CREATE OR REPLACE FUNCTION inventory.fn_ajustar_stock() RETURNS TRIGGER AS $$
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

        UPDATE inventory.materias_primas
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

        UPDATE inventory.materias_primas
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

        UPDATE inventory.materias_primas
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

        UPDATE inventory.materias_primas
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
$$ LANGUAGE plpgsql;
ALTER FUNCTION inventory.fn_ajustar_stock() OWNER TO postgres;

CREATE TRIGGER trg_post_ajustar_stock
    AFTER INSERT OR UPDATE OR DELETE
    ON inventory.movimientos_inventario
    FOR EACH ROW
    EXECUTE PROCEDURE inventory.fn_ajustar_stock();

-- Funciones adicionales para reservas
CREATE OR REPLACE FUNCTION main.fn_validar_fecha_reserva() RETURNS TRIGGER AS $$
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
ALTER FUNCTION main.fn_validar_fecha_reserva() OWNER TO postgres;

CREATE TRIGGER trg_validar_fecha_reserva
    BEFORE INSERT
    ON main.reservas
    FOR EACH ROW
    EXECUTE PROCEDURE main.fn_validar_fecha_reserva();

-- Funciones para la gestión de pagos
CREATE OR REPLACE FUNCTION main.crear_pago_para_reserva() RETURNS TRIGGER AS $$
BEGIN
    -- Crear pago pendiente
    INSERT INTO main.pagos (
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
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION main.crear_pago_para_reserva() IS 'Crea automáticamente un pago pendiente cuando se crea una nueva reserva';
ALTER FUNCTION main.crear_pago_para_reserva() OWNER TO postgres;

CREATE TRIGGER trigger_crear_pago_reserva
    AFTER INSERT
    ON main.reservas
    FOR EACH ROW
    EXECUTE PROCEDURE main.crear_pago_para_reserva();
COMMENT ON TRIGGER trigger_crear_pago_reserva ON main.reservas IS 'Trigger que crea automáticamente un pago cuando se crea una reserva';

CREATE OR REPLACE FUNCTION main.actualizar_estado_reserva_y_finanza() RETURNS TRIGGER AS $$
DECLARE
    categoria_id INT;
BEGIN
    -- Solo procedemos si hay un cambio de estado
    IF OLD.estado <> NEW.estado THEN
        IF NEW.estado = 'completado' THEN
            -- Actualizar estado de la reserva a confirmada
            UPDATE main.reservas
            SET estado = 'confirmada'
            WHERE id = NEW.id_reserva;

            -- Obtener o crear la categoría 'Reservación'
            SELECT id INTO categoria_id
            FROM main.categorias
            WHERE nombre = 'Reservación'
            AND activo = true;

            IF categoria_id IS NULL THEN
                INSERT INTO main.categorias(nombre, color, activo)
                VALUES ('Reservación', '#000000', TRUE)
                RETURNING id INTO categoria_id;
            END IF;

            -- Crear registro en finanzas
            INSERT INTO main.finanzas (
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
                r.total,
                CURRENT_DATE,
                'Pago de reserva ' || r.id,
                r.id_usuario,
                categoria_id
            FROM main.reservas r
            WHERE r.id = NEW.id_reserva;

        ELSIF NEW.estado = 'fallido' THEN
            -- Si el pago falla, la reserva vuelve a pendiente
            UPDATE main.reservas
            SET estado = 'pendiente'
            WHERE id = NEW.id_reserva;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION main.actualizar_estado_reserva_y_finanza() IS 'Maneja los cambios de estado en pagos y sus efectos en reservas y finanzas';
ALTER FUNCTION main.actualizar_estado_reserva_y_finanza() OWNER TO postgres;

CREATE TRIGGER trigger_actualizar_estado_reserva_y_finanza
    AFTER UPDATE
    ON main.pagos
    FOR EACH ROW
    WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
    EXECUTE PROCEDURE main.actualizar_estado_reserva_y_finanza();
COMMENT ON TRIGGER trigger_actualizar_estado_reserva_y_finanza ON main.pagos IS 'Trigger que maneja los cambios de estado en pagos y sus efectos';