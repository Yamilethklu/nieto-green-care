alter table public.leads
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists postal_code text,
  add column if not exists property_occupancy text check (property_occupancy in ('occupied','vacant')),
  add column if not exists mow_area text check (mow_area in ('front_back','front','back')),
  add column if not exists corner_lot boolean not null default false,
  add column if not exists optional_services text[] not null default '{}',
  add column if not exists property_answers jsonb not null default '{}',
  add column if not exists referral_source text;

comment on column public.leads.property_answers is
  'Validated yes/no answers about grass height, gates, flower beds, pets, fencing, pool, and trampoline.';
