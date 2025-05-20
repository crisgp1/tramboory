-- ==========================================
-- init_supabase_optimizado.sql
-- Diseñado específicamente para Supabase
-- Manteniendo schemas originales pero optimizado para RLS y PostgREST
-- ==========================================

-- Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar search_path para incluir todos los schemas
SET search_path TO public, main, finanzas, inventario, auth;

-- ==========================================
-- Creación de schemas
-- ==========================================
CREATE SCHEMA IF NOT EXISTS main;
CREATE SCHEMA IF NOT EXISTS finanzas;
CREATE SCHEMA IF NOT EXISTS inventario;
-- No creamos schema seguridad porque usamos Supabase Auth

-- ==========================================
-- Definición de tipos ENUM
-- ==========================================
DO $$
BEGIN
    -- Schema main
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'estado_reserva' AND n.nspname = 'main') THEN
        CREATE TYPE main.estado_reserva AS ENUM (
            'pendiente',           -- Reserva creada, esperando anticipo
            'anticipo_pagado',     -- Anticipo recibido
            'confirmada',          -- Pago completo recibido
            'cancelada',           -- Reserva cancelada
            'completada'           -- Evento realizado exitosamente
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'tipo_turno' AND n.nspname = 'main') THEN
        CREATE TYPE main.tipo_turno AS ENUM ('manana', 'tarde', 'ambos');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'tipo_notificacion' AND n.nspname = 'main') THEN
        CREATE TYPE main.tipo_notificacion AS ENUM ('reserva', 'pago', 'recordatorio', 'inventario', 'sistema');
    END IF;

    -- Schema finanzas
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'estado_pago' AND n.nspname = 'finanzas') THEN
        CREATE TYPE finanzas.estado_pago AS ENUM ('pendiente', 'completado', 'fallido', 'reembolsado', 'parcial_reembolsado');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'metodo_pago' AND n.nspname = 'finanzas') THEN
        CREATE TYPE finanzas.metodo_pago AS ENUM ('efectivo', 'transferencia_spei');
    END IF;

    -- Tipos para roles de usuario
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'rol_usuario' AND n.nspname = 'public') THEN
        CREATE TYPE public.rol_usuario AS ENUM ('cliente', 'admin', 'inventario', 'finanzas');
    END IF;
END
$$;

-- ==========================================
-- Tabla PROFILES - Extiende auth.users
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text NOT NULL,
    nombre_completo text,
    telefono text,
    direccion text,
    rol rol_usuario DEFAULT 'cliente' NOT NULL,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL,
    
    -- Metadata flexible
    metadatos jsonb DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT profiles_telefono_check CHECK (telefono ~ '^\+?[0-9\-\s\(\)]{10,}$'),
    CONSTRAINT profiles_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Los admins pueden gestionar todos los perfiles"
    ON public.profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol = 'admin'
        )
    );

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, nombre_completo)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'nombre_completo', new.email)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para creación de nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SCHEMA MAIN - Tablas principales
-- ==========================================

-- Tabla paquetes
CREATE TABLE IF NOT EXISTS main.paquetes (
    id serial PRIMARY KEY,
    nombre text NOT NULL,
    descripcion text,
    precio_lunes_jueves numeric(10,2) NOT NULL CHECK (precio_lunes_jueves >= 0),
    precio_viernes_domingo numeric(10,2) NOT NULL CHECK (precio_viernes_domingo >= 0),
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL,
    
    -- Características como JSONB
    caracteristicas jsonb DEFAULT '[]',
    CONSTRAINT paquetes_caracteristicas_schema CHECK (
        jsonb_matches_schema(
            '{"type": "array", "items": {"type": "string"}}',
            caracteristicas
        )
    )
);

-- Tabla tematicas
CREATE TABLE IF NOT EXISTS main.tematicas (
    id serial PRIMARY KEY,
    nombre text NOT NULL,
    descripcion text,
    url_imagen text,
    colores jsonb,
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL,
    
    -- Validación para colores
    CONSTRAINT tematicas_colores_check CHECK (
        colores IS NULL OR
        jsonb_matches_schema(
            '{"type": "object", "properties": {"primario": {"type": "string"}, "secundario": {"type": "string"}}}',
            colores
        )
    )
);

-- Tabla mamparas
CREATE TABLE IF NOT EXISTS main.mamparas (
    id serial PRIMARY KEY,
    id_tematica integer NOT NULL REFERENCES main.tematicas(id) ON DELETE CASCADE,
    piezas integer NOT NULL CHECK (piezas > 0),
    precio numeric(10,2) NOT NULL CHECK (precio >= 0),
    url_imagen text,
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL
);

-- Tabla opciones_alimentos
CREATE TABLE IF NOT EXISTS main.opciones_alimentos (
    id serial PRIMARY KEY,
    nombre text NOT NULL,
    descripcion text,
    precio_extra numeric(10,2) DEFAULT 0 CHECK (precio_extra >= 0),
    disponible boolean DEFAULT true,
    turno main.tipo_turno DEFAULT 'ambos',
    platillo_adulto text NOT NULL,
    platillo_nino text NOT NULL,
    incluye_papas boolean DEFAULT false,
    precio_papas numeric(10,2) DEFAULT 19.00,
    precio_adulto numeric(10,2) DEFAULT 0,
    precio_nino numeric(10,2) DEFAULT 0,
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL,
    
    -- Ingredientes como JSONB
    ingredientes jsonb DEFAULT '[]',
    CONSTRAINT opciones_alimentos_ingredientes_schema CHECK (
        jsonb_matches_schema(
            '{"type": "array", "items": {"type": "object", "properties": {"nombre": {"type": "string"}, "cantidad": {"type": "number"}}}}',
            ingredientes
        )
    )
);

