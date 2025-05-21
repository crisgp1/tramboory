-- ==========================================
-- init_supabase_mejorado.sql
-- Script completo optimizado para Supabase (reordenado)
-- ==========================================

-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_jsonschema";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- SEARCH_PATH
SET search_path TO public, main, finanzas, inventario, auth;

-- SCHEMAS
CREATE SCHEMA IF NOT EXISTS main;
CREATE SCHEMA IF NOT EXISTS finanzas;
CREATE SCHEMA IF NOT EXISTS inventario;

-- ENUMS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                   WHERE t.typname = 'estado_reserva' AND n.nspname = 'main') THEN
        CREATE TYPE main.estado_reserva AS ENUM
            ('pendiente','anticipo_pagado','confirmada','cancelada','completada');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                   WHERE t.typname = 'tipo_turno' AND n.nspname = 'main') THEN
        CREATE TYPE main.tipo_turno AS ENUM ('manana','tarde','ambos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                   WHERE t.typname = 'tipo_notificacion' AND n.nspname = 'main') THEN
        CREATE TYPE main.tipo_notificacion AS ENUM
            ('reserva','pago','recordatorio','inventario','sistema');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                   WHERE t.typname = 'estado_pago' AND n.nspname = 'finanzas') THEN
        CREATE TYPE finanzas.estado_pago AS ENUM
            ('pendiente','completado','fallido','reembolsado','parcial_reembolsado');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                   WHERE t.typname = 'metodo_pago' AND n.nspname = 'finanzas') THEN
        CREATE TYPE finanzas.metodo_pago AS ENUM ('efectivo','transferencia_spei');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                   WHERE t.typname = 'rol_usuario' AND n.nspname = 'public') THEN
        CREATE TYPE public.rol_usuario AS ENUM
            ('cliente','admin','inventario','finanzas');
    END IF;
END$$;

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles(
    id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email               text NOT NULL,
    nombre_completo     text,
    telefono            text,
    direccion           text,
    rol                 public.rol_usuario NOT NULL DEFAULT 'cliente',
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now(),
    metadatos           jsonb NOT NULL DEFAULT '{}',
    CONSTRAINT profiles_telefono_check CHECK (telefono ~ '^\+?[0-9\-\s\(\)]{10,}$'),
    CONSTRAINT profiles_email_check    CHECK (email    ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY perfil_select_propietario ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY perfil_update_propietario ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY perfil_admin_gestion ON public.profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol = 'admin')
    );
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id,email,nombre_completo)
    VALUES (NEW.id, NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email));
    RETURN NEW;
