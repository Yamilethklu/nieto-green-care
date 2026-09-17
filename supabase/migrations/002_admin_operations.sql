-- Operational admin upgrade: pending quotes, extended funnel metadata and daily capacity.
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'scheduled';

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS calendar_event_id text;

ALTER TABLE public.leads ALTER COLUMN status SET DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS public.schedule_capacity(
  service_date date PRIMARY KEY,
  max_slots integer NOT NULL DEFAULT 8 CHECK(max_slots >= 0),
  booked_slots integer NOT NULL DEFAULT 0 CHECK(booked_slots >= 0),
  is_blocked boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(booked_slots <= max_slots OR is_blocked)
);

ALTER TABLE public.schedule_capacity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins schedule capacity" ON public.schedule_capacity;
CREATE POLICY "admins schedule capacity" ON public.schedule_capacity FOR ALL USING(public.is_admin()) WITH CHECK(public.is_admin());

DROP TRIGGER IF EXISTS schedule_capacity_updated ON public.schedule_capacity;
CREATE TRIGGER schedule_capacity_updated BEFORE UPDATE ON public.schedule_capacity FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.recalculate_booked_slots(target_date date) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.schedule_capacity(service_date,booked_slots)
  VALUES(target_date,(SELECT count(*) FROM public.leads WHERE requested_date=target_date AND status='scheduled'))
  ON CONFLICT(service_date) DO UPDATE SET booked_slots=(SELECT count(*) FROM public.leads WHERE requested_date=target_date AND status='scheduled');
END;$$;

CREATE OR REPLACE FUNCTION public.sync_schedule_capacity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='UPDATE' AND OLD.requested_date IS NOT NULL THEN PERFORM public.recalculate_booked_slots(OLD.requested_date); END IF;
  IF NEW.requested_date IS NOT NULL THEN PERFORM public.recalculate_booked_slots(NEW.requested_date); END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS leads_capacity_sync ON public.leads;
CREATE TRIGGER leads_capacity_sync AFTER INSERT OR UPDATE OF status,requested_date ON public.leads FOR EACH ROW EXECUTE FUNCTION public.sync_schedule_capacity();
