-- Add client_name column to leads table (local database)
ALTER TABLE leads ADD COLUMN client_name VARCHAR(255) NULL AFTER school_name;