END$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- MAIN: TABLAS
CREATE TABLE IF NOT EXISTS main.paquetes(
    id                     serial PRIMARY KEY,
    nombre                 text NOT NULL,
    descripcion            text,
    precio_lunes_jueves    numeric(10,2) NOT NULL CHECK (precio_lunes_jueves >= 0),
    precio_viernes_domingo numeric(10,2) NOT NULL CHECK (precio_viernes_domingo >= 0),
    activo                 boolean DEFAULT true,
    fecha_creacion         timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion    timestamptz NOT NULL DEFAULT now(),
    caracteristicas        jsonb NOT NULL DEFAULT '[]',
    CONSTRAINT paquetes_caracteristicas_schema CHECK (
        jsonb_matches_schema(
            '{"type":"array","items":{"type":"string"}}',
            caracteristicas
        )
    )
);
CREATE TABLE IF NOT EXISTS main.tematicas(
    id                  serial PRIMARY KEY,
    nombre              text NOT NULL,
    descripcion         text,
    url_imagen          text,
    colores             jsonb,
    activo              boolean DEFAULT true,
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT tematicas_colores_check CHECK (
        colores IS NULL OR
        jsonb_matches_schema(
            '{"type":"object","properties":{"primario":{"type":"string"},"secundario":{"type":"string"}}}',
            colores
        )
    )
);
CREATE TABLE IF NOT EXISTS main.mamparas(
    id                  serial PRIMARY KEY,
    id_tematica         integer NOT NULL REFERENCES main.tematicas(id) ON DELETE CASCADE,
    piezas              integer NOT NULL CHECK (piezas > 0),
    precio              numeric(10,2) NOT NULL CHECK (precio >= 0),
    url_imagen          text,
    activo              boolean DEFAULT true,
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS main.opciones_alimentos(
    id                  serial PRIMARY KEY,
    nombre              text NOT NULL,
    descripcion         text,
    precio_extra        numeric(10,2) NOT NULL DEFAULT 0 CHECK (precio_extra >= 0),
    disponible          boolean DEFAULT true,
    turno               main.tipo_turno NOT NULL DEFAULT 'ambos',
    platillo_adulto     text NOT NULL,
    platillo_nino       text NOT NULL,
    incluye_papas       boolean DEFAULT false,
    precio_papas        numeric(10,2) DEFAULT 19.00,
    precio_adulto       numeric(10,2) DEFAULT 0,
    precio_nino         numeric(10,2) DEFAULT 0,
    activo              boolean DEFAULT true,
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now(),
    ingredientes        jsonb NOT NULL DEFAULT '[]',
    CONSTRAINT opciones_alimentos_ing_schema CHECK (
        jsonb_matches_schema(
            '{"type":"array","items":{"type":"object","properties":{"nombre":{"type":"string"},"cantidad":{"type":"number"}}}}',
            ingredientes
        )
    )
);
CREATE TABLE IF NOT EXISTS main.extras(
    id                  serial PRIMARY KEY,
    nombre              text NOT NULL,
    descripcion         text,
    precio              numeric(10,2) NOT NULL CHECK (precio >= 0),
    activo              boolean DEFAULT true,
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now(),
    metadatos           jsonb NOT NULL DEFAULT '{}'
);
CREATE OR REPLACE FUNCTION generate_tracking_code() RETURNS text AS $$
DECLARE codigo text;
BEGIN
    LOOP
        codigo := upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM main.reservas WHERE codigo_seguimiento = codigo);
    END LOOP;
    RETURN codigo;
END$$ LANGUAGE plpgsql;
CREATE TABLE IF NOT EXISTS main.reservas(
    id                     serial PRIMARY KEY,
    id_usuario             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_paquete             integer NOT NULL REFERENCES main.paquetes(id),
    id_opcion_alimento     integer REFERENCES main.opciones_alimentos(id),
    id_mampara             integer REFERENCES main.mamparas(id),
    id_tematica            integer NOT NULL REFERENCES main.tematicas(id),
    codigo_seguimiento     text NOT NULL UNIQUE DEFAULT generate_tracking_code(),
    fecha_evento           date NOT NULL,
    hora_inicio            time NOT NULL,
    hora_fin               time NOT NULL,
    nombre_festejado       text NOT NULL,
    edad_festejado         integer NOT NULL CHECK (edad_festejado > 0),
    genero_festejado       text,
    comentarios            text,
    total                  numeric(10,2) NOT NULL CHECK (total >= 0),
    monto_anticipo         numeric(10,2) NOT NULL,
    monto_pagado           numeric(10,2) NOT NULL DEFAULT 0 CHECK (monto_pagado >= 0),
    fecha_limite_anticipo  timestamptz NOT NULL,
    fecha_limite_pago      timestamptz NOT NULL,
    estado                 main.estado_reserva NOT NULL DEFAULT 'pendiente',
    cancelable             boolean DEFAULT true,
    motivo_cancelacion     text,
    info_cliente           jsonb NOT NULL DEFAULT '{}',
    detalles_evento        jsonb NOT NULL DEFAULT '{}',
    ip_cliente             inet,
    agente_usuario         text,
    fecha_creacion         timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion    timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT reservas_horario_valido      CHECK (hora_fin > hora_inicio),
    CONSTRAINT reservas_anticipo_valido     CHECK (monto_anticipo <= total),
    CONSTRAINT reservas_monto_pagado_valido CHECK (monto_pagado <= total),
    CONSTRAINT reservas_fecha_futura        CHECK (fecha_evento >= current_date)
);
CREATE INDEX idx_reservas_usuario       ON main.reservas(id_usuario);
CREATE INDEX idx_reservas_codigo        ON main.reservas(codigo_seguimiento);
CREATE INDEX idx_reservas_fecha_estado  ON main.reservas(fecha_evento,estado);
CREATE INDEX idx_reservas_fechas_limite ON main.reservas(fecha_limite_anticipo,fecha_limite_pago);
CREATE INDEX idx_reservas_busqueda_info ON main.reservas USING gin(info_cliente);
CREATE INDEX idx_reservas_busqueda_det  ON main.reservas USING gin(detalles_evento);
ALTER TABLE main.reservas ENABLE ROW LEVEL SECURITY;
CREATE POLICY reservas_select_propias ON main.reservas
    FOR SELECT USING (auth.uid() = id_usuario);
