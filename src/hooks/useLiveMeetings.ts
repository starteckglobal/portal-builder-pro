import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LiveMeeting {
  id: string;
  room_name: string;
  title: string;
  host_id: string;
  host_name: string | null;
  started_at: string;
  ended_at: string | null;
  last_seen_at: string;
}

const KEY = ["live_meetings"];

/** Active meetings (not ended, seen in the last 2 minutes), realtime-refreshed. */
export const useLiveMeetings = () => {
  const qc = useQueryClient();
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel(`live-meetings-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "live_meetings" }, () => {
        qc.invalidateQueries({ queryKey: KEY });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc, session]);

  return useQuery({
    queryKey: KEY,
    enabled: !!session,
    refetchInterval: 20000,
    queryFn: async (): Promise<LiveMeeting[]> => {
      const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("live_meetings" as never)
        .select("*")
        .is("ended_at", null)
        .gte("last_seen_at", cutoff)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as LiveMeeting[];
    },
  });
};

/** Announce a meeting, keep it alive with a heartbeat, and end it on leave. */
export const useMeetingPresence = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const start = useMutation({
    mutationFn: async ({ room, title }: { room: string; title: string }) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("live_meetings" as never)
        .insert({
          room_name: room,
          title,
          host_id: user.id,
          host_name: (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Host",
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      return (data as unknown as { id: string }).id;
    },
    onSuccess: invalidate,
  });

  const heartbeat = async (id: string) => {
    await supabase.from("live_meetings" as never).update({ last_seen_at: new Date().toISOString() } as never).eq("id", id);
  };

  const end = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("live_meetings" as never)
        .update({ ended_at: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { start, end, heartbeat };
};