-- Tabla extras
CREATE TABLE IF NOT EXISTS main.extras (
    id serial PRIMARY KEY,
    nombre text NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL CHECK (precio >= 0),
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL,
    
    -- Metadatos como JSONB
    metadatos jsonb DEFAULT '{}'
);

-- Función para generar código de seguimiento
CREATE OR REPLACE FUNCTION generate_tracking_code()
RETURNS text AS $$
DECLARE
    codigo text;
    existe boolean;
BEGIN
    LOOP
        codigo := upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
        
        SELECT EXISTS(SELECT 1 FROM main.reservas WHERE codigo_seguimiento = codigo) INTO existe;
        
        EXIT WHEN NOT existe;
    END LOOP;
    
    RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- Tabla reservas (principal)
CREATE TABLE IF NOT EXISTS main.reservas (
    id serial PRIMARY KEY,
    id_usuario uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_paquete integer NOT NULL REFERENCES main.paquetes(id),
    id_opcion_alimento integer REFERENCES main.opciones_alimentos(id),
    id_mampara integer NOT NULL REFERENCES main.mamparas(id),
    id_tematica integer NOT NULL REFERENCES main.tematicas(id),
    
    -- Información de seguimiento
    codigo_seguimiento text UNIQUE NOT NULL DEFAULT generate_tracking_code(),
    fecha_evento date NOT NULL,
    hora_inicio time NOT NULL,
    hora_fin time NOT NULL,
    
    -- Información del festejado
    nombre_festejado text NOT NULL,
    edad_festejado integer NOT NULL CHECK (edad_festejado > 0),
    genero_festejado text,
    comentarios text,
    
    -- Información de pago
    total numeric(10,2) NOT NULL CHECK (total >= 0),
    monto_anticipo numeric(10,2) NOT NULL,
    monto_pagado numeric(10,2) DEFAULT 0 CHECK (monto_pagado >= 0),
    
    -- Fechas límite
    fecha_limite_anticipo timestamptz NOT NULL,
    fecha_limite_pago timestamptz NOT NULL,
    
    -- Estado y control
    estado main.estado_reserva DEFAULT 'pendiente' NOT NULL,
    cancelable boolean DEFAULT true,
    motivo_cancelacion text,
    
    -- Información del cliente y evento como JSONB
    info_cliente jsonb DEFAULT '{}',
    detalles_evento jsonb DEFAULT '{}',
    
    -- Metadatos de auditoría
    ip_cliente inet,
    agente_usuario text,
    
    -- Timestamps
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL,
    
    -- Constraints
    CONSTRAINT reservas_horario_valido CHECK (hora_fin > hora_inicio),
    CONSTRAINT reservas_anticipo_valido CHECK (monto_anticipo <= total),
    CONSTRAINT reservas_monto_pagado_valido CHECK (monto_pagado <= total),
    CONSTRAINT reservas_fecha_futura CHECK (fecha_evento >= CURRENT_DATE)
);

-- Índices optimizados para reservas
CREATE INDEX idx_reservas_usuario ON main.reservas (id_usuario);
CREATE INDEX idx_reservas_codigo ON main.reservas (codigo_seguimiento);
CREATE INDEX idx_reservas_fecha_estado ON main.reservas (fecha_evento, estado);
CREATE INDEX idx_reservas_fechas_limite ON main.reservas (fecha_limite_anticipo, fecha_limite_pago);
CREATE INDEX idx_reservas_busqueda ON main.reservas USING gin (info_cliente, detalles_evento);

-- Habilitar RLS en reservas
ALTER TABLE main.reservas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para reservas
CREATE POLICY "Los usuarios pueden ver sus propias reservas"
    ON main.reservas FOR SELECT
    USING (auth.uid() = id_usuario);

CREATE POLICY "Los usuarios pueden crear sus propias reservas"
    ON main.reservas FOR INSERT
    WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Los usuarios pueden actualizar sus reservas pendientes"
    ON main.reservas FOR UPDATE
    USING (auth.uid() = id_usuario AND estado IN ('pendiente', 'anticipo_pagado'));

CREATE POLICY "Los admins pueden gestionar todas las reservas"
    ON main.reservas FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'finanzas')
        )
    );

-- Tabla reserva_extras (muchos a muchos)
CREATE TABLE IF NOT EXISTS main.reserva_extras (
    id_reserva integer REFERENCES main.reservas(id) ON DELETE CASCADE,
    id_extra integer REFERENCES main.extras(id) ON DELETE CASCADE,
    cantidad integer DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario numeric(10,2), -- Precio al momento de la reserva
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    
    PRIMARY KEY (id_reserva, id_extra)
);

-- Tabla notificaciones
CREATE TABLE IF NOT EXISTS main.notificaciones (
    id serial PRIMARY KEY,
    id_usuario uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_reserva integer REFERENCES main.reservas(id) ON DELETE SET NULL,
    tipo main.tipo_notificacion NOT NULL,
    titulo text NOT NULL,
    mensaje text NOT NULL,
    canal text DEFAULT 'email',
    leida boolean DEFAULT false,
    fecha_lectura timestamptz,
    
    -- Metadatos como JSONB
    metadatos jsonb DEFAULT '{}',
    
    fecha_creacion timestamptz DEFAULT now() NOT NULL
);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario_no_leidas ON main.notificaciones (id_usuario, leida, fecha_creacion);
CREATE INDEX idx_notificaciones_tipo ON main.notificaciones (tipo, fecha_creacion);

