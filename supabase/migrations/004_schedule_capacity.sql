create table if not exists public.schedule_capacity (
  service_date date primary key,
  full boolean not null default false,
  note text,
  updated_at timestamptz not null default now()
);

alter table public.schedule_capacity enable row level security;
create policy "admins manage schedule capacity" on public.schedule_capacity
  for all using (public.is_admin()) with check (public.is_admin());
create trigger schedule_capacity_updated before update on public.schedule_capacity
  for each row execute function public.touch_updated_at();

comment on table public.schedule_capacity is
  'Admin-managed dates that the public quote calendar must mark as full; no capacity is fabricated by the client.';
