
CREATE TABLE public.decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  business_name TEXT,
  topic TEXT,
  tone TEXT DEFAULT 'professional',
  slides JSONB DEFAULT '[]'::jsonb,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own decks"
  ON public.decks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_decks_updated_at
  BEFORE UPDATE ON public.decks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
