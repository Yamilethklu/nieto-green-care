-- Safe upgrade for databases where migration 002 has already been applied.
-- Preserves existing leads and capacity rows while removing invented defaults
-- and enforcing capacity for configured service dates.

ALTER TABLE public.schedule_capacity
  ALTER COLUMN max_slots SET DEFAULT 0;

-- Replace the previous constraint that allowed over-capacity rows when blocked.
ALTER TABLE public.schedule_capacity
  DROP CONSTRAINT IF EXISTS schedule_capacity_check;
ALTER TABLE public.schedule_capacity
  DROP CONSTRAINT IF EXISTS schedule_capacity_booked_slots_check;
ALTER TABLE public.schedule_capacity
  DROP CONSTRAINT IF EXISTS schedule_capacity_max_slots_check;

-- Keep the original non-negative checks if PostgreSQL generated different names;
-- add explicit, stable constraints only when missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.schedule_capacity'::regclass
      AND conname='schedule_capacity_max_nonnegative'
  ) THEN
    ALTER TABLE public.schedule_capacity
      ADD CONSTRAINT schedule_capacity_max_nonnegative CHECK(max_slots >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.schedule_capacity'::regclass
      AND conname='schedule_capacity_booked_nonnegative'
  ) THEN
    ALTER TABLE public.schedule_capacity
      ADD CONSTRAINT schedule_capacity_booked_nonnegative CHECK(booked_slots >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.schedule_capacity'::regclass
      AND conname='schedule_capacity_not_overbooked'
  ) THEN
    ALTER TABLE public.schedule_capacity
      ADD CONSTRAINT schedule_capacity_not_overbooked CHECK(booked_slots <= max_slots) NOT VALID;
  END IF;
END $$;

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

  -- Dates without a capacity row are intentionally left untracked. Once an
  -- administrator configures a date, blocking and maximum capacity are strict.
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

-- Validate the strict capacity constraint only when existing data already fits.
-- If legacy data is over capacity, keep the constraint NOT VALID so new/updated
-- rows are protected without deleting or rewriting historical records.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.schedule_capacity WHERE booked_slots > max_slots
  ) THEN
    ALTER TABLE public.schedule_capacity
      VALIDATE CONSTRAINT schedule_capacity_not_overbooked;
  END IF;
END $$;
