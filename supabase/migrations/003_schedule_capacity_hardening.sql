-- Upgrade the legacy schedule_capacity table used by the existing production DB.
-- Legacy columns: service_date, is_full, note, updated_at.
-- This migration preserves all existing rows and converts is_full into is_blocked.

ALTER TABLE public.schedule_capacity
  ADD COLUMN IF NOT EXISTS max_slots integer,
  ADD COLUMN IF NOT EXISTS booked_slots integer,
  ADD COLUMN IF NOT EXISTS is_blocked boolean,
  ADD COLUMN IF NOT EXISTS created_at timestamptz;

-- Preserve legacy meaning: an old full date becomes blocked until an admin
-- explicitly reviews and configures its real capacity.
UPDATE public.schedule_capacity
SET
  max_slots = COALESCE(max_slots, 0),
  booked_slots = COALESCE(booked_slots, 0),
  is_blocked = COALESCE(is_blocked, is_full, false),
  created_at = COALESCE(created_at, updated_at, now());

ALTER TABLE public.schedule_capacity
  ALTER COLUMN max_slots SET DEFAULT 0,
  ALTER COLUMN max_slots SET NOT NULL,
  ALTER COLUMN booked_slots SET DEFAULT 0,
  ALTER COLUMN booked_slots SET NOT NULL,
  ALTER COLUMN is_blocked SET DEFAULT false,
  ALTER COLUMN is_blocked SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.schedule_capacity
  DROP CONSTRAINT IF EXISTS schedule_capacity_max_nonnegative,
  DROP CONSTRAINT IF EXISTS schedule_capacity_booked_nonnegative,
  DROP CONSTRAINT IF EXISTS schedule_capacity_not_overbooked;

ALTER TABLE public.schedule_capacity
  ADD CONSTRAINT schedule_capacity_max_nonnegative CHECK(max_slots >= 0),
  ADD CONSTRAINT schedule_capacity_booked_nonnegative CHECK(booked_slots >= 0),
  ADD CONSTRAINT schedule_capacity_not_overbooked CHECK(booked_slots <= max_slots);

CREATE OR REPLACE FUNCTION public.recalculate_booked_slots(target_date date) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
  scheduled_count integer;
  configured_max integer;
  blocked boolean;
BEGIN
  SELECT count(*)::integer INTO scheduled_count
  FROM public.leads
  WHERE requested_date=target_date AND status='scheduled';

  SELECT max_slots,is_blocked INTO configured_max,blocked
  FROM public.schedule_capacity
  WHERE service_date=target_date
  FOR UPDATE;

  IF FOUND THEN
    IF blocked OR scheduled_count > configured_max THEN
      RAISE EXCEPTION 'Service date is blocked or at capacity';
    END IF;

    UPDATE public.schedule_capacity
    SET booked_slots=scheduled_count
    WHERE service_date=target_date;
  END IF;
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
CREATE TRIGGER leads_capacity_sync
AFTER INSERT OR UPDATE OF status,requested_date ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.sync_schedule_capacity();

-- Keep the legacy is_full column temporarily for rollback compatibility.
-- New application code uses is_blocked/max_slots/booked_slots only.
