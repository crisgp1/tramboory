-- Script para manejar tipos enumerados que podrían ya existir
-- Este script verifica si cada tipo enumerado ya existe antes de intentar crearlo

-- Conexión al esquema correcto
SET search_path TO tramboory;

-- Bloque DO para verificar y crear tipos enumerados
DO $$
BEGIN
    -- Verificar y crear enum_usuarios_tipo_usuario
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_usuarios_tipo_usuario') THEN
        CREATE TYPE enum_usuarios_tipo_usuario AS ENUM ('cliente', 'admin');
        ALTER TYPE enum_usuarios_tipo_usuario OWNER TO cris;
        RAISE NOTICE 'Tipo enum_usuarios_tipo_usuario creado exitosamente.';
    ELSE
        RAISE NOTICE 'Tipo enum_usuarios_tipo_usuario ya existe, omitiendo creación.';
    END IF;

    -- Verificar y crear enum_reservas_estado
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_reservas_estado') THEN
        CREATE TYPE enum_reservas_estado AS ENUM ('pendiente', 'confirmada', 'cancelada');
        ALTER TYPE enum_reservas_estado OWNER TO cris;
        RAISE NOTICE 'Tipo enum_reservas_estado creado exitosamente.';
    ELSE
        RAISE NOTICE 'Tipo enum_reservas_estado ya existe, omitiendo creación.';
    END IF;

    -- Verificar y crear enum_finanzas_tipo
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_finanzas_tipo') THEN
        CREATE TYPE enum_finanzas_tipo AS ENUM ('ingreso', 'gasto');
        ALTER TYPE enum_finanzas_tipo OWNER TO cris;
        RAISE NOTICE 'Tipo enum_finanzas_tipo creado exitosamente.';
    ELSE
        RAISE NOTICE 'Tipo enum_finanzas_tipo ya existe, omitiendo creación.';
    END IF;

    -- Verificar y crear enum_pagos_estado
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_pagos_estado') THEN
        CREATE TYPE enum_pagos_estado AS ENUM ('pendiente', 'completado', 'fallido');
        ALTER TYPE enum_pagos_estado OWNER TO cris;
        RAISE NOTICE 'Tipo enum_pagos_estado creado exitosamente.';
    ELSE
        RAISE NOTICE 'Tipo enum_pagos_estado ya existe, omitiendo creación.';
    END IF;

    -- Verificar y crear enum_turno
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_turno') THEN
        CREATE TYPE enum_turno AS ENUM ('manana', 'tarde', 'ambos');
        ALTER TYPE enum_turno OWNER TO cris;
        RAISE NOTICE 'Tipo enum_turno creado exitosamente.';
    ELSE
        RAISE NOTICE 'Tipo enum_turno ya existe, omitiendo creación.';
    END IF;

    -- Verificar y crear enum_ordenes_compra_estado
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ordenes_compra_estado') THEN
        CREATE TYPE enum_ordenes_compra_estado AS ENUM ('pendiente', 'aprobada', 'recibida', 'cancelada');
        ALTER TYPE enum_ordenes_compra_estado OWNER TO cris;
        RAISE NOTICE 'Tipo enum_ordenes_compra_estado creado exitosamente.';
    ELSE
        RAISE NOTICE 'Tipo enum_ordenes_compra_estado ya existe, omitiendo creación.';
    END IF;

    -- Verificar y crear enum_tipo_alerta
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tipo_alerta') THEN
        CREATE TYPE enum_tipo_alerta AS ENUM ('stock_bajo', 'caducidad', 'vencimiento_proveedor', 'ajuste_requerido');
        ALTER TYPE enum_tipo_alerta OWNER TO cris;
        RAISE NOTICE 'Tipo enum_tipo_alerta creado exitosamente.';
    ELSE
        RAISE NOTICE 'Tipo enum_tipo_alerta ya existe, omitiendo creación.';
    END IF;
END $$;

-- Log para confirmar la ejecución exitosa
DO $$
BEGIN
    RAISE NOTICE 'Script de corrección para tipos enumerados ejecutado correctamente.';
END $$;