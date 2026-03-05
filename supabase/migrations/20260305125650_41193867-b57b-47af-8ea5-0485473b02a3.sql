
-- Create reservations table
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reference text NOT NULL,
  source text NOT NULL DEFAULT 'b2c', -- 'b2c' or 'b2b'
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  plan text NOT NULL,
  pack text,
  vehicle_name text NOT NULL,
  vehicle_id text NOT NULL,
  start_date text,
  end_date text,
  days integer NOT NULL DEFAULT 1,
  options text,
  est_km integer NOT NULL DEFAULT 200,
  total_chf numeric(10,2) NOT NULL,
  delivery_address text,
  delivery_npa text,
  delivery_city text,
  delivery_phone text,
  delivery_instructions text
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form, no auth required)
CREATE POLICY "Anyone can submit a reservation"
  ON public.reservations FOR INSERT
  WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view reservations"
  ON public.reservations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete
CREATE POLICY "Admins can delete reservations"
  ON public.reservations FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));
