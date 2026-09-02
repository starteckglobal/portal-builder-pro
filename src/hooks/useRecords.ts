import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Generic user-scoped table hooks used by the portal "+ Add" forms.
 * Tables are staged in this draft, so queries are untyped on purpose.
 */
const db = supabase as any;

export function useRecords<T = any>(
  table: string,
  order?: { column: string; ascending?: boolean },
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [table, user?.id],
    queryFn: async () => {
      let q = db.from(table).select("*");
      if (order) q = q.order(order.column, { ascending: order.ascending ?? false });
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as T[];
    },
    enabled: !!user,
    retry: false,
  });
}

export function useAddRecord(table: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (values: Record<string, any>) => {
      if (!user) throw new Error("You must be signed in to add a record");
      const { data, error } = await db
        .from(table)
        .insert({ ...values, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

export function useDeleteRecord(table: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });
}

// ── Convenience wrappers per section ────────────────────────
export const useClients = () => useRecords("clients", { column: "created_at" });
export const useCalendarPosts = () => useRecords("calendar_posts", { column: "post_date", ascending: true });
export const useMeetingNotes = () => useRecords("meeting_notes", { column: "meeting_date" });
export const useCompetitorNotes = () => useRecords("competitor_notes", { column: "note_date" });
export const useBoilerplates = () => useRecords("boilerplates", { column: "created_at" });
export const useROIScenarios = () => useRecords("roi_scenarios", { column: "created_at" });
export const useReports = () => useRecords("reports", { column: "created_at" });
export const useChatMessages = () => useRecords("chat_messages", { column: "created_at", ascending: true });
