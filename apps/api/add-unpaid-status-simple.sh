#!/bin/bash

# This script adds UNPAID to the coin_transaction_status enum

echo "🚀 Adding UNPAID status to database enum..."

# Read database credentials from running API server's environment
# or you can manually set these:
# export DB_HOST=localhost
# export DB_PORT=5432
# export DB_USERNAME=postgres
# export DB_PASSWORD=your_password
# export DB_DATABASE=club_corra

# SQL to add UNPAID value
SQL="DO \$\$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'UNPAID' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'coin_transaction_status')
    ) THEN
        ALTER TYPE coin_transaction_status ADD VALUE 'UNPAID';
        RAISE NOTICE 'UNPAID value added successfully!';
    ELSE
        RAISE NOTICE 'UNPAID value already exists';
    END IF;
END\$\$;"

# Run the SQL
if [ -z "$DATABASE_URL" ]; then
    # Use individual connection params
    PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USERNAME:-postgres} -d ${DB_DATABASE:-club_corra} -c "$SQL"
else
    # Use connection string
    psql $DATABASE_URL -c "$SQL"
fi

if [ $? -eq 0 ]; then
    echo "✅ Successfully added UNPAID status to the enum!"
else
    echo "❌ Failed to add UNPAID status. Please run the SQL manually."
    echo ""
    echo "SQL Command to run:"
    echo "$SQL"
fi

