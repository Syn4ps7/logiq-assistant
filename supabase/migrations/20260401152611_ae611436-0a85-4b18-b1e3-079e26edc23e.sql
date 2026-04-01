CREATE POLICY "Users can delete own reservations by email"
ON public.reservations
FOR DELETE
TO authenticated
USING (contact_email = (auth.jwt() ->> 'email'::text));