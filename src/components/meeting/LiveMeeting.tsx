/**
 * Live Meeting — embeds the official Jitsi Meet client via @jitsi/react-sdk,
 * the Jitsi team's React wrapper around modules/API/external/external_api.js
 * from github.com/jitsi/jitsi-meet (Apache-2.0).
 *
 * Every meeting is a record in the portal database: it is created on start,
 * participants are registered as they join, a heartbeat keeps it live, and it
 * is closed out on leave so it moves into the meeting history.
 */
import { useEffect, useRef, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { JITSI_DOMAIN, inviteLink, parseRoomInput, randomRoomName } from "@/lib/jitsi";
import {
  activeCount,
  useLiveMeetings,
  useMeetingHistory,
  useMeetingPresence,
  type LiveMeeting as MeetingRecord,
} from "@/hooks/useLiveMeetings";
import { HighlightPanel } from "@/components/ui/highlight-card";

const C = {
  card: "#0c0c0c",
  border: "#1f1f1f",
  text: "#f0f0f0",
  dim: "#8a8a8a",
  accent: "#5cb85c",
};

const inputSx: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${C.border}`,
  background: "#0a0a0a",
  color: C.text,
  fontSize: 13,
  fontFamily: "'Satoshi',sans-serif",
};

const btnSx = (primary = false): React.CSSProperties => ({
  padding: "10px 16px",
  borderRadius: 8,
  border: `1px solid ${primary ? C.accent : C.border}`,
  background: primary ? C.accent : "transparent",
  color: primary ? "#000" : C.text,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Satoshi',sans-serif",
});

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const durationOf = (m: MeetingRecord) => {
  const endMs = new Date(m.ended_at || m.last_seen_at).getTime();
  const mins = Math.max(1, Math.round((endMs - new Date(m.started_at).getTime()) / 60000));
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export default function LiveMeeting() {
  const { user } = useAuth();
  const { data: live = [] } = useLiveMeetings();
  const { data: history = [] } = useMeetingHistory();
  const { start, join, leave, heartbeat } = useMeetingPresence();
  const [active, setActive] = useState<MeetingRecord | null>(null);
  const [title, setTitle] = useState("Team meeting");
  const [newRoom, setNewRoom] = useState(randomRoomName());
  const [joinRoom, setJoinRoom] = useState("");
  const busy = useRef(false);

  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "ABM PR";
  const isHost = !!active && active.host_id === user?.id;

  // Keep the meeting record marked live while we stay in the room.
  useEffect(() => {
    if (!active) return;
    const id = active.id;
    heartbeat(id);
    const t = setInterval(() => heartbeat(id), 45000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  const leaveMeeting = async () => {
    const current = active;
    setActive(null);
    if (current) {
      await leave.mutateAsync({ id: current.id, isHost: current.host_id === user?.id }).catch(() => undefined);
    }
  };

  const startHosting = async (raw: string) => {
    const name = parseRoomInput(raw);
    if (!name) return toast.error("Enter a meeting room name");
    if (busy.current) return;
    busy.current = true;
    try {
      const meeting = await start.mutateAsync({ room: name, title });
      setActive(meeting);
      toast.success("Meeting started and shared with the team");
    } catch {
      toast.error("Could not start the meeting. Try a different room name.");
    } finally {
      busy.current = false;
    }
  };

  const joinExisting = async (raw: string, meetingTitle?: string) => {
    const name = parseRoomInput(raw);
    if (!name) return toast.error("Enter a meeting room name");
    if (busy.current) return;
    busy.current = true;
    try {
      const meeting = await join.mutateAsync({ room: name, title: meetingTitle });
      setActive(meeting);
    } catch {
      toast.error("Could not join that meeting");
    } finally {
      busy.current = false;
    }
  };

  const copyInvite = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(inviteLink(active.room_name));
    toast.success("Invite link copied");
  };

  if (active) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, height: "calc(100vh - 120px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="live-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "#e04a4a", display: "inline-block" }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{active.title}</div>
          <code style={{ fontSize: 11.5, color: C.dim }}>{inviteLink(active.room_name)}</code>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={btnSx()} onClick={copyInvite}>Copy invite link</button>
            <button style={btnSx()} onClick={leaveMeeting}>{isHost ? "End meeting" : "Leave meeting"}</button>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 480, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, background: "#040404" }}>
          <JitsiMeeting
            domain={JITSI_DOMAIN}
            roomName={active.room_name}
            userInfo={{ displayName, email: user?.email ?? "" }}
            configOverwrite={{ prejoinPageEnabled: false, disableDeepLinking: true, startWithAudioMuted: false }}
            interfaceConfigOverwrite={{ SHOW_JITSI_WATERMARK: false, MOBILE_APP_PROMO: false }}
            onReadyToClose={leaveMeeting}
            getIFrameRef={(node) => {
              node.style.height = "100%";
              node.style.width = "100%";
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18, maxWidth: 940 }}>
      {live.length > 0 && (
        <HighlightPanel variant="panel" innerClassName="p-5" className="live-glow" style={{ background: C.card }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="live-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "#e04a4a", display: "inline-block" }} />
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Happening now</div>
            <span style={{ fontSize: 11, color: C.dim }}>{live.length} live</span>
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {live.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#0a0a0a" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: C.dim }}>
                    {m.host_name || "Host"} · started {timeOf(m.started_at)} · {activeCount(m)} in room · {m.room_name}
                  </div>
                </div>
                <button style={btnSx(true)} onClick={() => joinExisting(m.room_name, m.title)}>Join</button>
              </div>
            ))}
          </div>
        </HighlightPanel>
      )}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
        <HighlightPanel variant="panel" innerClassName="p-5" style={{ background: C.card }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Start an instant meeting</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4, marginBottom: 12 }}>Saved to the portal and visible to everyone while it runs.</div>
          <input style={{ ...inputSx, marginBottom: 8 }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting name" />
          <input style={inputSx} value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="Room name" />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={btnSx(true)} onClick={() => startHosting(newRoom)}>Start meeting</button>
            <button style={btnSx()} onClick={() => setNewRoom(randomRoomName())}>New name</button>
          </div>
        </HighlightPanel>

        <HighlightPanel variant="panel" innerClassName="p-5" style={{ background: C.card }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Join by name</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4, marginBottom: 12 }}>Paste a room name or a full meeting link.</div>
          <input style={inputSx} value={joinRoom} onChange={(e) => setJoinRoom(e.target.value)} onKeyDown={(e) => e.key === "Enter" && joinExisting(joinRoom)} placeholder={`e.g. abm-pitch-4f21 or https://${JITSI_DOMAIN}/...`} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={btnSx(true)} onClick={() => joinExisting(joinRoom)}>Join meeting</button>
          </div>
        </HighlightPanel>
      </div>

      <HighlightPanel variant="panel" innerClassName="p-5" style={{ background: C.card }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Meeting history</div>
        <div style={{ fontSize: 12, color: C.dim, marginTop: 4, marginBottom: 12 }}>Past meetings stored in the portal.</div>
        {history.length === 0 ? (
          <div style={{ fontSize: 12, color: C.dim }}>No past meetings yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {history.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#0a0a0a" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: C.dim }}>
                    {m.host_name || "Host"} · {new Date(m.started_at).toLocaleDateString()} {timeOf(m.started_at)} · {durationOf(m)} · {(m.meeting_participants ?? []).length} attended
                  </div>
                </div>
                <button style={btnSx()} onClick={() => joinExisting(m.room_name, m.title)}>Restart</button>
              </div>
            ))}
          </div>
        )}
      </HighlightPanel>
    </div>
  );
}
