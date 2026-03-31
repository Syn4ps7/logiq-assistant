CREATE POLICY "Users can view own reservations by email"
ON public.reservations
FOR SELECT
TO authenticated
USING (contact_email = (auth.jwt()->>'email'));