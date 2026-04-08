CREATE POLICY "Anyone can view reservation by reference"
ON public.reservations
FOR SELECT
TO anon, authenticated
USING (true);