CREATE POLICY reservas_insert_propias ON main.reservas
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);
CREATE POLICY reservas_update_pend ON main.reservas
    FOR UPDATE USING (auth.uid() = id_usuario AND estado IN ('pendiente','anticipo_pagado'));
CREATE POLICY reservas_admin_full ON main.reservas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','finanzas'))
    );
CREATE TABLE IF NOT EXISTS main.reserva_extras(
    id_reserva      integer NOT NULL REFERENCES main.reservas(id) ON DELETE CASCADE,
    id_extra        integer NOT NULL REFERENCES main.extras(id)    ON DELETE CASCADE,
    cantidad        integer NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario numeric(10,2),
    fecha_creacion  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(id_reserva,id_extra)
);
ALTER TABLE main.reserva_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY reserva_extras_propias ON main.reserva_extras
    FOR ALL USING (id_reserva IN (SELECT id FROM main.reservas WHERE id_usuario = auth.uid()));
CREATE TABLE IF NOT EXISTS main.notificaciones(
    id              serial PRIMARY KEY,
    id_usuario      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    id_reserva      integer REFERENCES main.reservas(id) ON DELETE SET NULL,
    tipo            main.tipo_notificacion NOT NULL,
    titulo          text NOT NULL,
    mensaje         text NOT NULL,
    canal           text NOT NULL DEFAULT 'email',
    leida           boolean DEFAULT false,
    fecha_lectura   timestamptz,
    metadatos       jsonb NOT NULL DEFAULT '{}',
    fecha_creacion  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE main.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY notificaciones_propias ON main.notificaciones
    FOR ALL USING (auth.uid() = id_usuario);

-- FINANZAS: TABLAS
CREATE TABLE IF NOT EXISTS finanzas.categorias(
    id                  serial PRIMARY KEY,
    nombre              text NOT NULL UNIQUE,
    color               text NOT NULL DEFAULT '#000000' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    activo              boolean DEFAULT true,
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS finanzas.pagos(
    id                  serial PRIMARY KEY,
    id_reserva          integer NOT NULL REFERENCES main.reservas(id) ON DELETE CASCADE,
    monto               numeric(10,2) NOT NULL CHECK (monto>0),
    fecha_pago          date NOT NULL DEFAULT current_date,
    estado              finanzas.estado_pago NOT NULL DEFAULT 'pendiente',
    metodo              finanzas.metodo_pago NOT NULL,
    es_anticipo         boolean NOT NULL DEFAULT false,
    detalles_pago       jsonb NOT NULL DEFAULT '{}',
    id_externo          text,
    url_comprobante     text,
    referencia          text,
    notas               text,
    creado_por          uuid REFERENCES auth.users(id),
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT pagos_detalles_schema CHECK (
        jsonb_matches_schema(
            '{"type":"object","properties":{"banco":{"type":"string"},"referencia_bancaria":{"type":"string"}}}',
            detalles_pago
        )
    )
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pagos_externo_unique ON finanzas.pagos(id_externo) WHERE id_externo IS NOT NULL;
CREATE INDEX idx_pagos_reserva      ON finanzas.pagos(id_reserva);
CREATE INDEX idx_pagos_estado_fecha ON finanzas.pagos(estado,fecha_pago);
CREATE TABLE IF NOT EXISTS finanzas.reembolsos(
    id                  serial PRIMARY KEY,
    id_pago             integer NOT NULL REFERENCES finanzas.pagos(id) ON DELETE CASCADE,
    monto_reembolso     numeric(10,2) NOT NULL CHECK (monto_reembolso>0),
    fecha_reembolso     date NOT NULL DEFAULT current_date,
    motivo              text NOT NULL,
    referencia          text,
    id_transaccion      text,
    estado              finanzas.estado_pago NOT NULL DEFAULT 'pendiente',
    id_usuario          uuid NOT NULL REFERENCES auth.users(id),
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS finanzas.finanzas(
    id                  serial PRIMARY KEY,
    id_reserva          integer REFERENCES main.reservas(id) ON DELETE SET NULL,
    tipo                text NOT NULL CHECK (tipo IN ('ingreso','gasto','reembolso')),
    monto               numeric(10,2) NOT NULL CHECK (monto>0),
    fecha               date NOT NULL DEFAULT current_date,
    descripcion         text,
    id_categoria        integer REFERENCES finanzas.categorias(id),
    id_usuario          uuid NOT NULL REFERENCES auth.users(id),
    id_pago             integer REFERENCES finanzas.pagos(id),
    id_transaccion      text,
    activo              boolean DEFAULT true,
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE finanzas.categorias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.pagos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.reembolsos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE finanzas.finanzas        ENABLE ROW LEVEL SECURITY;
CREATE POLICY finanzas_categoria_admin ON finanzas.categorias
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','finanzas'))
    );
CREATE POLICY pagos_select_propios ON finanzas.pagos
    FOR SELECT USING (
        id_reserva IN (SELECT id FROM main.reservas WHERE id_usuario = auth.uid())
    );
CREATE POLICY pagos_insert_autorizado ON finanzas.pagos
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','finanzas'))
    );
CREATE POLICY pagos_update_autorizado ON finanzas.pagos
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','finanzas'))
    );
CREATE POLICY pagos_delete_autorizado ON finanzas.pagos
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','finanzas'))
    );
CREATE POLICY reembolsos_autorizado ON finanzas.reembolsos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','finanzas'))
    );
