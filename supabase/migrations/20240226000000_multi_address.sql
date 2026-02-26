-- Add CPF to clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Create Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  street TEXT NOT NULL,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Policies for addresses
CREATE POLICY "Allow public read access" ON addresses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON addresses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON addresses FOR DELETE USING (true);

-- Migrate existing addresses from clients to addresses table
-- Note: This assumes 'address' was the street and 'sub' was neighborhood/zip
INSERT INTO addresses (client_id, street, neighborhood, is_primary)
SELECT id, COALESCE(address, 'Endereço não informado'), sub, true FROM clients;

-- Remove old columns from clients
ALTER TABLE clients DROP COLUMN IF EXISTS address;
ALTER TABLE clients DROP COLUMN IF EXISTS sub;
