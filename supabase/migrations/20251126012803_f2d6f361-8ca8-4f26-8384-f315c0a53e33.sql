-- Create enum for asset types
CREATE TYPE public.asset_type AS ENUM ('wind', 'solar');

-- Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id TEXT NOT NULL UNIQUE,
  asset_type asset_type NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  capacity NUMERIC,
  installation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read assets (public monitoring system)
CREATE POLICY "Anyone can view assets"
  ON public.assets
  FOR SELECT
  USING (true);

-- Allow anyone to insert assets (for demo purposes)
CREATE POLICY "Anyone can insert assets"
  ON public.assets
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update assets
CREATE POLICY "Anyone can update assets"
  ON public.assets
  FOR UPDATE
  USING (true);

-- Allow anyone to delete assets
CREATE POLICY "Anyone can delete assets"
  ON public.assets
  FOR DELETE
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial assets
INSERT INTO public.assets (asset_id, asset_type, name, location, capacity, installation_date) VALUES
  ('WT_1', 'wind', 'Wind Turbine 1', 'North Field', 2.5, '2022-01-15'),
  ('WT_2', 'wind', 'Wind Turbine 2', 'North Field', 2.5, '2022-01-15'),
  ('WT_3', 'wind', 'Wind Turbine 3', 'East Ridge', 2.5, '2022-03-20'),
  ('WT_4', 'wind', 'Wind Turbine 4', 'East Ridge', 2.5, '2022-03-20'),
  ('WT_5', 'wind', 'Wind Turbine 5', 'West Valley', 3.0, '2023-06-10'),
  ('SP_1', 'solar', 'Solar Panel 1', 'South Array', 0.5, '2021-08-05'),
  ('SP_2', 'solar', 'Solar Panel 2', 'South Array', 0.5, '2021-08-05'),
  ('SP_3', 'solar', 'Solar Panel 3', 'Central Grid', 0.5, '2022-05-12'),
  ('SP_4', 'solar', 'Solar Panel 4', 'Central Grid', 0.5, '2022-05-12'),
  ('SP_5', 'solar', 'Solar Panel 5', 'West Roof', 0.75, '2023-02-28');