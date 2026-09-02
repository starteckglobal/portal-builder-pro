-- Live meetings visible to every registered user while they are running.
create table if not exists public.live_meetings (
  id uuid primary key default gen_random_uuid(),
  room_name text not null,
  title text not null default 'Live meeting',
  host_id uuid not null references auth.users(id) on delete cascade,
  host_name text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_seen_at timestamptz not null default now()
);

grant select, insert, update, delete on public.live_meetings to authenticated;
grant all on public.live_meetings to service_role;

alter table public.live_meetings enable row level security;

create policy "Authenticated users can view live meetings"
  on public.live_meetings for select to authenticated using (true);

create policy "Hosts can start meetings"
  on public.live_meetings for insert to authenticated with check (auth.uid() = host_id);

create policy "Hosts can update their meetings"
  on public.live_meetings for update to authenticated using (auth.uid() = host_id);

create policy "Hosts can delete their meetings"
  on public.live_meetings for delete to authenticated using (auth.uid() = host_id);

create index if not exists live_meetings_active_idx on public.live_meetings (ended_at, started_at desc);

alter table public.live_meetings replica identity full;
alter publication supabase_realtime add table public.live_meetings;