CREATE POLICY finanzas_autorizado ON finanzas.finanzas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','finanzas'))
    );

-- INVENTARIO: TABLAS
CREATE TABLE IF NOT EXISTS inventario.materias_primas(
    id                  serial PRIMARY KEY,
    nombre              text NOT NULL,
    descripcion         text,
    unidad_medida       text NOT NULL,
    stock_actual        numeric(10,2) NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo        numeric(10,2) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    costo_unitario      numeric(10,2) NOT NULL DEFAULT 0 CHECK (costo_unitario >= 0),
    vida_util_dias      integer,
    activo              boolean DEFAULT true,
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now(),
    propiedades         jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS inventario.movimientos_inventario(
    id                  serial PRIMARY KEY,
    id_materia_prima    integer NOT NULL REFERENCES inventario.materias_primas(id) ON DELETE CASCADE,
    id_reserva          integer REFERENCES main.reservas(id) ON DELETE SET NULL,
    tipo_movimiento     text NOT NULL CHECK (tipo_movimiento IN ('entrada','salida','ajuste')),
    cantidad            numeric(10,2) NOT NULL,
    fecha               timestamptz NOT NULL DEFAULT now(),
    descripcion         text,
    id_usuario          uuid NOT NULL REFERENCES auth.users(id)
);
CREATE TABLE IF NOT EXISTS inventario.reservas_inventario(
    id                  serial PRIMARY KEY,
    id_materia_prima    integer NOT NULL REFERENCES inventario.materias_primas(id) ON DELETE CASCADE,
    id_reserva          integer NOT NULL REFERENCES main.reservas(id) ON DELETE CASCADE,
    cantidad            numeric(10,2) NOT NULL CHECK (cantidad > 0),
    fecha_evento        date NOT NULL,
    estado              text NOT NULL DEFAULT 'proyectada' CHECK (estado IN ('proyectada','confirmada','consumida','cancelada')),
    activo              boolean DEFAULT true,
    fecha_creacion      timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE inventario.materias_primas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario.movimientos_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario.reservas_inventario   ENABLE ROW LEVEL SECURITY;
CREATE POLICY inventario_autorizado ON inventario.materias_primas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','inventario'))
    );
CREATE POLICY movimientos_select_autorizado ON inventario.movimientos_inventario
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','inventario'))
    );
CREATE POLICY reservas_inventario_autorizado ON inventario.reservas_inventario
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.rol IN ('admin','inventario'))
    );