-- ==========================================
-- SCHEMA FINANZAS - Gestión financiera
-- ==========================================

-- Tabla categorias
CREATE TABLE IF NOT EXISTS finanzas.categorias (
    id serial PRIMARY KEY,
    nombre text NOT NULL UNIQUE,
    color text DEFAULT '#000000' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL
);

-- Tabla pagos
CREATE TABLE IF NOT EXISTS finanzas.pagos (
    id serial PRIMARY KEY,
    id_reserva integer NOT NULL REFERENCES main.reservas(id) ON DELETE CASCADE,
    monto numeric(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago date NOT NULL DEFAULT CURRENT_DATE,
    estado finanzas.estado_pago DEFAULT 'pendiente' NOT NULL,
    metodo finanzas.metodo_pago NOT NULL,
    es_anticipo boolean DEFAULT false NOT NULL,
    
    -- Detalles del pago (flexible con JSONB)
    detalles_pago jsonb DEFAULT '{}',
    
    -- Referencias externas
    id_externo text, -- ID de pasarela de pago
    url_comprobante text,
    referencia text,
    notas text,
    
    -- Auditoría
    creado_por uuid REFERENCES auth.users(id),
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL,
    
    -- Validación de esquema JSON
    CONSTRAINT pagos_detalles_schema CHECK (
        jsonb_matches_schema(
            '{"type": "object", "properties": {"banco": {"type": "string"}, "referencia_bancaria": {"type": "string"}}}',
            detalles_pago
        )
    )
);

-- Índices para pagos
CREATE INDEX idx_pagos_reserva ON finanzas.pagos (id_reserva);
CREATE INDEX idx_pagos_estado_fecha ON finanzas.pagos (estado, fecha_pago);
CREATE INDEX idx_pagos_externo ON finanzas.pagos (id_externo) WHERE id_externo IS NOT NULL;

-- Tabla reembolsos
CREATE TABLE IF NOT EXISTS finanzas.reembolsos (
    id serial PRIMARY KEY,
    id_pago integer NOT NULL REFERENCES finanzas.pagos(id) ON DELETE CASCADE,
    monto_reembolso numeric(10,2) NOT NULL CHECK (monto_reembolso > 0),
    fecha_reembolso date NOT NULL DEFAULT CURRENT_DATE,
    motivo text NOT NULL,
    referencia text,
    id_transaccion text,
    estado finanzas.estado_pago DEFAULT 'pendiente' NOT NULL,
    id_usuario uuid NOT NULL REFERENCES auth.users(id),
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL
);

-- Tabla finanzas (registro general)
CREATE TABLE IF NOT EXISTS finanzas.finanzas (
    id serial PRIMARY KEY,
    id_reserva integer REFERENCES main.reservas(id) ON DELETE SET NULL,
    tipo text NOT NULL CHECK (tipo IN ('ingreso', 'gasto', 'reembolso')),
    monto numeric(10,2) NOT NULL CHECK (monto > 0),
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    descripcion text,
    id_categoria integer REFERENCES finanzas.categorias(id),
    id_usuario uuid NOT NULL REFERENCES auth.users(id),
    id_pago integer REFERENCES finanzas.pagos(id),
    id_transaccion text,
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- SCHEMA INVENTARIO - Gestión de inventario
-- ==========================================

-- Tabla materias_primas
CREATE TABLE IF NOT EXISTS inventario.materias_primas (
    id serial PRIMARY KEY,
    nombre text NOT NULL,
    descripcion text,
    unidad_medida text NOT NULL,
    stock_actual numeric(10,2) DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo numeric(10,2) DEFAULT 0 CHECK (stock_minimo >= 0),
    costo_unitario numeric(10,2) DEFAULT 0 CHECK (costo_unitario >= 0),
    vida_util_dias integer,
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL,
    
    -- Propiedades adicionales como JSONB
    propiedades jsonb DEFAULT '{}'
);

-- Tabla movimientos_inventario
CREATE TABLE IF NOT EXISTS inventario.movimientos_inventario (
    id serial PRIMARY KEY,
    id_materia_prima integer NOT NULL REFERENCES inventario.materias_primas(id) ON DELETE CASCADE,
    id_reserva integer REFERENCES main.reservas(id) ON DELETE SET NULL,
    tipo_movimiento text NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste')),
    cantidad numeric(10,2) NOT NULL,
    fecha timestamptz DEFAULT now() NOT NULL,
    descripcion text,
    id_usuario uuid NOT NULL REFERENCES auth.users(id)
);

-- Tabla reservas_inventario
CREATE TABLE IF NOT EXISTS inventario.reservas_inventario (
    id serial PRIMARY KEY,
    id_materia_prima integer NOT NULL REFERENCES inventario.materias_primas(id) ON DELETE CASCADE,
    id_reserva integer NOT NULL REFERENCES main.reservas(id) ON DELETE CASCADE,
    cantidad numeric(10,2) NOT NULL CHECK (cantidad > 0),
    fecha_evento date NOT NULL,
    estado text DEFAULT 'proyectada' CHECK (estado IN ('proyectada', 'confirmada', 'consumida', 'cancelada')),
    activo boolean DEFAULT true,
    fecha_creacion timestamptz DEFAULT now() NOT NULL,
    fecha_actualizacion timestamptz DEFAULT now() NOT NULL
);

-- ==========================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ==========================================

-- Schema main
ALTER TABLE main.paquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE main.tematicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE main.mamparas ENABLE ROW LEVEL SECURITY;
ALTER TABLE main.opciones_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE main.extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE main.reserva_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE main.notificaciones ENABLE ROW LEVEL SECURITY;

-- Schema finanzas
ALTER TABLE finanzas.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.finanzas ENABLE ROW LEVEL SECURITY;

-- Schema inventario
ALTER TABLE inventario.materias_primas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario.movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario.reservas_inventario ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS RLS PARA ACCESO PÚBLICO
-- ==========================================

-- Acceso de lectura público para datos activos
CREATE POLICY "Lectura pública para paquetes activos"
    ON main.paquetes FOR SELECT
    USING (activo = true);

CREATE POLICY "Lectura pública para temáticas activas"
    ON main.tematicas FOR SELECT
    USING (activo = true);

CREATE POLICY "Lectura pública para mamparas activas"
    ON main.mamparas FOR SELECT
    USING (activo = true);

CREATE POLICY "Lectura pública para opciones de alimentos activas"
    ON main.opciones_alimentos FOR SELECT
    USING (activo = true);

CREATE POLICY "Lectura pública para extras activos"
    ON main.extras FOR SELECT
    USING (activo = true);

-- ==========================================
-- POLÍTICAS RLS PARA ADMINISTRADORES
-- ==========================================

-- Políticas para administradores en schema main
CREATE POLICY "Los admins pueden gestionar paquetes"
    ON main.paquetes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin')
        )
    );

