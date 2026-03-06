ALTER TABLE public.reservations
  ADD COLUMN start_time text DEFAULT NULL,
  ADD COLUMN end_time text DEFAULT NULL;