-- VISTA resumen de reservas (ahora que finanzas.pagos existe)
-- Modificada para incluir seguridad en la definición en lugar de usar RLS
CREATE OR REPLACE VIEW main.vw_resumen_reservas AS
SELECT
    r.*,
    p.nombre_completo         AS nombre_cliente,
    p.email                   AS email_cliente,
    p.telefono                AS telefono_cliente,
    pkg.nombre                AS nombre_paquete,
    t.nombre                  AS nombre_tematica,
    oa.nombre                 AS nombre_opcion_alimento,
    (r.total - r.monto_pagado) AS saldo_pendiente,
    CASE
        WHEN r.estado='pendiente'       AND r.fecha_limite_anticipo<now() THEN 'anticipo_vencido'
        WHEN r.estado='anticipo_pagado' AND r.fecha_limite_pago<now()     THEN 'pago_vencido'
        ELSE r.estado::text
    END AS estado_extendido,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'nombre',e.nombre,
            'cantidad',re.cantidad,
            'precio_unitario',re.precio_unitario
        )),'[]')
        FROM main.reserva_extras re
        JOIN main.extras e ON e.id = re.id_extra
        WHERE re.id_reserva = r.id
    ) AS extras,
    (
        SELECT COALESCE(json_agg(json_build_object(
            'monto',pago.monto,
            'metodo',pago.metodo,
            'estado',pago.estado,
            'fecha',pago.fecha_pago,
            'es_anticipo',pago.es_anticipo
        )),'[]')
        FROM finanzas.pagos pago
        WHERE pago.id_reserva = r.id
    ) AS pagos
FROM main.reservas r
LEFT JOIN public.profiles         p   ON p.id   = r.id_usuario
LEFT JOIN main.paquetes           pkg ON pkg.id = r.id_paquete
LEFT JOIN main.tematicas          t   ON t.id   = r.id_tematica
LEFT JOIN main.opciones_alimentos oa  ON oa.id  = r.id_opcion_alimento
WHERE r.id_usuario = auth.uid() 
   OR EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.rol IN ('admin','finanzas')
   );

-- Alternativa: Función segura para acceder a la vista
CREATE OR REPLACE FUNCTION main.get_resumen_reservas() 
RETURNS SETOF main.vw_resumen_reservas AS $$
BEGIN
    RETURN QUERY 
    SELECT * FROM main.vw_resumen_reservas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCIONES DE NEGOCIO
CREATE OR REPLACE FUNCTION main.crear_reserva(
    id_paquete         int,
    id_opcion_alimento int,
    id_mampara         int,
    id_tematica        int,
    fecha_evento       date,
    hora_inicio        time,
    hora_fin           time,
    nombre_festejado   text,
    edad_festejado     int,
    genero_festejado   text DEFAULT NULL,
    comentarios        text DEFAULT NULL,
    datos_extras       jsonb DEFAULT '[]'
) RETURNS jsonb AS $$
DECLARE
    id_usuario_actual uuid := auth.uid();
    id_reserva        int;
    precio_base       numeric(10,2);
    precio_total      numeric(10,2);
    monto_anticipo    numeric(10,2);
    codigo_seguimiento text;
