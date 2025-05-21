-- Add token_transaccion column to finanzas.pagos table
ALTER TABLE finanzas.pagos ADD COLUMN IF NOT EXISTS token_transaccion VARCHAR(255) NULL;

-- Migrate data from id_transaccion to token_transaccion (if appropriate)
UPDATE finanzas.pagos SET token_transaccion = id_transaccion WHERE token_transaccion IS NULL AND id_transaccion IS NOT NULL;

-- Create index on the new column (the model defines this index)
DROP INDEX IF EXISTS finanzas.idx_pagos_token;
CREATE INDEX idx_pagos_token ON finanzas.pagos(token_transaccion);

-- Inform the user about the changes
SELECT 'The token_transaccion column has been added to the finanzas.pagos table.' AS message;

