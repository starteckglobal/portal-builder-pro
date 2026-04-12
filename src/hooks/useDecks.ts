import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  layout: "title" | "bullets" | "two-column" | "image-text" | "closing";
  notes: string;
}

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  business_name: string | null;
  topic: string | null;
  tone: string | null;
  slides: Slide[];
  theme: string | null;
  created_at: string;
  updated_at: string;
}

export function useDecks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["decks", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((d) => ({ ...d, slides: d.slides || [] })) as Deck[];
    },
    enabled: !!user,
  });
}

export function useCreateDeck() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (deck: { title: string; business_name?: string; topic?: string; tone?: string; slides?: Slide[]; theme?: string }) => {
      const { data, error } = await supabase
        .from("decks")
        .insert({ ...deck, user_id: user!.id, slides: (deck.slides || []) as any })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  });
}

export function useUpdateDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; slides?: Slide[]; theme?: string; business_name?: string }) => {
      const payload: any = { ...updates };
      if (updates.slides) payload.slides = updates.slides as any;
      const { error } = await supabase.from("decks").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  });
}

export function useDeleteDeck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("decks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  });
}