BEGIN
    IF id_usuario_actual IS NULL THEN RAISE EXCEPTION 'Autenticación requerida'; END IF;
    IF fecha_evento <= current_date THEN RAISE EXCEPTION 'La fecha del evento debe ser futura'; END IF;
    IF EXISTS (
        SELECT 1 FROM main.reservas r
        WHERE r.fecha_evento=fecha_evento
          AND r.estado IN ('confirmada','anticipo_pagado')
          AND (r.hora_inicio,r.hora_fin) OVERLAPS (hora_inicio,hora_fin)
    ) THEN RAISE EXCEPTION 'Horario no disponible'; END IF;
    SELECT CASE WHEN extract(dow FROM fecha_evento) IN (5,6)
                THEN precio_viernes_domingo ELSE precio_lunes_jueves END
    INTO precio_base FROM main.paquetes WHERE id=id_paquete;
    precio_total := precio_base;
    IF id_opcion_alimento IS NOT NULL THEN
        precio_total := precio_total + (SELECT precio_extra FROM main.opciones_alimentos WHERE id=id_opcion_alimento);
    END IF;
    IF id_mampara IS NOT NULL THEN
        precio_total := precio_total + (SELECT precio FROM main.mamparas WHERE id=id_mampara);
    END IF;
    monto_anticipo := GREATEST(CEIL(precio_total*0.3),1500);
    codigo_seguimiento := generate_tracking_code();
    INSERT INTO main.reservas(
        id_usuario,id_paquete,id_opcion_alimento,id_mampara,id_tematica,
        codigo_seguimiento,fecha_evento,hora_inicio,hora_fin,
        nombre_festejado,edad_festejado,genero_festejado,comentarios,
        total,monto_anticipo,fecha_limite_anticipo,fecha_limite_pago
    ) VALUES (
        id_usuario_actual,id_paquete,id_opcion_alimento,id_mampara,id_tematica,
        codigo_seguimiento,fecha_evento,hora_inicio,hora_fin,
        nombre_festejado,edad_festejado,genero_festejado,comentarios,
        precio_total,monto_anticipo,
        now()+interval '48 hours',
        (fecha_evento - interval '7 days')::timestamp
    ) RETURNING id INTO id_reserva;
    IF jsonb_array_length(datos_extras)>0 THEN
        INSERT INTO main.reserva_extras(id_reserva,id_extra,cantidad,precio_unitario)
        SELECT id_reserva,(ext.value->>'id')::int,COALESCE((ext.value->>'cantidad')::int,1),
               (SELECT precio FROM main.extras WHERE id=(ext.value->>'id')::int)
        FROM jsonb_array_elements(datos_extras) ext;
        UPDATE main.reservas
        SET total = (
            SELECT total+COALESCE(SUM(cantidad*precio_unitario),0)
            FROM main.reserva_extras WHERE id_reserva=id_reserva
        )
        WHERE id=id_reserva;
    END IF;
    INSERT INTO main.notificaciones(id_usuario,id_reserva,tipo,titulo,mensaje,metadatos)
    VALUES (
        id_usuario_actual,id_reserva,'reserva',
        'Reserva creada exitosamente',
        'Tu reserva con código '||codigo_seguimiento||' ha sido creada. Tienes 48 horas para realizar el anticipo.',
        jsonb_build_object('id_reserva',id_reserva,'codigo_seguimiento',codigo_seguimiento,'total',precio_total,'anticipo',monto_anticipo)
    );
    RETURN jsonb_build_object(
        'id',id_reserva,'codigo_seguimiento',codigo_seguimiento,
        'total',precio_total,'monto_anticipo',monto_anticipo,
        'fecha_limite_anticipo',(now()+interval '48 hours')::text
    );
END$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION finanzas.procesar_pago(
    codigo_reserva         text,
    monto                  numeric(10,2),
    metodo                 finanzas.metodo_pago,
    referencia             text DEFAULT NULL,
    id_transaccion_externa text DEFAULT NULL,
    url_comprobante        text DEFAULT NULL,
    detalles_adicionales   jsonb DEFAULT '{}'
) RETURNS jsonb AS $$
DECLARE
    id_usuario_actual uuid := auth.uid();
    reserva_actual    RECORD;
    id_pago           int;
    estado_pago       finanzas.estado_pago := 'completado';
    id_categoria      int;
    es_anticipo       boolean;
    nuevo_estado      main.estado_reserva;
