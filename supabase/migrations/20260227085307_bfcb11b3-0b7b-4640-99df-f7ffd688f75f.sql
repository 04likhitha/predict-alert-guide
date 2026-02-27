
-- User roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'operator', 'technician');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'operator',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Sensor readings table for historical data
CREATE TABLE public.sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL,
  asset_type text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  wind_speed numeric,
  rotor_speed numeric,
  gearbox_temp numeric,
  panel_voltage numeric,
  panel_current numeric,
  module_temp numeric,
  irradiance numeric,
  power_output numeric NOT NULL,
  ambient_temp numeric NOT NULL,
  humidity numeric NOT NULL,
  failure_type text NOT NULL DEFAULT 'normal',
  rul_hours numeric NOT NULL DEFAULT 450,
  confidence numeric NOT NULL DEFAULT 0.85,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view readings" ON public.sensor_readings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert readings" ON public.sensor_readings
  FOR INSERT TO authenticated WITH CHECK (true);

-- Index for fast queries
CREATE INDEX idx_sensor_readings_asset ON public.sensor_readings(asset_id, timestamp DESC);
CREATE INDEX idx_sensor_readings_time ON public.sensor_readings(timestamp DESC);

-- Enable realtime for sensor readings
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;

-- Alerts history table
CREATE TABLE public.alerts_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message text NOT NULL,
  failure_type text,
  rul_hours numeric,
  acknowledged boolean NOT NULL DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id),
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view alerts" ON public.alerts_history
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert alerts" ON public.alerts_history
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update alerts" ON public.alerts_history
  FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_alerts_history_asset ON public.alerts_history(asset_id, created_at DESC);

-- Maintenance tasks table
CREATE TABLE public.maintenance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL,
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  assigned_to uuid REFERENCES auth.users(id),
  scheduled_date date,
  completed_date date,
  estimated_hours numeric,
  actual_hours numeric,
  cost_estimate numeric,
  actual_cost numeric,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view tasks" ON public.maintenance_tasks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tasks" ON public.maintenance_tasks
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks" ON public.maintenance_tasks
  FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_maintenance_tasks_updated_at
  BEFORE UPDATE ON public.maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Spare parts inventory
CREATE TABLE public.spare_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  part_number text UNIQUE NOT NULL,
  category text NOT NULL,
  compatible_asset_type text NOT NULL CHECK (compatible_asset_type IN ('wind', 'solar', 'both')),
  quantity_in_stock integer NOT NULL DEFAULT 0,
  reorder_level integer NOT NULL DEFAULT 5,
  unit_cost numeric NOT NULL DEFAULT 0,
  supplier text,
  lead_time_days integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view parts" ON public.spare_parts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage parts" ON public.spare_parts
  FOR ALL TO authenticated USING (true);

CREATE TRIGGER update_spare_parts_updated_at
  BEFORE UPDATE ON public.spare_parts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Activity logs
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id, created_at DESC);

-- Reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('maintenance', 'performance', 'financial', 'sustainability', 'custom')),
  parameters jsonb,
  generated_by uuid REFERENCES auth.users(id),
  file_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view reports" ON public.reports
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update reports" ON public.reports
  FOR UPDATE TO authenticated USING (true);

-- AI predictions log
CREATE TABLE public.ai_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL,
  prediction_type text NOT NULL CHECK (prediction_type IN ('failure', 'rul', 'anomaly', 'maintenance')),
  result jsonb NOT NULL,
  confidence numeric,
  model_used text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view predictions" ON public.ai_predictions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert predictions" ON public.ai_predictions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_ai_predictions_asset ON public.ai_predictions(asset_id, created_at DESC);

-- Trigger to assign default role on new user signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'operator');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();
