-- Final operational hardening after the legacy schedule_capacity upgrade.
-- Preserve existing appointments, expose calendar sync health, and restrict helper functions.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS calendar_sync_status text NOT NULL DEFAULT 'not_scheduled',
  ADD COLUMN IF NOT EXISTS calendar_sync_error text,
  ADD COLUMN IF NOT EXISTS calendar_synced_at timestamptz;

ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_calendar_sync_status_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_calendar_sync_status_check
  CHECK (calendar_sync_status IN ('not_scheduled','pending','synced','failed'));

-- Existing Calendar-linked rows are already synchronized.
UPDATE public.leads
SET calendar_sync_status='synced', calendar_synced_at=COALESCE(calendar_synced_at, now()), calendar_sync_error=NULL
WHERE calendar_event_id IS NOT NULL;

-- Preserve any appointments that predate explicit capacity configuration.
WITH counts AS (
  SELECT requested_date AS service_date, count(*)::integer AS scheduled_count
  FROM public.leads
  WHERE status='scheduled' AND requested_date IS NOT NULL
  GROUP BY requested_date
)
UPDATE public.schedule_capacity sc
SET max_slots=GREATEST(sc.max_slots, counts.scheduled_count),
    booked_slots=counts.scheduled_count
FROM counts
WHERE sc.service_date=counts.service_date;

UPDATE public.schedule_capacity sc
SET booked_slots=0
WHERE NOT EXISTS (
  SELECT 1 FROM public.leads l
  WHERE l.requested_date=sc.service_date AND l.status='scheduled'
);

-- Keep the legacy is_full flag compatible until the old production code is retired.
CREATE OR REPLACE FUNCTION public.sync_schedule_legacy_flags() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
  IF NEW.is_blocked IS DISTINCT FROM OLD.is_blocked THEN
    NEW.is_full := NEW.is_blocked;
  ELSIF NEW.is_full IS DISTINCT FROM OLD.is_full THEN
    NEW.is_blocked := NEW.is_full;
  ELSE
    NEW.is_full := NEW.is_blocked;
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS schedule_capacity_legacy_flags ON public.schedule_capacity;
CREATE TRIGGER schedule_capacity_legacy_flags
BEFORE UPDATE OF is_blocked,is_full ON public.schedule_capacity
FOR EACH ROW EXECUTE FUNCTION public.sync_schedule_legacy_flags();

UPDATE public.schedule_capacity SET is_full=is_blocked WHERE is_full IS DISTINCT FROM is_blocked;

-- SECURITY DEFINER helpers are intended for triggers, not direct client calls.
REVOKE ALL ON FUNCTION public.recalculate_booked_slots(date) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_schedule_capacity() FROM PUBLIC, anon, authenticated;