BEGIN
    IF id_usuario_actual IS NULL THEN RAISE EXCEPTION 'Autenticación requerida'; END IF;
    SELECT * INTO reserva_actual
    FROM main.reservas
    WHERE codigo_seguimiento=codigo_reserva
      AND estado IN ('pendiente','anticipo_pagado')
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Reserva no encontrada o en estado inválido'; END IF;
    IF reserva_actual.id_usuario<>id_usuario_actual
       AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=id_usuario_actual AND p.rol IN ('admin','finanzas'))
    THEN RAISE EXCEPTION 'Sin permisos'; END IF;
    IF reserva_actual.monto_pagado=0 AND monto>=reserva_actual.monto_anticipo AND monto<reserva_actual.total THEN
        es_anticipo:=true; nuevo_estado:='anticipo_pagado';
    ELSIF monto+reserva_actual.monto_pagado>=reserva_actual.total THEN
        es_anticipo:=false; nuevo_estado:='confirmada';
    ELSIF reserva_actual.monto_pagado=0 AND monto<reserva_actual.monto_anticipo THEN
        RAISE EXCEPTION 'Monto menor al anticipo mínimo'; 
    ELSE
        es_anticipo:=false; nuevo_estado:=reserva_actual.estado;
    END IF;
    IF monto+reserva_actual.monto_pagado>reserva_actual.total THEN RAISE EXCEPTION 'Monto excede el total de la reserva'; END IF;
    INSERT INTO finanzas.pagos(
        id_reserva,monto,fecha_pago,estado,metodo,es_anticipo,
        referencia,url_comprobante,id_externo,detalles_pago,creado_por
    ) VALUES (
        reserva_actual.id,monto,current_date,estado_pago,metodo,es_anticipo,
        referencia,url_comprobante,id_transaccion_externa,detalles_adicionales,id_usuario_actual
    ) RETURNING id INTO id_pago;
    UPDATE main.reservas
    SET monto_pagado=monto_pagado+monto,estado=nuevo_estado,fecha_actualizacion=now()
    WHERE id=reserva_actual.id;
    IF nuevo_estado='confirmada' THEN
        UPDATE inventario.reservas_inventario
        SET estado='confirmada'
        WHERE id_reserva=reserva_actual.id AND estado='proyectada';
    END IF;
    SELECT id INTO id_categoria FROM finanzas.categorias
    WHERE nombre=CASE WHEN es_anticipo THEN 'Anticipo Reserva' ELSE 'Pago Reserva' END AND activo=true;
    IF id_categoria IS NULL THEN
        INSERT INTO finanzas.categorias(nombre,color,activo)
        VALUES (CASE WHEN es_anticipo THEN 'Anticipo Reserva' ELSE 'Pago Reserva' END,'#4CAF50',true)
        RETURNING id INTO id_categoria;
    END IF;
    INSERT INTO finanzas.finanzas(
        id_reserva,tipo,monto,fecha,descripcion,
        id_usuario,id_categoria,id_pago,id_transaccion
    ) VALUES (
        reserva_actual.id,'ingreso',monto,current_date,
        CASE WHEN es_anticipo THEN 'Anticipo de reserva '||codigo_reserva
             WHEN nuevo_estado='confirmada' THEN 'Pago completo de reserva '||codigo_reserva
             ELSE 'Pago parcial de reserva '||codigo_reserva END,
        id_usuario_actual,id_categoria,id_pago,id_transaccion_externa
    );
    INSERT INTO main.notificaciones(
        id_usuario,id_reserva,tipo,titulo,mensaje,metadatos
    ) VALUES (
        reserva_actual.id_usuario,reserva_actual.id,'pago',
        CASE WHEN es_anticipo THEN 'Anticipo procesado'
             WHEN nuevo_estado='confirmada' THEN 'Pago completo procesado'
             ELSE 'Pago parcial procesado' END,
        CASE WHEN es_anticipo THEN 'Se procesó un anticipo de '||monto
             WHEN nuevo_estado='confirmada' THEN 'Pago completo de '||monto
             ELSE 'Se procesó un pago parcial de '||monto END || ' para la reserva '||codigo_reserva,
        jsonb_build_object(
            'codigo_reserva',codigo_reserva,'monto',monto,'metodo_pago',metodo,
            'estado',estado_pago,'es_anticipo',es_anticipo,
            'saldo_pendiente',reserva_actual.total-reserva_actual.monto_pagado-monto
        )
    );
    RETURN jsonb_build_object('id_pago',id_pago,'estado',estado_pago,'monto',monto,'nuevo_estado_reserva',nuevo_estado);
END$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER UPDATE_TIMESTAMP
CREATE OR REPLACE FUNCTION public.actualizar_fecha_modificacion() RETURNS trigger AS $$
BEGIN NEW.fecha_actualizacion = now(); RETURN NEW; END$$ LANGUAGE plpgsql;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname,tablename FROM pg_tables
           WHERE schemaname IN ('public','main','finanzas','inventario')
             AND EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_schema=schemaname AND table_name=tablename AND column_name='fecha_actualizacion')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tg_mod_%I_%I ON %I.%I',r.schemaname,r.tablename,r.schemaname,r.tablename);
    EXECUTE format('CREATE TRIGGER tg_mod_%I_%I BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION public.actualizar_fecha_modificacion()',r.schemaname,r.tablename,r.schemaname,r.tablename);
  END LOOP;
END$$;