CREATE POLICY "Los admins pueden gestionar temáticas"
    ON main.tematicas FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin')
        )
    );

CREATE POLICY "Los admins pueden gestionar mamparas"
    ON main.mamparas FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin')
        )
    );

CREATE POLICY "Los admins pueden gestionar opciones de alimentos"
    ON main.opciones_alimentos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin')
        )
    );

CREATE POLICY "Los admins pueden gestionar extras"
    ON main.extras FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin')
        )
    );

-- Políticas para reserva_extras
CREATE POLICY "Los usuarios pueden gestionar extras de sus reservas"
    ON main.reserva_extras FOR ALL
    USING (
        id_reserva IN (
            SELECT id FROM main.reservas WHERE id_usuario = auth.uid()
        )
    );

-- Políticas para notificaciones
CREATE POLICY "Los usuarios pueden gestionar sus notificaciones"
    ON main.notificaciones FOR ALL
    USING (auth.uid() = id_usuario);

-- ==========================================
-- POLÍTICAS RLS PARA FINANZAS (CORREGIDAS)
-- ==========================================

-- Solo admins y finanzas pueden ver categorías
CREATE POLICY "Personal autorizado puede gestionar categorías"
    ON finanzas.categorias FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'finanzas')
        )
    );

-- Los usuarios pueden ver pagos de sus reservas
CREATE POLICY "Los usuarios pueden ver pagos de sus reservas"
    ON finanzas.pagos FOR SELECT
    USING (
        id_reserva IN (
            SELECT id FROM main.reservas WHERE id_usuario = auth.uid()
        )
    );

-- Solo personal autorizado puede crear pagos
CREATE POLICY "Personal autorizado puede crear pagos"
    ON finanzas.pagos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'finanzas')
        )
    );

-- Solo personal autorizado puede actualizar pagos
CREATE POLICY "Personal autorizado puede actualizar pagos"
    ON finanzas.pagos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'finanzas')
        )
    );

-- Solo personal autorizado puede eliminar pagos
CREATE POLICY "Personal autorizado puede eliminar pagos"
    ON finanzas.pagos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'finanzas')
        )
    );

-- Solo personal autorizado puede ver reembolsos
CREATE POLICY "Personal autorizado puede gestionar reembolsos"
    ON finanzas.reembolsos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'finanzas')
        )
    );

-- Personal autorizado puede ver todas las finanzas
CREATE POLICY "Personal autorizado puede gestionar finanzas"
    ON finanzas.finanzas FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'finanzas')
        )
    );

-- ==========================================
-- POLÍTICAS RLS PARA INVENTARIO
-- ==========================================

-- Solo personal autorizado puede gestionar inventario
CREATE POLICY "Personal autorizado puede gestionar materias primas"
    ON inventario.materias_primas FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'inventario')
        )
    );

CREATE POLICY "Personal autorizado puede ver movimientos de inventario"
    ON inventario.movimientos_inventario FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'inventario')
        )
    );

CREATE POLICY "Personal autorizado puede gestionar reservas de inventario"
    ON inventario.reservas_inventario FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND rol IN ('admin', 'inventario')
        )
    );

-- ==========================================
-- VISTAS OPTIMIZADAS PARA SUPABASE
-- ==========================================

