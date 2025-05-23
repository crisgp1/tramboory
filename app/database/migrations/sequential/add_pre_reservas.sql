-- Create the pre_reservas table and related enum

DO 19780
BEGIN
    -- Create the enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
                 WHERE t.typname = 'enum_pre_reservas_estado' AND n.nspname = 'main') THEN
        CREATE TYPE main.enum_pre_reservas_estado AS ENUM ('pendiente', 'procesando', 'completada', 'expirada');
    END IF;
END
19780;

-- Create the pre_reservas table if it doesn't exist
CREATE TABLE IF NOT EXISTS main.pre_reservas (
  id SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuarios.usuarios(id),
  datos_reserva JSONB NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL,
  estado main.enum_pre_reservas_estado NOT NULL DEFAULT 'pendiente',
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN main.pre_reservas.datos_reserva IS 'Contiene todos los datos necesarios para crear una reserva';
COMMENT ON COLUMN main.pre_reservas.fecha_expiracion IS 'Fecha y hora en que expira la pre-reserva';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pre_reservas_usuario ON main.pre_reservas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_pre_reservas_estado ON main.pre_reservas(estado);
CREATE INDEX IF NOT EXISTS idx_pre_reservas_expiracion ON main.pre_reservas(fecha_expiracion);

-- Add the foreign key reference in the pagos table if it doesn't exist
DO 19780
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_pagos_pre_reserva'
    ) THEN
        ALTER TABLE finanzas.pagos
            ADD CONSTRAINT fk_pagos_pre_reserva
            FOREIGN KEY (id_pre_reserva) REFERENCES main.pre_reservas(id);
    END IF;
END
19780;
