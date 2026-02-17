
-- Table for Pro lead submissions
CREATE TABLE public.pro_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT,
  estimated_volume TEXT,
  need TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pro_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public form, no auth required)
CREATE POLICY "Anyone can submit a pro lead"
  ON public.pro_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT/UPDATE/DELETE for public users (admin-only via service role)
