/**
 * Live Meeting — embeds the official Jitsi Meet client via @jitsi/react-sdk,
 * the Jitsi team's React wrapper around modules/API/external/external_api.js
 * from github.com/jitsi/jitsi-meet (Apache-2.0).
 */
import { useEffect, useRef, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { JITSI_DOMAIN, inviteLink, parseRoomInput, randomRoomName } from "@/lib/jitsi";
import { useLiveMeetings, useMeetingPresence } from "@/hooks/useLiveMeetings";
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

export default function LiveMeeting() {
  const { user } = useAuth();
  const { data: live = [] } = useLiveMeetings();
  const { start, end, heartbeat } = useMeetingPresence();
  const [room, setRoom] = useState<string | null>(null);
  const [title, setTitle] = useState("Team meeting");
  const [newRoom, setNewRoom] = useState(randomRoomName());
  const [joinRoom, setJoinRoom] = useState("");
  const hostedId = useRef<string | null>(null);

  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "ABM PR";

  // Keep the hosted meeting marked live while the host stays in the room.
  useEffect(() => {
    if (!room || !hostedId.current) return;
    const id = hostedId.current;
    const t = setInterval(() => heartbeat(id), 45000);
    return () => clearInterval(t);
  }, [room, heartbeat]);

  const leave = async () => {
    const id = hostedId.current;
    hostedId.current = null;
    setRoom(null);
    if (id) await end.mutateAsync(id).catch(() => undefined);
  };

  const startHosting = async (raw: string) => {
    const name = parseRoomInput(raw);
    if (!name) return toast.error("Enter a meeting room name");
    try {
      hostedId.current = await start.mutateAsync({ room: name, title: title.trim() || "Live meeting" });
    } catch {
      toast.error("Meeting will run, but it could not be announced to the team");
    }
    setRoom(name);
  };

  const joinExisting = (raw: string) => {
    const name = parseRoomInput(raw);
    if (!name) return toast.error("Enter a meeting room name");
    hostedId.current = null;
    setRoom(name);
  };

  const copyInvite = async () => {
    if (!room) return;
    await navigator.clipboard.writeText(inviteLink(room));
    toast.success("Invite link copied");
  };

  if (room) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, height: "calc(100vh - 120px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="live-dot" style={{ width: 9, height: 9, borderRadius: "50%", background: "#e04a4a", display: "inline-block" }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Live meeting</div>
          <code style={{ fontSize: 11.5, color: C.dim }}>{inviteLink(room)}</code>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button style={btnSx()} onClick={copyInvite}>Copy invite link</button>
            <button style={btnSx()} onClick={leave}>Leave meeting</button>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 480, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, background: "#040404" }}>
          <JitsiMeeting
            domain={JITSI_DOMAIN}
            roomName={room}
            userInfo={{ displayName, email: user?.email ?? "" }}
            configOverwrite={{ prejoinPageEnabled: false, disableDeepLinking: true, startWithAudioMuted: false }}
            interfaceConfigOverwrite={{ SHOW_JITSI_WATERMARK: false, MOBILE_APP_PROMO: false }}
            onReadyToClose={leave}
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
                    {m.host_name || "Host"} · started {new Date(m.started_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {m.room_name}
                  </div>
                </div>
                <button style={btnSx(true)} onClick={() => joinExisting(m.room_name)}>Join</button>
              </div>
            ))}
          </div>
        </HighlightPanel>
      )}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
        <HighlightPanel variant="panel" innerClassName="p-5" style={{ background: C.card }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Start an instant meeting</div>
          <div style={{ fontSize: 12, color: C.dim, marginTop: 4, marginBottom: 12 }}>Everyone in the portal sees it go live.</div>
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
    </div>
  );
}
