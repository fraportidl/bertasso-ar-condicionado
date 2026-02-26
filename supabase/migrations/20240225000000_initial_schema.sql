-- Create Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  type TEXT CHECK (type IN ('Commercial Account', 'Residential')),
  address TEXT,
  sub TEXT,
  status TEXT CHECK (status IN ('Active', 'Inactive', 'Lead')) DEFAULT 'Lead',
  img TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Technician',
  img TEXT,
  status TEXT CHECK (status IN ('Available', 'On Site', 'Off Duty')) DEFAULT 'Available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Services (Appointments) table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('Scheduled', 'En Route', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for now for simplicity in this demo, but in production you'd restrict this)
CREATE POLICY "Allow public read access" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON clients FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON technicians FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON technicians FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON services FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON services FOR UPDATE USING (true);
