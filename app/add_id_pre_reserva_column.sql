-- Add id_pre_reserva column to finanzas.pagos table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'finanzas' 
        AND table_name = 'pagos' 
        AND column_name = 'id_pre_reserva'
    ) THEN
        ALTER TABLE finanzas.pagos 
        ADD COLUMN id_pre_reserva INTEGER NULL;
        
        COMMENT ON COLUMN finanzas.pagos.id_pre_reserva IS 'ID de la pre-reserva asociada al pago';
    END IF;
END
$$;

-- Make sure the index exists
DROP INDEX IF EXISTS finanzas.idx_pagos_pre_reserva;
CREATE INDEX idx_pagos_pre_reserva ON finanzas.pagos(id_pre_reserva);

-- Add foreign key constraint if it doesn't exist
DO $$
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
$$;

