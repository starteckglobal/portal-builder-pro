-- Portal "+ Add" forms: clients record plus per-section tables (additive only)

-- ── CLIENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  industry text,
  website text,
  contact_email text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own clients" ON public.clients FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS clients_user_idx ON public.clients(user_id);

-- ── SOCIAL CALENDAR ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calendar_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_date date NOT NULL DEFAULT current_date,
  post_time text,
  channel text NOT NULL DEFAULT 'IG',
  caption text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  client text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_posts TO authenticated;
GRANT ALL ON public.calendar_posts TO service_role;
ALTER TABLE public.calendar_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calendar posts" ON public.calendar_posts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_calendar_posts_updated_at BEFORE UPDATE ON public.calendar_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS calendar_posts_user_date_idx ON public.calendar_posts(user_id, post_date);

-- ── MEETING NOTES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  meeting_date date DEFAULT current_date,
  attendees text,
  notes text,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  client text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_notes TO authenticated;
GRANT ALL ON public.meeting_notes TO service_role;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meeting notes" ON public.meeting_notes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_meeting_notes_updated_at BEFORE UPDATE ON public.meeting_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── COMPETITOR NOTES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competitor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  competitor text NOT NULL,
  source text,
  note text,
  urgency text NOT NULL DEFAULT 'medium',
  note_date date DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitor_notes TO authenticated;
GRANT ALL ON public.competitor_notes TO service_role;
ALTER TABLE public.competitor_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own competitor notes" ON public.competitor_notes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_competitor_notes_updated_at BEFORE UPDATE ON public.competitor_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── BOILERPLATES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.boilerplates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client text NOT NULL,
  body text NOT NULL,
  generated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.boilerplates TO authenticated;
GRANT ALL ON public.boilerplates TO service_role;
ALTER TABLE public.boilerplates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own boilerplates" ON public.boilerplates FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_boilerplates_updated_at BEFORE UPDATE ON public.boilerplates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── ROI SCENARIOS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.roi_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  client text,
  retainer numeric NOT NULL DEFAULT 0,
  ad_value numeric NOT NULL DEFAULT 0,
  months integer NOT NULL DEFAULT 12,
  roi numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roi_scenarios TO authenticated;
GRANT ALL ON public.roi_scenarios TO service_role;
ALTER TABLE public.roi_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own roi scenarios" ON public.roi_scenarios FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_roi_scenarios_updated_at BEFORE UPDATE ON public.roi_scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── REPORTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  client text,
  period text,
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reports" ON public.reports FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── TEAM CHAT MESSAGES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'general',
  author text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat messages" ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS chat_messages_channel_idx ON public.chat_messages(user_id, channel, created_at);

-- ── ADDITIVE COLUMNS ON EXISTING TABLES ────────────────────
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS client_id uuid;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.coverage ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE public.coverage ADD COLUMN IF NOT EXISTS client_id uuid;
ALTER TABLE public.kanban_cards ADD COLUMN IF NOT EXISTS owner text;
ALTER TABLE public.kanban_cards ADD COLUMN IF NOT EXISTS due_date date;