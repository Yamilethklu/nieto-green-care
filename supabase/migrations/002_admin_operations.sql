-- Operational admin upgrade: pending quotes, extended funnel metadata and explicit daily capacity.
ALTER TYPE public.lead_status ADD VALUE IF NOT EXISTS 'pending' BEFORE 'scheduled';

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS calendar_event_id text;

ALTER TABLE public.leads ALTER COLUMN status SET DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS public.schedule_capacity(
  service_date date PRIMARY KEY,
  -- Zero means no scheduling capacity has been configured for the date yet.
  -- Administrators must explicitly choose a positive capacity before scheduling work.
  max_slots integer NOT NULL DEFAULT 0 CHECK(max_slots >= 0),
  booked_slots integer NOT NULL DEFAULT 0 CHECK(booked_slots >= 0),
  is_blocked boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(booked_slots <= max_slots)
);

ALTER TABLE public.schedule_capacity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins schedule capacity" ON public.schedule_capacity;
CREATE POLICY "admins schedule capacity" ON public.schedule_capacity FOR ALL USING(public.is_admin()) WITH CHECK(public.is_admin());

DROP TRIGGER IF EXISTS schedule_capacity_updated ON public.schedule_capacity;
CREATE TRIGGER schedule_capacity_updated BEFORE UPDATE ON public.schedule_capacity FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.recalculate_booked_slots(target_date date) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  scheduled_count integer;
BEGIN
  SELECT count(*)::integer INTO scheduled_count
  FROM public.leads
  WHERE requested_date=target_date AND status='scheduled';

  -- Do not invent business capacity for dates the administrator has not configured.
  -- If a configured date would be exceeded, fail the scheduling transaction.
  IF EXISTS (
    SELECT 1 FROM public.schedule_capacity
    WHERE service_date=target_date
      AND (is_blocked OR scheduled_count > max_slots)
  ) THEN
    RAISE EXCEPTION 'Service date is blocked or at capacity';
  END IF;

  UPDATE public.schedule_capacity
  SET booked_slots=scheduled_count
  WHERE service_date=target_date;
END;$$;

CREATE OR REPLACE FUNCTION public.sync_schedule_capacity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='UPDATE' AND OLD.requested_date IS NOT NULL THEN
    PERFORM public.recalculate_booked_slots(OLD.requested_date);
  END IF;
  IF NEW.requested_date IS NOT NULL THEN
    PERFORM public.recalculate_booked_slots(NEW.requested_date);
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS leads_capacity_sync ON public.leads;
CREATE TRIGGER leads_capacity_sync AFTER INSERT OR UPDATE OF status,requested_date ON public.leads FOR EACH ROW EXECUTE FUNCTION public.sync_schedule_capacity();
