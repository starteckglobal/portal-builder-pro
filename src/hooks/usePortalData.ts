import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Lead = Tables<"leads">;
export type Contact = Tables<"contacts">;
export type Coverage = Tables<"coverage">;
export type KanbanCard = Tables<"kanban_cards">;
export type Notification = Tables<"notifications">;

// ─── LEADS ──────────────────────────────────────────────────
export function useLeads() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["leads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("score", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user,
  });
}

export function useAddLead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (lead: Omit<TablesInsert<"leads">, "user_id">) => {
      const { data, error } = await supabase.from("leads").insert({ ...lead, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

// ─── CONTACTS ───────────────────────────────────────────────
export function useContacts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*").order("name");
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!user,
  });
}

export function useAddContact() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (contact: Omit<TablesInsert<"contacts">, "user_id">) => {
      const { data, error } = await supabase.from("contacts").insert({ ...contact, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });
}

// ─── COVERAGE ───────────────────────────────────────────────
export function useCoverage() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["coverage", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("coverage").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data as Coverage[];
    },
    enabled: !!user,
  });
}

export function useAddCoverage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (cov: Omit<TablesInsert<"coverage">, "user_id">) => {
      const { data, error } = await supabase.from("coverage").insert({ ...cov, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coverage"] }),
  });
}

// ─── KANBAN ─────────────────────────────────────────────────
export function useKanbanCards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["kanban_cards", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("kanban_cards").select("*").order("position");
      if (error) throw error;
      return data as KanbanCard[];
    },
    enabled: !!user,
  });
}

export function useUpdateKanbanCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, column_name, position }: { id: string; column_name: string; position?: number }) => {
      const { error } = await supabase.from("kanban_cards").update({ column_name, position }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kanban_cards"] }),
  });
}

export function useAddKanbanCard() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (card: Omit<TablesInsert<"kanban_cards">, "user_id">) => {
      const { data, error } = await supabase.from("kanban_cards").insert({ ...card, user_id: user!.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kanban_cards"] }),
  });
}

// ─── NOTIFICATIONS ──────────────────────────────────────────
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