-- Vista resumen de reservas
CREATE OR REPLACE VIEW main.vw_resumen_reservas AS
SELECT
    r.*,
    p.nombre_completo as nombre_cliente,
    p.email as email_cliente,
    p.telefono as telefono_cliente,
    pkg.nombre as nombre_paquete,
    t.nombre as nombre_tematica,
    oa.nombre as nombre_opcion_alimento,
    
    -- Campos calculados
    (r.total - r.monto_pagado) as saldo_pendiente,
    CASE 
        WHEN r.estado = 'pendiente' AND r.fecha_limite_anticipo < now() THEN 'anticipo_vencido'
        WHEN r.estado = 'anticipo_pagado' AND r.fecha_limite_pago < now() THEN 'pago_vencido'
        ELSE r.estado::text
    END as estado_extendido,
    
    -- Agregaciones JSON
    (
        SELECT coalesce(json_agg(json_build_object(
            'nombre', e.nombre,
            'cantidad', re.cantidad,
            'precio_unitario', re.precio_unitario
        )), '[]')
        FROM main.reserva_extras re
        JOIN main.extras e ON re.id_extra = e.id
        WHERE re.id_reserva = r.id
    ) as extras,
    
    (
        SELECT coalesce(json_agg(json_build_object(
            'monto', monto,
            'metodo', metodo,
            'estado', estado,
            'fecha', fecha_pago,
            'es_anticipo', es_anticipo
        )), '[]')
        FROM finanzas.pagos pago
        WHERE pago.id_reserva = r.id
    ) as pagos
    
FROM main.reservas r
LEFT JOIN public.profiles p ON r.id_usuario = p.id
LEFT JOIN main.paquetes pkg ON r.id_paquete = pkg.id
LEFT JOIN main.tematicas t ON r.id_tematica = t.id
LEFT JOIN main.opciones_alimentos oa ON r.id_opcion_alimento = oa.id;

-- Habilitar RLS en la vista
ALTER VIEW main.vw_resumen_reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver resúmenes de sus reservas"
    ON main.vw_resumen_reservas FOR SELECT
    USING (auth.uid() = id_usuario);

-- ==========================================
-- FUNCIONES DE NEGOCIO
-- ==========================================

-- Función para crear reserva
CREATE OR REPLACE FUNCTION main.crear_reserva(
    id_paquete int,
    id_opcion_alimento int,
    id_mampara int,
    id_tematica int,
    fecha_evento date,
    hora_inicio time,
    hora_fin time,
    nombre_festejado text,
    edad_festejado int,
    genero_festejado text DEFAULT NULL,
    comentarios text DEFAULT NULL,
    datos_extras jsonb DEFAULT '[]'
)
RETURNS jsonb AS $$
DECLARE
    id_usuario_actual uuid;
    id_reserva int;
    precio_base numeric(10,2);
    precio_total numeric(10,2);
    monto_anticipo numeric(10,2);
    codigo_seguimiento text;
    resultado jsonb;
