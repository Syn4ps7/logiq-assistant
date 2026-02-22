
CREATE TABLE public.contact_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact lead"
  ON public.contact_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact leads"
  ON public.contact_leads FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact leads"
  ON public.contact_leads FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
