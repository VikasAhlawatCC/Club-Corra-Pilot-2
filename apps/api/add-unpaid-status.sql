-- Add UNPAID status to the coin_transaction_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'UNPAID' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'coin_transaction_status')
    ) THEN
        ALTER TYPE coin_transaction_status ADD VALUE 'UNPAID';
    END IF;
END$$;