BEGIN
    -- Obtener usuario autenticado
    id_usuario_actual := auth.uid();
    IF id_usuario_actual IS NULL THEN
        RAISE EXCEPTION 'Autenticación requerida';
    END IF;
    
    -- Validar fecha futura
    IF fecha_evento <= CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha del evento debe ser futura';
    END IF;
    
    -- Verificar disponibilidad de horario
    IF EXISTS (
        SELECT 1 FROM main.reservas
        WHERE fecha_evento = fecha_evento
        AND estado IN ('confirmada', 'anticipo_pagado')
        AND (hora_inicio, hora_fin) OVERLAPS (hora_inicio, hora_fin)
    ) THEN
        RAISE EXCEPTION 'Horario no disponible';
    END IF;
    
    -- Calcular precios
    SELECT CASE 
        WHEN extract(dow from fecha_evento) IN (5, 6) THEN precio_viernes_domingo
        ELSE precio_lunes_jueves
    END INTO precio_base
    FROM main.paquetes
    WHERE id = id_paquete;
    
    precio_total := precio_base;
    
    -- Agregar costo de opción de alimento
    IF id_opcion_alimento IS NOT NULL THEN
        precio_total := precio_total + (SELECT precio_extra FROM main.opciones_alimentos WHERE id = id_opcion_alimento);
    END IF;
    
    -- Agregar costo de mampara
    precio_total := precio_total + (SELECT precio FROM main.mamparas WHERE id = id_mampara);
    
    -- Calcular anticipo (30% redondeado a múltiplo de 100, mínimo 500)
    monto_anticipo := GREATEST(ROUND(precio_total * 0.3 / 100) * 100, 500);
    
    -- Generar código de seguimiento
    codigo_seguimiento := generate_tracking_code();
    
    -- Crear reserva
    INSERT INTO main.reservas (
        id_usuario,
        id_paquete,
        id_opcion_alimento,
        id_mampara,
        id_tematica,
        codigo_seguimiento,
        fecha_evento,
        hora_inicio,
        hora_fin,
        nombre_festejado,
        edad_festejado,
        genero_festejado,
        comentarios,
        total,
        monto_anticipo,
        fecha_limite_anticipo,
        fecha_limite_pago
    ) VALUES (
        id_usuario_actual,
        id_paquete,
        id_opcion_alimento,
        id_mampara,
        id_tematica,
        codigo_seguimiento,
        fecha_evento,
        hora_inicio,
        hora_fin,
        nombre_festejado,
        edad_festejado,
        genero_festejado,
        comentarios,
        precio_total,
        monto_anticipo,
        now() + interval '48 hours',
        (fecha_evento - interval '7 days')::timestamp
    ) RETURNING id INTO id_reserva;
    
    -- Agregar extras si se proporcionaron
    IF jsonb_array_length(datos_extras) > 0 THEN
        INSERT INTO main.reserva_extras (id_reserva, id_extra, cantidad, precio_unitario)
        SELECT 
            id_reserva,
            (ext.value->>'id')::int,
            COALESCE((ext.value->>'cantidad')::int, 1),
            (SELECT precio FROM main.extras WHERE id = (ext.value->>'id')::int)
        FROM jsonb_array_elements(datos_extras) AS ext;
        
        -- Actualizar total con extras
        UPDATE main.reservas SET total = (
            SELECT total + COALESCE(SUM(cantidad * precio_unitario), 0)
            FROM main.reserva_extras 
            WHERE id_reserva = id_reserva
        ) WHERE id = id_reserva;
    END IF;
    
    -- Crear notificación
    INSERT INTO main.notificaciones (id_usuario, id_reserva, tipo, titulo, mensaje, metadatos)
    VALUES (
        id_usuario_actual,
        id_reserva,
        'reserva',
        'Reserva creada exitosamente',
        'Tu reserva con código ' || codigo_seguimiento || ' ha sido creada. Tienes 48 horas para realizar el anticipo.',
        jsonb_build_object(
            'id_reserva', id_reserva,
            'codigo_seguimiento', codigo_seguimiento,
            'total', precio_total,
            'anticipo', monto_anticipo
        )
    );
    
    -- Retornar resultado
    SELECT jsonb_build_object(
        'id', id_reserva,
        'codigo_seguimiento', codigo_seguimiento,
        'total', precio_total,
        'monto_anticipo', monto_anticipo,
        'fecha_limite_anticipo', (now() + interval '48 hours')::text
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para procesar pago
CREATE OR REPLACE FUNCTION finanzas.procesar_pago(
    codigo_reserva text,
    monto numeric(10,2),
    metodo finanzas.metodo_pago,
    referencia text DEFAULT NULL,
    id_transaccion_externa text DEFAULT NULL,
    url_comprobante text DEFAULT NULL,
    detalles_adicionales jsonb DEFAULT '{}'
)
RETURNS jsonb AS $$
DECLARE
    id_usuario_actual uuid;
    reserva_actual RECORD;
    id_pago int;
    estado_pago finanzas.estado_pago := 'completado';
    id_categoria int;
    es_anticipo boolean;
    nuevo_estado_reserva main.estado_reserva;
    resultado jsonb;
BEGIN
    -- Obtener usuario autenticado
    id_usuario_actual := auth.uid();
    IF id_usuario_actual IS NULL THEN
        RAISE EXCEPTION 'Autenticación requerida';
    END IF;
    
    -- Buscar la reserva
    SELECT * INTO reserva_actual
    FROM main.reservas r
    WHERE r.codigo_seguimiento = codigo_reserva
    AND r.estado IN ('pendiente', 'anticipo_pagado');
    
    -- Verificar que existe la reserva
    IF reserva_actual.id IS NULL THEN
        RAISE EXCEPTION 'Reserva no encontrada o no está en estado válido para pagos';
    END IF;
    
    -- Verificar permisos
    IF reserva_actual.id_usuario != id_usuario_actual AND 
       NOT EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = id_usuario_actual AND rol IN ('admin', 'finanzas')
       ) THEN
        RAISE EXCEPTION 'No tiene permisos para procesar pagos para esta reserva';
    END IF;
    
    -- Determinar si es anticipo y nuevo estado
    IF reserva_actual.monto_pagado = 0 AND monto >= reserva_actual.monto_anticipo AND monto < reserva_actual.total THEN
        es_anticipo := TRUE;
        nuevo_estado_reserva := 'anticipo_pagado';
    ELSIF monto + reserva_actual.monto_pagado >= reserva_actual.total THEN
        es_anticipo := FALSE;
        nuevo_estado_reserva := 'confirmada';
    ELSIF reserva_actual.monto_pagado = 0 AND monto < reserva_actual.monto_anticipo THEN
        RAISE EXCEPTION 'El monto es menor que el anticipo mínimo requerido';
    ELSE
        es_anticipo := FALSE;
        nuevo_estado_reserva := reserva_actual.estado;
    END IF;
    
    -- Validar que no se exceda el total
    IF monto + reserva_actual.monto_pagado > reserva_actual.total THEN
        RAISE EXCEPTION 'El monto total de pagos excede el valor de la reserva';
    END IF;
    
    -- Crear registro de pago
    INSERT INTO finanzas.pagos (
        id_reserva,
        monto,
        fecha_pago,
        estado,
        metodo,
        es_anticipo,
        referencia,
        url_comprobante,
        id_externo,
        detalles_pago,
        creado_por
    ) VALUES (
        reserva_actual.id,
        monto,
        CURRENT_DATE,
        estado_pago,
        metodo,
        es_anticipo,
        referencia,
        url_comprobante,
        id_transaccion_externa,
        detalles_adicionales,
        id_usuario_actual
    ) RETURNING id INTO id_pago;
    
    -- Actualizar reserva
    UPDATE main.reservas
    SET monto_pagado = monto_pagado + monto,
        estado = nuevo_estado_reserva,
        fecha_actualizacion = now()
    WHERE id = reserva_actual.id;
    
    -- Actualizar inventario si se confirma
    IF nuevo_estado_reserva = 'confirmada' THEN
        UPDATE inventario.reservas_inventario
        SET estado = 'confirmada'
        WHERE id_reserva = reserva_actual.id
        AND estado = 'proyectada';
    END IF;
    
    -- Obtener o crear categoría
    SELECT id INTO id_categoria
    FROM finanzas.categorias
    WHERE nombre = CASE
        WHEN es_anticipo THEN 'Anticipo Reserva'
        ELSE 'Pago Reserva'
    END
    AND activo = true;

    IF id_categoria IS NULL THEN
        INSERT INTO finanzas.categorias(nombre, color, activo)
        VALUES (
            CASE
                WHEN es_anticipo THEN 'Anticipo Reserva'
                ELSE 'Pago Reserva'
            END,
            '#4CAF50',
            TRUE
        )
        RETURNING id INTO id_categoria;
    END IF;
    
    -- Crear registro financiero
    INSERT INTO finanzas.finanzas (
        id_reserva,
        tipo,
        monto,
        fecha,
        descripcion,
        id_usuario,
        id_categoria,
        id_pago,
        id_transaccion
    ) VALUES (
        reserva_actual.id,
        'ingreso',
        monto,
        CURRENT_DATE,
        CASE
            WHEN es_anticipo THEN 'Anticipo de reserva ' || codigo_reserva
            WHEN nuevo_estado_reserva = 'confirmada' THEN 'Pago completo de reserva ' || codigo_reserva
            ELSE 'Pago parcial de reserva ' || codigo_reserva
        END,
        id_usuario_actual,
        id_categoria,
        id_pago,
        id_transaccion_externa
    );
    
    -- Crear notificación
    INSERT INTO main.notificaciones (id_usuario, id_reserva, tipo, titulo, mensaje, metadatos)
    VALUES (
        reserva_actual.id_usuario,
        reserva_actual.id,
        'pago',
        CASE
            WHEN es_anticipo THEN 'Anticipo procesado'
            WHEN nuevo_estado_reserva = 'confirmada' THEN 'Pago completo procesado'
            ELSE 'Pago parcial procesado'
        END,
        CASE
            WHEN es_anticipo THEN 'Se ha procesado un anticipo por ' || monto || ' para la reserva ' ||
                codigo_reserva || '. Recuerda completar el pago total antes del ' ||
                TO_CHAR(reserva_actual.fecha_limite_pago, 'DD/MM/YYYY')
            WHEN nuevo_estado_reserva = 'confirmada' THEN 'Se ha procesado el pago completo por ' || monto || 
                ' para la reserva ' || codigo_reserva || '. Tu reserva está confirmada.'
            ELSE 'Se ha procesado un pago parcial por ' || monto || ' para la reserva ' || 
                codigo_reserva || '. Saldo pendiente: ' || 
                (reserva_actual.total - reserva_actual.monto_pagado - monto)
        END,
        jsonb_build_object(
            'codigo_reserva', codigo_reserva,
            'monto', monto,
            'metodo_pago', metodo,
            'estado', estado_pago,
            'es_anticipo', es_anticipo,
            'saldo_pendiente', reserva_actual.total - reserva_actual.monto_pagado - monto
        )
    );
    
    -- Retornar resultado
    SELECT jsonb_build_object(
        'id_pago', id_pago,
        'estado', estado_pago,
        'monto', monto,
        'nuevo_estado_reserva', nuevo_estado_reserva
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- TRIGGERS PARA AUDITORÍA Y MANTENIMIENTO
-- ==========================================

-- Trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION public.actualizar_fecha_modificacion()
RETURNS trigger AS $$
BEGIN
    NEW.fecha_actualizacion = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas necesarias
DO $$
DECLARE
    tabla_record RECORD;
BEGIN
    FOR tabla_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname IN ('public', 'main', 'finanzas', 'inventario')
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = schemaname 
            AND table_name = tablename 
            AND column_name = 'fecha_actualizacion'
        )
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS tg_actualizar_fecha_modificacion_%s_%s ON %I.%I',
            tabla_record.schemaname,
            tabla_record.tablename,
            tabla_record.schemaname,
            tabla_record.tablename
        );
        
        EXECUTE format(
            'CREATE TRIGGER tg_actualizar_fecha_modificacion_%s_%s
                BEFORE UPDATE ON %I.%I
                FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_modificacion()',
            tabla_record.schemaname,
            tabla_record.tablename,
            tabla_record.schemaname,
            tabla_record.tablename
        );
    END LOOP;
