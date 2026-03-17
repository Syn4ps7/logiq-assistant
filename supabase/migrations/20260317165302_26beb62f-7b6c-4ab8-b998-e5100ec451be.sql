
-- Promo codes table
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent numeric NOT NULL DEFAULT 15,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promo codes" ON public.promo_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes FOR SELECT USING (is_active = true);

-- Promo usage tracking (one use per email)
CREATE TABLE public.promo_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  reservation_reference text NOT NULL,
  discount_amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (promo_code_id, customer_email)
);

ALTER TABLE public.promo_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view promo usage" ON public.promo_usage FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert promo usage" ON public.promo_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can check own usage" ON public.promo_usage FOR SELECT USING (true);

-- Add promo columns to reservations
ALTER TABLE public.reservations ADD COLUMN promo_code text DEFAULT NULL;
ALTER TABLE public.reservations ADD COLUMN discount_percent numeric DEFAULT 0;
ALTER TABLE public.reservations ADD COLUMN discount_amount numeric DEFAULT 0;

-- Insert initial LOGIQ promo code
INSERT INTO public.promo_codes (code, discount_percent, is_active) VALUES ('LOGIQ', 15, true);