-- CRON JOBS
SELECT cron.schedule('limpiar-reservas-expiradas','0 2 * * *',$$
  UPDATE main.reservas
  SET estado='cancelada', motivo_cancelacion='Cancelación automática - límite de anticipo excedido', fecha_actualizacion=now()
  WHERE estado='pendiente' AND fecha_limite_anticipo<now() AND fecha_creacion<now()-interval '7 days';
$$);
SELECT cron.schedule('recordatorios-pago','0 9 * * *',$$
  INSERT INTO main.notificaciones(id_usuario,id_reserva,tipo,titulo,mensaje,metadatos)
  SELECT r.id_usuario,r.id,'recordatorio','Recordatorio de pago',
         'Tu pago final vence en '||EXTRACT(day FROM r.fecha_limite_pago-now())||' días para la reserva '||r.codigo_seguimiento,
         jsonb_build_object('id_reserva',r.id,'codigo_seguimiento',r.codigo_seguimiento)
  FROM main.reservas r
  WHERE r.estado='anticipo_pagado' AND r.fecha_limite_pago>now() AND r.fecha_limite_pago<now()+interval '3 days'
    AND NOT EXISTS (SELECT 1 FROM main.notificaciones n WHERE n.id_usuario=r.id_usuario AND n.tipo='recordatorio' AND (n.metadatos->>'id_reserva')::int=r.id AND n.fecha_creacion>now()-interval '1 day');
$$);

-- AUXILIARES
CREATE OR REPLACE FUNCTION main.obtener_fechas_disponibles(fecha_inicio date DEFAULT current_date, dias_adelante int DEFAULT 30)
RETURNS TABLE(fecha date, disponible boolean, espacios_disponibles int) AS $$
BEGIN
  RETURN QUERY
  SELECT d::date,
         NOT EXISTS (SELECT 1 FROM main.reservas r WHERE r.fecha_evento=d::date AND r.estado IN ('confirmada','anticipo_pagado')) AS disponible,
         4-(SELECT COUNT(*) FROM main.reservas r WHERE r.fecha_evento=d::date AND r.estado IN ('confirmada','anticipo_pagado'))::int AS espacios_disponibles
  FROM generate_series(fecha_inicio, fecha_inicio + dias_adelante*interval '1 day', interval '1 day') d;
END$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION main.calcular_precio_reserva(
  id_paquete int, id_opcion_alimento int DEFAULT NULL, id_mampara int DEFAULT NULL,
  fecha_evento date DEFAULT NULL, ids_extras int[] DEFAULT ARRAY[]::int[]
) RETURNS jsonb AS $$
DECLARE precio_base numeric(10,2); precio_total numeric(10,2); monto_anticipo numeric(10,2);
BEGIN
  SELECT CASE WHEN extract(dow FROM coalesce(fecha_evento,current_date)) IN (5,6) THEN precio_viernes_domingo ELSE precio_lunes_jueves END
  INTO precio_base FROM main.paquetes WHERE id=id_paquete;
  precio_total:=precio_base;
  IF id_opcion_alimento IS NOT NULL THEN precio_total:=precio_total+(SELECT precio_extra FROM main.opciones_alimentos WHERE id=id_opcion_alimento); END IF;
  IF id_mampara IS NOT NULL THEN precio_total:=precio_total+(SELECT precio FROM main.mamparas WHERE id=id_mampara); END IF;
  IF array_length(ids_extras,1)>0 THEN precio_total:=precio_total+(SELECT SUM(precio) FROM main.extras WHERE id=ANY(ids_extras)); END IF;
  monto_anticipo:=GREATEST(CEIL(precio_total*0.3),1500);
  RETURN jsonb_build_object('precio_base',precio_base,'precio_total',precio_total,'monto_anticipo',monto_anticipo,'es_fin_de_semana',extract(dow FROM coalesce(fecha_evento,current_date)) IN (5,6));
END$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ÍNDICES ADICIONALES & OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_paquetes_nombre  ON main.paquetes(nombre);
CREATE INDEX IF NOT EXISTS idx_tematicas_nombre ON main.tematicas(nombre);
CREATE INDEX IF NOT EXISTS idx_opciones_nombre ON main.opciones_alimentos(nombre);
ALTER TABLE main.reservas  SET (fillfactor = 90);
ALTER TABLE finanzas.pagos SET (fillfactor = 90);
ANALYZE;