END $$;

-- ==========================================
-- TAREAS PROGRAMADAS CON PG_CRON
-- ==========================================

-- Limpiar reservas pendientes expiradas
SELECT cron.schedule(
    'limpiar-reservas-expiradas',
    '0 2 * * *', -- Diario a las 2 AM
    $$ 
    UPDATE main.reservas 
    SET estado = 'cancelada', 
        motivo_cancelacion = 'Cancelación automática - límite de anticipo excedido',
        fecha_actualizacion = now()
    WHERE estado = 'pendiente' 
    AND fecha_limite_anticipo < now()
    AND fecha_creacion < now() - interval '7 days';
    $$
);

-- Enviar recordatorios de pago
SELECT cron.schedule(
    'recordatorios-pago',
    '0 9 * * *', -- Diario a las 9 AM
    $$
    INSERT INTO main.notificaciones (id_usuario, id_reserva, tipo, titulo, mensaje, metadatos)
    SELECT 
        r.id_usuario,
        r.id,
        'recordatorio',
        'Recordatorio de pago',
        'Tu pago final vence en ' || EXTRACT(DAY FROM r.fecha_limite_pago - now()) || ' días para la reserva ' || r.codigo_seguimiento,
        jsonb_build_object('id_reserva', r.id, 'codigo_seguimiento', r.codigo_seguimiento)
    FROM main.reservas r
    WHERE r.estado = 'anticipo_pagado'
    AND r.fecha_limite_pago > now()
    AND r.fecha_limite_pago < now() + interval '3 days'
    AND NOT EXISTS (
        SELECT 1 FROM main.notificaciones n
        WHERE n.id_usuario = r.id_usuario
        AND n.tipo = 'recordatorio'
        AND (n.metadatos->>'id_reserva')::int = r.id
        AND n.fecha_creacion > now() - interval '1 day'
    );
    $$
);

