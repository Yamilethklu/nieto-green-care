alter table public.leads
  add column if not exists is_cellphone boolean;

comment on column public.leads.is_cellphone is
  'Whether the submitted contact number can receive mobile calls or SMS.';
