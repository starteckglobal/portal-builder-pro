ALTER TABLE public.decks ADD COLUMN IF NOT EXISTS generation_config JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.decks ADD COLUMN IF NOT EXISTS source_files JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.decks ADD COLUMN IF NOT EXISTS document_version INTEGER NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS public.deck_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  source_filename TEXT,
  layout_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
  fonts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deck_templates TO authenticated;
GRANT ALL ON public.deck_templates TO service_role;
ALTER TABLE public.deck_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deck templates" ON public.deck_templates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_deck_templates_updated_at BEFORE UPDATE ON public.deck_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