-- ==========================================
-- FUNCIONES AUXILIARES PARA POSTGREST
-- ==========================================

-- Obtener fechas disponibles
CREATE OR REPLACE FUNCTION main.obtener_fechas_disponibles(
    fecha_inicio date DEFAULT CURRENT_DATE,
    dias_adelante int DEFAULT 30
)
RETURNS table(fecha date, disponible boolean, espacios_disponibles int) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d::date,
        NOT EXISTS (
            SELECT 1 FROM main.reservas r
            WHERE r.fecha_evento = d::date
            AND r.estado IN ('confirmada', 'anticipo_pagado')
        ) as disponible,
        (
            SELECT 4 - COUNT(*)
            FROM main.reservas r
            WHERE r.fecha_evento = d::date
            AND r.estado IN ('confirmada', 'anticipo_pagado')
        )::int as espacios
    FROM generate_series(
        fecha_inicio,
        fecha_inicio + (dias_adelante || ' days')::interval,
        '1 day'::interval
    ) as d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calcular precio de reserva
CREATE OR REPLACE FUNCTION main.calcular_precio_reserva(
    id_paquete int,
    id_opcion_alimento int DEFAULT NULL,
    id_mampara int DEFAULT NULL,
    fecha_evento date DEFAULT NULL,
    ids_extras int[] DEFAULT ARRAY[]::int[]
)
RETURNS jsonb AS $$
DECLARE
    precio_base numeric(10,2);
    precio_total numeric(10,2);
    monto_anticipo numeric(10,2);
    resultado jsonb;
BEGIN
    -- Obtener precio base según día de la semana
    SELECT CASE 
        WHEN extract(dow from COALESCE(fecha_evento, CURRENT_DATE)) IN (5, 6) THEN precio_viernes_domingo
        ELSE precio_lunes_jueves
    END INTO precio_base
    FROM main.paquetes
    WHERE id = id_paquete;
    
    precio_total := precio_base;
    
    -- Agregar opción de alimento
    IF id_opcion_alimento IS NOT NULL THEN
        precio_total := precio_total + (SELECT precio_extra FROM main.opciones_alimentos WHERE id = id_opcion_alimento);
    END IF;
    
    -- Agregar mampara
    IF id_mampara IS NOT NULL THEN
        precio_total := precio_total + (SELECT precio FROM main.mamparas WHERE id = id_mampara);
    END IF;
    
    -- Agregar extras
    IF array_length(ids_extras, 1) > 0 THEN
        precio_total := precio_total + (
            SELECT SUM(precio)
            FROM main.extras
            WHERE id = ANY(ids_extras)
        );
    END IF;
    
    -- Calcular anticipo
    monto_anticipo := GREATEST(ROUND(precio_total * 0.3 / 100) * 100, 500);
    
    resultado := jsonb_build_object(
        'precio_base', precio_base,
        'precio_total', precio_total,
        'monto_anticipo', monto_anticipo,
        'es_fin_de_semana', extract(dow from COALESCE(fecha_evento, CURRENT_DATE)) IN (5, 6)
    );
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- OPTIMIZACIONES FINALES
-- ==========================================

-- Crear índices adicionales para performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_paquetes_nombre ON main.paquetes (nombre);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tematicas_nombre ON main.tematicas (nombre);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opciones_alimentos_nombre ON main.opciones_alimentos (nombre);

-- Configurar estadísticas para optimización
ALTER TABLE main.reservas SET (fillfactor = 90);
ALTER TABLE finanzas.pagos SET (fillfactor = 90);

-- Actualizar estadísticas
ANALYZE;

-- ==========================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE main.reservas IS 'Tabla principal para reservas de eventos con lógica de negocio completa';
COMMENT ON COLUMN main.reservas.codigo_seguimiento IS 'Código alfanumérico único para referencia del cliente';
COMMENT ON COLUMN main.reservas.info_cliente IS 'Campo JSON flexible para metadata adicional del cliente';
COMMENT ON COLUMN main.reservas.detalles_evento IS 'Campo JSON flexible para configuraciones específicas del evento';

COMMENT ON FUNCTION main.crear_reserva IS 'Crea una nueva reserva con validación, cálculo de precios y notificaciones';
COMMENT ON FUNCTION main.obtener_fechas_disponibles IS 'Retorna fechas disponibles para reserva en un rango de tiempo';
COMMENT ON FUNCTION main.calcular_precio_reserva IS 'Calcula el precio total incluyendo todas las opciones y extras';

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================

-- ¡Script optimizado para Supabase completado!
-- Este script mantiene la estructura por schemas pero elimina redundancias
-- Aprovecha al máximo las características de Supabase como RLS, PostgREST y extensiones