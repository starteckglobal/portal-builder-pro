-- Meeting backend: every meeting is a stored record, with participants and history.
create table if not exists public.live_meetings (
  id uuid primary key default gen_random_uuid(),
  room_name text not null unique,
  title text not null default 'Live meeting',
  host_id uuid not null references auth.users(id) on delete cascade,
  host_name text,
  status text not null default 'live',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  last_seen_at timestamptz not null default now()
);

grant select, insert, update, delete on public.live_meetings to authenticated;
grant all on public.live_meetings to service_role;

alter table public.live_meetings enable row level security;

create policy "Authenticated users can view meetings"
  on public.live_meetings for select to authenticated using (true);

create policy "Users can create meetings"
  on public.live_meetings for insert to authenticated with check (auth.uid() = host_id);

-- Any signed-in participant may refresh the heartbeat; only the host may end it.
create policy "Participants can keep meetings alive"
  on public.live_meetings for update to authenticated using (true) with check (true);

create policy "Hosts can delete their meetings"
  on public.live_meetings for delete to authenticated using (auth.uid() = host_id);

create index if not exists live_meetings_active_idx on public.live_meetings (status, started_at desc);

-- Who is (or was) in each meeting.
create table if not exists public.meeting_participants (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.live_meetings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  last_seen_at timestamptz not null default now(),
  unique (meeting_id, user_id)
);

grant select, insert, update, delete on public.meeting_participants to authenticated;
grant all on public.meeting_participants to service_role;

alter table public.meeting_participants enable row level security;

create policy "Authenticated users can view participants"
  on public.meeting_participants for select to authenticated using (true);

create policy "Users manage their own participation"
  on public.meeting_participants for insert to authenticated with check (auth.uid() = user_id);

create policy "Users update their own participation"
  on public.meeting_participants for update to authenticated using (auth.uid() = user_id);

create index if not exists meeting_participants_meeting_idx on public.meeting_participants (meeting_id, left_at);

-- Auto-end meetings whose heartbeat has gone stale.
create or replace function public.expire_stale_meetings()
returns void
language sql
security definer
set search_path = public
as $$
  update public.live_meetings
     set status = 'ended', ended_at = coalesce(ended_at, last_seen_at)
   where status = 'live'
     and last_seen_at < now() - interval '3 minutes';
$$;

grant execute on function public.expire_stale_meetings() to authenticated, service_role;

alter table public.live_meetings replica identity full;
alter table public.meeting_participants replica identity full;
alter publication supabase_realtime add table public.live_meetings;
alter publication supabase_realtime add table public.meeting_participants;
