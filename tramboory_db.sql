DO $$
BEGIN
    -- Crear función para tarea programada
    CREATE OR REPLACE FUNCTION pg_temp.create_job_if_not_exists()
    RETURNS void LANGUAGE plpgsql AS $$
    BEGIN
        -- Verificar si pg_cron está instalado
        IF EXISTS (
            SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
        ) THEN
            -- Si existe pg_cron, verificar si el trabajo ya existe
            IF NOT EXISTS (
                SELECT 1 FROM cron.job WHERE command LIKE '%expirar_cotizaciones_antiguas%'
            ) THEN
                -- Crear trabajo programado para ejecutar cada hora
                PERFORM cron.schedule('0 * * * *', $$SELECT main.expirar_cotizaciones_antiguas()$$);
                RAISE NOTICE 'Tarea programada creada para expirar cotizaciones';
            END IF;
        ELSE
            RAISE NOTICE 'pg_cron no está disponible. Las tareas programadas deberán implementarse externamente.';
        END IF;
    END;
    $$;

    -- Ejecutar la función temporal
    PERFORM pg_temp.create_job_if_not_exists();
END $$;