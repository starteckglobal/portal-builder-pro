import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  display_name: string | null;
  joined_at: string;
  left_at: string | null;
}

export interface LiveMeeting {
  id: string;
  room_name: string;
  title: string;
  host_id: string;
  host_name: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  last_seen_at: string;
  meeting_participants?: MeetingParticipant[];
}

const KEY = ["live_meetings"];
const HISTORY_KEY = ["live_meetings", "history"];
const table = (name: string) => supabase.from(name as never);

const SELECT = "*, meeting_participants(id,meeting_id,user_id,display_name,joined_at,left_at)";

/** Meetings currently running, with their participants. Realtime + polling refreshed. */
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
      .on("postgres_changes", { event: "*", schema: "public", table: "meeting_participants" }, () => {
        qc.invalidateQueries({ queryKey: KEY });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc, session]);

  return useQuery({
    queryKey: KEY,
    enabled: !!session,
    refetchInterval: 15000,
    queryFn: async (): Promise<LiveMeeting[]> => {
      // Close out meetings whose host stopped sending heartbeats.
      await supabase.rpc("expire_stale_meetings" as never).then(
        () => undefined,
        () => undefined,
      );
      const { data, error } = await table("live_meetings")
        .select(SELECT)
        .eq("status", "live")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as LiveMeeting[];
    },
  });
};

/** Past meetings kept as portal records. */
export const useMeetingHistory = (limit = 12) => {
  const { session } = useAuth();
  return useQuery({
    queryKey: [...HISTORY_KEY, limit],
    enabled: !!session,
    queryFn: async (): Promise<LiveMeeting[]> => {
      const { data, error } = await table("live_meetings")
        .select(SELECT)
        .neq("status", "live")
        .order("started_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as LiveMeeting[];
    },
  });
};

export const activeCount = (m: LiveMeeting) =>
  (m.meeting_participants ?? []).filter((p) => !p.left_at).length;

/**
 * Meeting lifecycle against the portal database: create a stored meeting, register
 * participation, heartbeat while in the room, and close the record on leave.
 */
export const useMeetingPresence = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: HISTORY_KEY });
  };

  const displayName = () =>
    (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "Team member";

  const registerParticipant = async (meetingId: string) => {
    if (!user) return;
    await table("meeting_participants")
      .upsert(
        {
          meeting_id: meetingId,
          user_id: user.id,
          display_name: displayName(),
          joined_at: new Date().toISOString(),
          left_at: null,
          last_seen_at: new Date().toISOString(),
        } as never,
        { onConflict: "meeting_id,user_id" } as never,
      )
      .then(() => undefined, () => undefined);
  };

  /** Create the stored meeting record and join it. */
  const start = useMutation({
    mutationFn: async ({ room, title }: { room: string; title: string }) => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await table("live_meetings")
        .insert({
          room_name: room,
          title: title.trim() || "Live meeting",
          host_id: user.id,
          host_name: displayName(),
          status: "live",
        } as never)
        .select("*")
        .single();
      if (error) throw error;
      const meeting = data as unknown as LiveMeeting;
      await registerParticipant(meeting.id);
      return meeting;
    },
    onSuccess: invalidate,
  });

  /** Join a stored meeting (by record or by room name), creating the record if needed. */
  const join = useMutation({
    mutationFn: async ({ room, title }: { room: string; title?: string }) => {
      if (!user) throw new Error("Not signed in");
      const { data: existing } = await table("live_meetings")
        .select("*")
        .eq("room_name", room)
        .eq("status", "live")
        .maybeSingle();
      let meeting = existing as unknown as LiveMeeting | null;
      if (!meeting) {
        meeting = await start.mutateAsync({ room, title: title || "Live meeting" });
        return meeting;
      }
      await registerParticipant(meeting.id);
      await table("live_meetings")
        .update({ last_seen_at: new Date().toISOString() } as never)
        .eq("id", meeting.id);
      return meeting;
    },
    onSuccess: invalidate,
  });

  const heartbeat = async (id: string) => {
    const now = new Date().toISOString();
    await table("live_meetings").update({ last_seen_at: now } as never).eq("id", id);
    if (user) {
      await table("meeting_participants")
        .update({ last_seen_at: now } as never)
        .eq("meeting_id", id)
        .eq("user_id", user.id);
    }
  };

  /** Leave the room: mark participation closed, and end the meeting if you host it. */
  const leave = useMutation({
    mutationFn: async ({ id, isHost }: { id: string; isHost: boolean }) => {
      const now = new Date().toISOString();
      if (user) {
        await table("meeting_participants")
          .update({ left_at: now } as never)
          .eq("meeting_id", id)
          .eq("user_id", user.id);
      }
      if (isHost) {
        const { error } = await table("live_meetings")
          .update({ status: "ended", ended_at: now } as never)
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  return { start, join, leave, heartbeat };
};
