ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS property_occupancy text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS mow_area text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_corner_lot boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS grass_over_6in boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS grass_over_12in boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS community_gate boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS backyard_gate boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS flower_beds boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS pets_in_backyard boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS white_vinyl_fence boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS above_ground_pool boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS trampoline boolean NOT NULL DEFAULT false;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS optional_services text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS special_requests text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS payment_preference text;

CREATE TABLE IF NOT EXISTS public.schedule_capacity (
  service_date date PRIMARY KEY,
  capacity integer NOT NULL DEFAULT 0 CHECK (capacity >= 0),
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.schedule_capacity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins manage schedule capacity" ON public.schedule_capacity;
CREATE POLICY "admins manage schedule capacity" ON public.schedule_capacity FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
