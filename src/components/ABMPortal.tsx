import { useState, useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Sector } from "recharts";
import abmLogo from "@/assets/abm-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads, useContacts, useCoverage, useKanbanCards, useUpdateKanbanCard, useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useAIOutputs, useSaveAIOutput, useDeleteAIOutput, useAddLead, useAddContact, useAddCoverage, useAddKanbanCard } from "@/hooks/usePortalData";
import { useAddRecord, useBoilerplates, useCalendarPosts, useChatMessages, useClients, useCompetitorNotes, useMeetingNotes, useReports, useROIScenarios } from "@/hooks/useRecords";
import { seedDataForUser } from "@/lib/seedData";
import PresentonApp from "@/components/deckbuilder/presenton/PresentonApp";
import MCPConnectorsPanel from "@/components/settings/MCPConnectorsPanel";
import AddRecordModal, { type FieldDef, SectionHeader } from "@/components/portal/AddRecordModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import LiveMeeting from "@/components/meeting/LiveMeeting";
import { AppSidebar } from "@/components/app-sidebar";
import FunnelChart, { type FunnelStage } from "@/components/charts/funnel-chart";
import { HighlightPanel } from "@/components/ui/highlight-card";
import { SpecularButton } from "@/components/ui/specular-button";

// ─── STREAMING HELPER ───────────────────────────────────────
const streamAI = async (
  body: Record<string, any>,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
) => {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ ...body, stream: true }),
  });
  if (!resp.ok) {
    let msg = "Generation failed";
    try { const j = await resp.json(); msg = j.error || msg; } catch {}
    onError(msg);
    return;
  }
  if (!resp.body) { onError("No response body"); return; }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {}
    }
  }
  onDone();
};

// ─── THEME ──────────────────────────────────────────────────
const C = {
  bg: "#080808", surface: "#0f0f0f", card: "#161616", cardH: "#1e1e1e",
  border: "#252525", accent: "#5cb85c", accentDim: "#3d8b3d",
  accentGlow: "rgba(92,184,92,0.12)", hot: "#e85d4a",
  hotGlow: "rgba(232,93,74,0.15)", green: "#5cb85c", blue: "#5b9cf5",
  blueGlow: "rgba(91,156,245,0.12)", purple: "#a78bfa", orange: "#f0a050",
  text: "#f0f0f0", textDim: "#999", textMuted: "#555", white: "#fff",
};
const F = { display: "'Satoshi',sans-serif", body: "'Satoshi',sans-serif", mono: "'JetBrains Mono',monospace" };

// ─── ICONS ──────────────────────────────────────────────────
const Ico = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
);

const ICONS: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  leads: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  chat: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  deck: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 7h20"/>',
  press: '<path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>',
  email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  clip: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  portal: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  report: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>',
  assets: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  kanban: '<rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>',
  chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h4M8 18h4M16 14h.01M16 18h.01"/>',
  bell: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>',
  wizard: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  notes: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  health: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  sparkle: '<path fill="currentColor" stroke="none" d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  fire: '<path d="M12 22c4-2 8-6 8-12 0-2-1-4-3-5-1 2-3 3-5 3 0-3-1-6-4-8-1 3-3 5-5 6C1 8 1 11 1 13c0 5 4 9 11 9z"/>',
  trending: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  settings: '<path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"/><path d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.5 1.5-.06-.06A1.7 1.7 0 0016.36 18a1.7 1.7 0 00-1.03 1.55V20h-2.12v-.45A1.7 1.7 0 0012.18 18a1.7 1.7 0 00-1.88.34l-.06.06-1.5-1.5.06-.06A1.7 1.7 0 009.14 15a1.7 1.7 0 00-1.55-1.03H7.14v-2.12h.45A1.7 1.7 0 009.14 10a1.7 1.7 0 00-.34-1.88l-.06-.06 1.5-1.5.06.06A1.7 1.7 0 0012.18 7a1.7 1.7 0 001.03-1.55V5h2.12v.45A1.7 1.7 0 0016.36 7a1.7 1.7 0 001.88-.34l.06-.06 1.5 1.5-.06.06A1.7 1.7 0 0019.4 10a1.7 1.7 0 001.55 1.03h.45v2.12h-.45A1.7 1.7 0 0019.4 15z"/>',
  gamma: '<polygon points="12,2 22,20 2,20"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};

const I = ({ name, size = 18 }: { name: string; size?: number }) =>
  ICONS[name] ? <Ico d={ICONS[name]} size={size} /> : null;

// ─── PRIMITIVES ─────────────────────────────────────────────
const Btn = ({ children, primary, small, color, onClick, disabled, style: sx }: any) => (
  <SpecularButton
    onClick={onClick}
    disabled={disabled}
    size={small ? "sm" : "md"}
    radius={small ? 8 : 12}
    tintOpacity={primary ? 0.45 : 0.18}
    autoAnimate={false}
    style={{
      height: "auto",
      padding: small ? "6px 12px" : "10px 18px",
      fontSize: small ? 11 : 12,
      fontWeight: primary ? 700 : 500,
      fontFamily: F.body,
      color: primary ? "#eafff0" : (color || C.text),
      ...(primary
        ? {
            background: `linear-gradient(180deg, ${C.accent}, hsl(120 38% 30%))`,
            border: `1px solid ${C.accent}`,
          }
        : {}),
      cursor: disabled ? "not-allowed" : "pointer",
      ...sx,
    }}
  >
    {children}
  </SpecularButton>
);


const Input = ({ value, onChange, placeholder, style: sx, ...r }: any) => (
  <input value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} style={{
    padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
    background: C.card, color: C.text, fontSize: 13, fontFamily: F.body,
    outline: "none", width: "100%", boxSizing: "border-box" as const, ...sx,
  }} {...r} />
);

const TA = ({ value, onChange, placeholder, rows = 4 }: any) => (
  <textarea value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{
    width: "100%", padding: 14, borderRadius: 10, border: `1px solid ${C.border}`,
    background: "#0c0c0c", color: C.text, fontSize: 13, fontFamily: F.body,
    outline: "none", resize: "vertical" as const, lineHeight: 1.7, boxSizing: "border-box" as const,
  }} />
);

const Badge = ({ text, color }: { text: string; color: string }) => (
  <span style={{
    fontSize: 9, padding: "2px 8px", borderRadius: 5,
    background: color + "15", color, fontWeight: 600,
    textTransform: "uppercase" as const, letterSpacing: .5,
  }}>{text}</span>
);

const Stat = ({ label, value, sub, icon, color, glow }: any) => (
  <HighlightPanel variant="feature" className="h-full" innerClassName="h-full p-5">
    <div style={{ position: "absolute" as const, top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: glow, filter: "blur(25px)" }} />
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase" as const, letterSpacing: 1.5, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 28, fontFamily: F.display, color, fontWeight: 700 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ color, opacity: .35 }}><I name={icon} size={24} /></div>
    </div>
  </HighlightPanel>
);


const Select = ({ value, onChange, options, placeholder }: any) => (
  <select value={value} onChange={(e: any) => onChange(e.target.value)} style={{
    width: "100%", padding: "9px 12px", borderRadius: 7,
    border: `1px solid ${C.border}`, background: "#0c0c0c",
    color: C.text, fontSize: 12, fontFamily: F.body,
  }}>
    <option value="">{placeholder || "Select..."}</option>
    {options.map((o: any) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
  </select>
);

const ChartCard = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <HighlightPanel variant="feature" innerClassName="p-4">
    <h3 style={{ fontSize: 11, fontWeight: 600, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 1, color: C.accent }}>{title}</h3>
    {children}
  </HighlightPanel>
);

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 2} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} style={{ filter: `drop-shadow(0 0 6px ${fill})`, transition: "all 0.2s ease" }} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const cardSx: React.CSSProperties = {
  background: "linear-gradient(135deg,#010101 0%,#090909 55%,#010101 100%)",
  border: "1px solid rgba(255,255,255,0.10)",
  boxShadow: "0 18px 40px rgba(0,0,0,.55)",
};

const tooltipStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text, boxShadow: "0 4px 16px rgba(0,0,0,.4)" };

// ─── ALGORITHMS ─────────────────────────────────────────────
const calcROI = (retainer: number, adValue: number, months: number) => {
  const inv = retainer * months;
  return { inv, adValue, roi: inv > 0 ? ((adValue - inv) / inv * 100).toFixed(1) : 0 };
};
const calcHealth = (d: any) => {
  let s = 0;
  s += Math.min(d.placements * 5, 25);
  s += Math.min(d.sentiment * .25, 25);
  s += d.overdue === 0 ? 20 : Math.max(0, 20 - d.overdue * 5);
  s += d.daysSince <= 7 ? 15 : d.daysSince <= 14 ? 10 : 5;
  s += d.hitRate * .15;
  return Math.min(Math.round(s), 100);
};
const bestPitchDay = (pitches: any[]) => {
  const d: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
  pitches.forEach((p) => { if (p.response === "positive") d[p.day] = (d[p.day] || 0) + 1; });
  return Object.entries(d).sort((a, b) => b[1] - a[1])[0];
};

// ─── STATIC DATA (not persisted) ────────────────────────────
const CHART_DATA = [
  { month: "Nov", coverage: 45, reach: 120 }, { month: "Dec", coverage: 52, reach: 185 },
  { month: "Jan", coverage: 68, reach: 220 }, { month: "Feb", coverage: 82, reach: 290 },
  { month: "Mar", coverage: 127, reach: 340 }, { month: "Apr", coverage: 89, reach: 280 },
];
const PITCH_PERF = [
  { name: "Alicia", sent: 12, placed: 5, rate: 42 }, { name: "Marcus", sent: 18, placed: 8, rate: 44 },
  { name: "Tanya", sent: 10, placed: 3, rate: 30 }, { name: "Nina", sent: 7, placed: 2, rate: 29 },
];
const CHANNELS = [
  { id: "general", name: "General", unread: 3 }, { id: "pitches", name: "Pitch War Room", unread: 7 },
  { id: "crisis", name: "Crisis Alerts", unread: 1 }, { id: "coverage", name: "Coverage Wins", unread: 0 },
  { id: "approvals", name: "Approvals", unread: 4 }, { id: "deadlines", name: "Deadlines", unread: 2 },
];
const MSGS: Record<string, any[]> = {
  general: [
    { id: 1, user: "Alicia Broussard", avatar: "AB", color: C.accent, text: "Team meeting at 2pm. Gulf South strategy before EOD.", time: "9:12 AM", reactions: ["👍"] },
    { id: 2, user: "Marcus Cole", avatar: "MC", color: C.blue, text: "3 interviews confirmed for Crescent City launch.", time: "9:34 AM", reactions: ["🔥"] },
    { id: 3, user: "Devon Hart", avatar: "DH", color: C.purple, text: "March analytics: 340% increase in earned media.", time: "10:22 AM", reactions: ["🚀"] },
  ],
  pitches: [{ id: 1, user: "Marcus Cole", avatar: "MC", color: C.blue, text: "🎯 12 pitches out, 4 placed, 3 pending. Hit rate 33%.", time: "8:30 AM", reactions: [] }],
  crisis: [{ id: 1, user: "Alicia Broussard", avatar: "AB", color: C.accent, text: "⚠️ Gulf South story may break tomorrow. Crisis playbook activated.", time: "8:00 AM", reactions: ["🚨"] }],
  coverage: [{ id: 1, user: "Devon Hart", avatar: "DH", color: C.purple, text: "🏆 Crescent City in LA Cookin' — 2-page spread! 180K reach", time: "Yesterday", reactions: ["🔥", "🎉"] }],
  approvals: [{ id: 1, user: "Nina Castillo", avatar: "NC", color: C.hot, text: "📋 Film Commission release v2 needs review by noon.", time: "10:45 AM", reactions: [] }],
  deadlines: [{ id: 1, user: "Tanya Rivers", avatar: "TR", color: C.green, text: "📅 TODAY: Gulf South 3PM\n📅 TODAY: Film Commission 5PM\n📅 TOMORROW: Crescent City 10AM", time: "8:00 AM", reactions: [] }],
};
const DECK_TPLS = [
  { id: "media", name: "Media Plan", slides: 12, color: C.blue },
  { id: "campaign", name: "Campaign Proposal", slides: 10, color: C.accent },
  { id: "coverage", name: "Coverage Report", slides: 8, color: C.green },
  { id: "crisis", name: "Crisis Brief", slides: 6, color: C.hot },
  { id: "brand", name: "Brand Audit", slides: 14, color: C.purple },
  { id: "event", name: "Event Recap", slides: 9, color: C.orange },
];

// ─── MAIN APP ───────────────────────────────────────────────
export default function ABM() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  
  // ─── DATABASE HOOKS ─────────────────────────────────────
  const { data: dbLeads = [], isLoading: leadsLoading } = useLeads();
  const { data: dbContacts = [], isLoading: contactsLoading } = useContacts();
  const { data: dbCoverage = [], isLoading: coverageLoading } = useCoverage();
  const { data: dbKanbanCards = [] } = useKanbanCards();
  const updateKanbanCard = useUpdateKanbanCard();
  const addLead = useAddLead();
  const addContact = useAddContact();
  const addCoverage = useAddCoverage();
  const addKanbanCard = useAddKanbanCard();
  const { data: dbNotifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { data: aiHistory = [] } = useAIOutputs();
  const saveOutput = useSaveAIOutput();
  const deleteOutput = useDeleteAIOutput();
  const { data: clients = [] } = useClients();
  const { data: calendarPosts = [] } = useCalendarPosts();
  const { data: storedMeetingNotes = [] } = useMeetingNotes();
  const { data: competitorNotes = [] } = useCompetitorNotes();
  const { data: storedBoilerplates = [] } = useBoilerplates();
  const { data: roiScenarios = [] } = useROIScenarios();
  const { data: storedReports = [] } = useReports();
  const { data: chatMessages = [] } = useChatMessages();
  const addClient = useAddRecord("clients");
  const addCalendarPost = useAddRecord("calendar_posts");
  const addMeetingNote = useAddRecord("meeting_notes");
  const addCompetitorNote = useAddRecord("competitor_notes");
  const addBoilerplate = useAddRecord("boilerplates");
  const addROIScenario = useAddRecord("roi_scenarios");
  const addReport = useAddRecord("reports");
  const addChatMessage = useAddRecord("chat_messages");
  const [historyTab, setHistoryTab] = useState<string | null>(null); // which module's history is open

  // Seed data on first login
  const queryClient = useQueryClient();
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (user && !seeded) {
      seedDataForUser(user.id).then(() => {
        setSeeded(true);
        queryClient.invalidateQueries();
      });
    }
  }, [user, seeded, queryClient]);

  // ─── LOCAL UI STATE ─────────────────────────────────────
  const [tab, setTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [leadFilter, setLeadFilter] = useState("all");
  const [crmMono, setCrmMono] = useState(false);

  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [chatCh, setChatCh] = useState("general");
  const [chatInput, setChatInput] = useState("");
  const [msgs, setMsgs] = useState(MSGS);
  const [deckTpl, setDeckTpl] = useState<string | null>(null);
  const [deckClient, setDeckClient] = useState("");
  const [deckLoading, setDeckLoading] = useState(false);
  const [deckResult, setDeckResult] = useState("");
  const [prClient, setPrClient] = useState("");
  const [prBrief, setPrBrief] = useState("");
  const [prLoading, setPrLoading] = useState(false);
  const [prResult, setPrResult] = useState("");
  const [emailJ, setEmailJ] = useState("");
  const [emailAngle, setEmailAngle] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState("");
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgLoading, setImgLoading] = useState(false);
  const [imgConcepts, setImgConcepts] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [dragCard, setDragCard] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [meetingNotes, setMeetingNotes] = useState("");
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingActions, setMeetingActions] = useState<any[] | null>(null);
  const [addModal, setAddModal] = useState<{ title: string; fields: FieldDef[]; save: (values: Record<string, any>) => Promise<void> | void } | null>(null);
  const [sentimentUrl, setSentimentUrl] = useState("");
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [roiRetainer, setRoiRetainer] = useState("18000");
  const [roiAdValue, setRoiAdValue] = useState("480000");
  const [roiMonths, setRoiMonths] = useState("12");
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardData, setOnboardData] = useState({ name: "", industry: "", website: "", contact: "", goals: "", audience: "", messages: "", boilerplate: "", spokesperson: "", voice: "" });
  const [boilerplates, setBoilerplates] = useState([{ id: 1, client: "Crescent City Brewing", text: "Crescent City Brewing is a New Orleans-based craft brewery founded in 2024...", generated: false }]);
  const [bpClient, setBpClient] = useState("");
  const [bpLoading, setBpLoading] = useState(false);
  const [competitorQ, setCompetitorQ] = useState("");
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [competitorResult, setCompetitorResult] = useState<any[] | null>(null);
  const [portalClient, setPortalClient] = useState("Crescent City Brewing");
  const [reportClient, setReportClient] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportResult, setReportResult] = useState("");
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chatCh, msgs]);

  // ─── DERIVED DATA ───────────────────────────────────────
  const activeClientCount = new Set([
    ...clients.map((client: any) => client.name),
    ...dbCoverage.map((coverage) => coverage.client),
    ...dbLeads.map((lead) => lead.name),
  ].filter(Boolean)).size;
  const placedCount = dbKanbanCards.filter((card) => card.column_name === "placed").length;
  const pitchCount = dbKanbanCards.length;
  const hitRate = pitchCount ? `${Math.round((placedCount / pitchCount) * 100)}%` : "0%";
  const kanban = useMemo(() => {
    const cols: Record<string, any[]> = { draft: [], sent: [], followup: [], placed: [], declined: [] };
    dbKanbanCards.forEach((card) => {
      if (cols[card.column_name]) cols[card.column_name].push(card);
    });
    return cols;
  }, [dbKanbanCards]);

  const sentimentData = useMemo(() => {
    const total = dbCoverage.length || 1;
    const pos = dbCoverage.filter((c) => c.sentiment === "positive").length;
    const neg = dbCoverage.filter((c) => c.sentiment === "negative").length;
    const neu = total - pos - neg;
    return [
      { name: "Positive", value: Math.round((pos / total) * 100), color: C.accent },
      { name: "Neutral", value: Math.round((neu / total) * 100), color: C.blue },
      { name: "Negative", value: Math.round((neg / total) * 100), color: C.hot },
    ];
  }, [dbCoverage]);

  const funnelData = useMemo<FunnelStage[]>(() => {
    const total = Math.max(dbLeads.length, 1);
    const contacted = dbLeads.filter((lead) => lead.status !== "cold").length;
    const engaged = dbLeads.filter((lead) => lead.status === "hot").length + Math.ceil(dbLeads.filter((lead) => lead.status === "warm").length / 2);
    const pitched = dbKanbanCards.filter((card) => ["sent", "followup", "placed"].includes(card.column_name)).length;
    const won = dbCoverage.length;
    return [
      { label: "Awareness", value: total, gradient: [{ offset: 0, color: "#15205d" }, { offset: 0.55, color: "#0059d6" }, { offset: 1, color: "#15a79b" }] },
      { label: "Interest", value: Math.min(contacted, total), gradient: [{ offset: 0, color: "#175c45" }, { offset: 0.6, color: "#55a951" }, { offset: 1, color: "#f0c45c" }] },
      { label: "Consideration", value: Math.min(Math.max(engaged, 0), contacted, total), gradient: [{ offset: 0, color: "#f09b00" }, { offset: 1, color: "#ea9f58" }] },
      { label: "Intent", value: Math.min(Math.max(pitched, 0), Math.max(engaged, 0), contacted, total), gradient: [{ offset: 0, color: "#9d37dc" }, { offset: 1, color: "#e53b86" }] },
      { label: "Purchase", value: Math.min(Math.max(won, 0), Math.max(pitched, 0), Math.max(engaged, 0), contacted, total), gradient: [{ offset: 0, color: "#ed206a" }, { offset: 1, color: "#4d4ace" }] },
    ];
  }, [dbCoverage.length, dbKanbanCards, dbLeads]);

  // ─── HANDLERS ───────────────────────────────────────────
  const openAdd = (title: string, fields: FieldDef[], save: (values: Record<string, any>) => Promise<unknown> | unknown) => {
    setAddModal({ title, fields, save: async (values) => { await save(values); } });
  };

  const submitAdd = async (values: Record<string, any>) => {
    if (!addModal) return;
    try {
      await addModal.save(values);
      setAddModal(null);
      toast.success("Added to your portal");
    } catch (error: any) {
      toast.error(error?.message || "Could not save this record");
    }
  };

  const sendMsg = async () => {
    if (!chatInput.trim()) return;
    const body = chatInput.trim();
    setMsgs((p) => ({ ...p, [chatCh]: [...(p[chatCh] || []), { id: Date.now(), user: "You", avatar: "YO", color: C.accent, text: body, time: "Now", reactions: [] }] }));
    setChatInput("");
    try { await addChatMessage.mutateAsync({ channel: chatCh, author: user?.email || "You", body }); } catch (error: any) { toast.error(error?.message || "Message could not be saved"); }
  };

  const dropOnCol = (toCol: string) => {
    if (!dragCard || !dragFrom || dragFrom === toCol) return;
    updateKanbanCard.mutate({ id: dragCard, column_name: toCol });
    setDragCard(null);
    setDragFrom(null);
  };

  const healthScores = useMemo(() => dbLeads.filter((l) => l.status !== "cold").map((l) => ({
    name: l.name,
    score: calcHealth({ placements: Math.floor(Math.random() * 6) + 1, sentiment: 85, overdue: Math.floor(Math.random() * 3), daysSince: Math.floor(Math.random() * 10) + 1, hitRate: 38 }),
  })), [dbLeads]);

  const roi = calcROI(parseFloat(roiRetainer) || 0, parseFloat(roiAdValue) || 0, parseInt(roiMonths) || 1);
  const unreadCount = dbNotifications.filter((n) => !n.read).length;
  const fLeads = dbLeads.filter((l) => leadFilter === "all" || l.status === leadFilter);

  return (
    <SidebarProvider>
      <div style={{ fontFamily: F.body, background: "transparent", color: C.text, height: "100vh", display: "flex", width: "100%", overflow: "hidden" }}>
        <AppSidebar
          tab={tab}
          onSelect={(id) => (id === "deckbuilder" ? navigate("/deck-builder") : setTab(id))}
          userEmail={user?.email}
          onChangePassword={() => setShowChangePw(true)}
          onSignOut={signOut}
          onNotifications={() => setShowNotifs(true)}
        />

      {/* MAIN */}
      <SidebarInset style={{ flex: 1, overflow: "auto", position: "relative", background: "transparent" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(8,8,8,.72)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
          <SidebarTrigger />
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg,${C.accent},transparent 70%)` }} />


        {/* NOTIFICATION BELL */}
        <div style={{ position: "fixed", top: 12, right: 20, zIndex: 999 }}>
          <button onClick={() => setShowNotifs(!showNotifs)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, color: C.textDim, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <I name="bell" size={16} />
            {unreadCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: C.hot, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
          </button>
          {showNotifs && <div style={{ position: "absolute", top: 42, right: 0, width: 320, ...cardSx, borderRadius: 12, padding: 12, maxHeight: 400, overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.white, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              Notifications
              <button onClick={() => { markAllRead.mutate(); setShowNotifs(false); }} style={{ background: "none", border: "none", color: C.accent, fontSize: 10, cursor: "pointer" }}>Mark all read</button>
            </div>
            {dbNotifications.map((n) => (
              <div key={n.id} onClick={() => markRead.mutate(n.id)} style={{
                padding: "8px 10px", borderRadius: 7, marginBottom: 4,
                background: n.read ? "transparent" : C.accentGlow, cursor: "pointer",
                borderLeft: `3px solid ${n.priority === "urgent" ? C.hot : n.priority === "high" ? C.orange : C.accent}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: n.read ? C.textDim : C.white }}>{n.title}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{n.msg}</div>
                <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{n.time}</div>
              </div>
            ))}
          </div>}
        </div>

         {/* ═══ DASHBOARD ═══ */}
         {tab === "dashboard" && <div style={{ padding: 24, maxWidth: 1200 }}>
           <SectionHeader title="Dashboard" subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} onAdd={() => openAdd("Add client", [
             { name: "name", label: "Client name", required: true, maxLength: 160 },
             { name: "industry", label: "Industry", maxLength: 120 },
             { name: "website", label: "Website", type: "url", maxLength: 500 },
             { name: "contact_email", label: "Contact email", type: "email", maxLength: 255 },
             { name: "status", label: "Status", type: "select", options: ["active", "paused", "prospect"], required: true },
             { name: "notes", label: "Notes", type: "textarea", maxLength: 2000 },
           ], (v) => addClient.mutateAsync(v))} />
           <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
             <Stat label="Active Clients" value={activeClientCount} sub="From your portal data" icon="leads" color={C.accent} glow={C.accentGlow} />
             <Stat label="Hot Leads" value={dbLeads.filter((l) => l.status === "hot").length} sub="Needs follow-up" icon="fire" color={C.hot} glow={C.hotGlow} />
             <Stat label="Hit Rate" value={hitRate} sub={`${placedCount}/${pitchCount} placed`} icon="trending" color={C.accent} glow={C.accentGlow} />
             <Stat label="Mentions" value={dbCoverage.length} sub="Saved coverage records" icon="monitor" color={C.blue} glow={C.blueGlow} />
           </div>
           <HighlightPanel variant="feature" className="mb-[18px]" innerClassName="p-4">
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
               <div>
                 <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: C.white }}>Pipeline funnel</h2>
                 <p style={{ fontSize: 10, color: C.textDim, margin: "4px 0 0" }}>From first awareness to coverage won</p>
               </div>
               <span style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Live CRM data</span>
             </div>
             <FunnelChart data={funnelData} color={C.accent} layers={3} gap={4} />
           </HighlightPanel>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
             <ChartCard title="Coverage Trend">
               <ResponsiveContainer width="100%" height={160}>
                 <BarChart data={CHART_DATA}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="month" tick={{ fontSize: 10, fill: C.textDim }} /><YAxis tick={{ fontSize: 10, fill: C.textDim }} /><Tooltip contentStyle={tooltipStyle} cursor={{ fill: C.accentGlow }} /><Bar dataKey="coverage" fill={C.accent} radius={[4, 4, 0, 0]} activeBar={{ fill: "#7dd87d", stroke: C.accent, strokeWidth: 1 }} /></BarChart>
               </ResponsiveContainer>
             </ChartCard>
             <ChartCard title="Sentiment Breakdown">
               <ResponsiveContainer width="100%" height={160}>
                 <PieChart><Pie data={sentimentData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none" activeShape={renderActiveShape} label={({ name, value }: any) => `${name} ${value}%`} labelLine={false}>{sentimentData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
               </ResponsiveContainer>
             </ChartCard>
           </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <ChartCard title="Client Health Scores">
              {healthScores.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: C.textDim, minWidth: 120 }}>{h.name}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.border, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${h.score}%`, borderRadius: 3, background: h.score > 80 ? C.accent : h.score > 60 ? C.blue : C.hot, transition: "width 0.5s ease" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: h.score > 80 ? C.accent : h.score > 60 ? C.blue : C.hot, minWidth: 28 }}>{h.score}</span>
                </div>
              ))}
            </ChartCard>
            <ChartCard title="Pitch Performance by Team">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={PITCH_PERF} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis type="number" tick={{ fontSize: 10, fill: C.textDim }} /><YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: C.textDim }} width={50} /><Tooltip contentStyle={tooltipStyle} cursor={{ fill: C.accentGlow }} /><Bar dataKey="placed" fill={C.accent} radius={[0, 4, 4, 0]} activeBar={{ fill: "#7dd87d" }} /><Bar dataKey="sent" fill={C.border} radius={[0, 4, 4, 0]} activeBar={{ fill: "#444" }} /></BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>}

        {/* ═══ LEADS ═══ */}
        
        {tab === "leads" && <div style={{ padding: 24, maxWidth: 1200, filter: crmMono ? "grayscale(1)" : "none", transition: "filter .3s ease" }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
             <h1 style={{ fontSize: 20, fontFamily: F.display, fontWeight: 700, margin: 0, color: C.white }}>Client Leads</h1>
             <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
               <Btn small primary onClick={() => openAdd("Add lead", [
                 { name: "name", label: "Company", required: true, maxLength: 120 },
                 { name: "contact", label: "Contact", maxLength: 120 },
                 { name: "email", label: "Email", type: "email", maxLength: 255 },
                 { name: "status", label: "Status", type: "select", options: ["hot", "warm", "cold"], required: true },
                 { name: "value", label: "Value", maxLength: 40 },
                 { name: "notes", label: "Notes", type: "textarea", maxLength: 1000 },
                ], (v) => addLead.mutateAsync({ ...(v as any), score: v.status === "hot" ? 90 : v.status === "warm" ? 60 : 20 } as any))}>+ Add Lead</Btn>
              {["all", "hot", "warm", "cold"].map((f) => (
                <button key={f} onClick={() => setLeadFilter(f)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${leadFilter === f ? C.accent : C.border}`, background: leadFilter === f ? C.accentGlow : "transparent", color: leadFilter === f ? C.accent : C.textDim, fontSize: 10, cursor: "pointer", textTransform: "capitalize" }}>{f === "hot" ? "🔥 " : ""}{f}</button>
              ))}
              <button onClick={() => setCrmMono(!crmMono)} title="Toggle black & white view" style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, border: `1px solid ${crmMono ? C.white : C.border}`, background: "transparent", color: crmMono ? C.white : C.textDim, fontSize: 10, cursor: "pointer" }}>
                <span style={{ width: 22, height: 12, borderRadius: 8, background: crmMono ? C.white : C.border, position: "relative", display: "inline-block", transition: "background .2s" }}>
                  <span style={{ position: "absolute", top: 2, left: crmMono ? 12 : 2, width: 8, height: 8, borderRadius: "50%", background: crmMono ? "#000" : "#888", transition: "left .2s" }} />
                </span>
                B&amp;W
              </button>
            </div>
          </div>

          {fLeads.map((l) => (
            <div key={l.id} onClick={() => setSelectedLead(selectedLead?.id === l.id ? null : l)} style={{ ...cardSx, border: `1px solid ${l.status === "hot" ? C.hot + "40" : C.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: l.status === "hot" ? C.hotGlow : C.border + "40", display: "flex", alignItems: "center", justifyContent: "center" }}>{l.status === "hot" ? <I name="fire" size={14} /> : <I name="leads" size={12} />}</div>
                  <div><div style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, color: C.white }}>{l.name}{l.status === "hot" && <Badge text="HOT" color={C.hot} />}</div><div style={{ fontSize: 10, color: C.textDim }}>{l.contact}</div></div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>{l.value}</span>
              </div>
              {selectedLead?.id === l.id && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}><p style={{ fontSize: 11, color: C.textDim, margin: "0 0 8px" }}>{l.notes}</p><div style={{ display: "flex", gap: 4 }}><Btn primary small>Proposal</Btn><Btn small>Call</Btn><Btn small>Note</Btn></div></div>}
            </div>
          ))}
        </div>}

        {/* ═══ PITCH KANBAN ═══ */}
         {tab === "kanban" && <div style={{ padding: 24 }}>
           <SectionHeader title="Pitch Kanban Board" onAdd={() => openAdd("Add pitch card", [
             { name: "title", label: "Pitch title", required: true, maxLength: 160 },
             { name: "client", label: "Client", maxLength: 120 },
             { name: "contact", label: "Contact", maxLength: 120 },
             { name: "column_name", label: "Stage", type: "select", options: ["draft", "sent", "followup", "placed", "declined"], required: true },
             { name: "owner", label: "Owner", maxLength: 120 },
             { name: "due_date", label: "Due date", type: "date" },
            ], (v) => addKanbanCard.mutateAsync(v as any))} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, minHeight: 400 }}>
            {([["draft", "Draft", C.textDim], ["sent", "Sent", C.blue], ["followup", "Follow Up", C.orange], ["placed", "Placed ✓", C.accent], ["declined", "Declined", C.hot]] as const).map(([col, label, color]) => (
              <div key={col} onDragOver={(e) => e.preventDefault()} onDrop={() => dropOnCol(col)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: 10, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>{label}<span style={{ background: color + "20", padding: "1px 6px", borderRadius: 8, fontSize: 9 }}>{kanban[col]?.length || 0}</span></div>
                {(kanban[col] || []).map((card: any) => (
                  <div key={card.id} draggable onDragStart={() => { setDragCard(card.id); setDragFrom(col); }} style={{ ...cardSx, borderRadius: 8, padding: 10, marginBottom: 6, cursor: "grab", transition: "all .15s" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.white, marginBottom: 3 }}>{card.title}</div>
                    <div style={{ fontSize: 9, color: C.textDim }}>{card.client}</div>
                    <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>→ {card.contact}</div>
                  </div>
                ))}
                {(kanban[col]?.length || 0) === 0 && <div style={{ fontSize: 10, color: C.textMuted, textAlign: "center", padding: 20 }}>Drop here</div>}
              </div>
            ))}
          </div>
        </div>}

        {tab === "livemeeting" && <LiveMeeting />}

        {/* ═══ CHAT ═══ */}
          {tab === "chat" && <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
            <SectionHeader title="Team Chat" onAdd={() => openAdd("Add team message", [
              { name: "channel", label: "Channel", type: "select", options: CHANNELS.map((c) => ({ value: c.id, label: c.name })), required: true },
              { name: "body", label: "Message", type: "textarea", required: true, maxLength: 2000 },
            ], async (v) => { await addChatMessage.mutateAsync({ ...v, author: user?.email || "Team member" }); })} />
           <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
           <div style={{ width: 180, borderRight: `1px solid ${C.border}`, background: C.surface, padding: "12px 6px", flexShrink: 0 }}>
            {CHANNELS.map((ch) => (
              <button key={ch.id} onClick={() => setChatCh(ch.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: 6, border: "none", background: chatCh === ch.id ? C.accentGlow : "transparent", color: chatCh === ch.id ? C.accent : C.textDim, fontSize: 10, cursor: "pointer", marginBottom: 1 }}>
                <span># {ch.name}</span>{ch.unread > 0 && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 6, background: C.accent, color: "#000", fontWeight: 700 }}>{ch.unread}</span>}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.white }}>#{" "}{CHANNELS.find((c) => c.id === chatCh)?.name}</div>
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
               {[
                 ...(msgs[chatCh] || []),
                 ...chatMessages.filter((m: any) => m.channel === chatCh).map((m: any) => ({
                   id: m.id,
                   user: m.author || "Team member",
                   avatar: (m.author || "TM").slice(0, 2).toUpperCase(),
                   color: C.accent,
                   text: m.body,
                   time: new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
                   reactions: [],
                 })),
               ].map((m: any) => (
                 <div key={m.id} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                   <div style={{ width: 28, height: 28, borderRadius: 7, background: m.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: m.color, flexShrink: 0 }}>{m.avatar}</div>
                   <div style={{ flex: 1 }}>
                     <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontSize: 11, fontWeight: 600, color: m.color }}>{m.user}</span><span style={{ fontSize: 9, color: C.textMuted }}>{m.time}</span></div>
                     <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5, marginTop: 2, whiteSpace: "pre-wrap" }}>{m.text}</div>
                     {m.reactions?.length > 0 && <div style={{ display: "flex", gap: 3, marginTop: 3 }}>{m.reactions.map((r: string, i: number) => <span key={i} style={{ fontSize: 12, background: "#1a1a1a", borderRadius: 6, padding: "1px 5px" }}>{r}</span>)}</div>}
                   </div>
                 </div>
               ))}
              <div ref={chatEnd} />
            </div>
            <div style={{ padding: "8px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 6 }}>
              <Input value={chatInput} onChange={setChatInput} placeholder="Type a message..." onKeyDown={(e: any) => e.key === "Enter" && sendMsg()} style={{ flex: 1 }} />
              <Btn primary small onClick={sendMsg}><I name="send" size={12} /></Btn>
             </div>
           </div>
           </div>
         </div>}

        {/* ═══ DECK BUILDER ═══ */}
        {tab === "deckbuilder" && <PresentonApp />}

         {/* ═══ PRESS RELEASE ═══ */}
         {tab === "pressrelease" && <div style={{ padding: 24, maxWidth: 900 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
             <h1 style={{ fontSize: 20, fontFamily: F.display, fontWeight: 700, margin: 0, color: C.white }}>Press Release Writer</h1>
             <div style={{ display: "flex", gap: 6 }}>
               <Btn small onClick={() => setHistoryTab(historyTab === "press-release" ? null : "press-release")}><I name="notes" size={12} /> History ({aiHistory.filter(h => h.type === "press-release").length})</Btn>
               <Btn small primary onClick={() => { setPrClient(""); setPrBrief(""); setPrResult(""); setHistoryTab(null); }}>+ New Brief</Btn>
             </div>
           </div>
          {historyTab === "press-release" && <div style={{ ...cardSx, borderRadius: 10, padding: 14, marginBottom: 14, maxHeight: 300, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 8 }}>Saved Press Releases</div>
            {aiHistory.filter(h => h.type === "press-release").length === 0 && <div style={{ fontSize: 10, color: C.textMuted, padding: 10 }}>No saved outputs yet</div>}
            {aiHistory.filter(h => h.type === "press-release").map(h => (
              <div key={h.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.white, cursor: "pointer" }} onClick={() => { setPrResult(h.content); const inp = h.inputs as any; if (inp?.client) setPrClient(inp.client); if (inp?.brief) setPrBrief(inp.brief); setHistoryTab(null); }}>{h.title}</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Btn small onClick={() => { setPrResult(h.content); setHistoryTab(null); }}>Load</Btn>
                    <Btn small color={C.hot} onClick={() => deleteOutput.mutate(h.id)}>✕</Btn>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: C.textMuted }}>{new Date(h.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>}
          <div style={{ ...cardSx, borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <Select value={prClient} onChange={setPrClient} options={dbLeads.map((l) => ({ value: l.name, label: l.name }))} placeholder="Select client..." />
            <div style={{ marginTop: 10 }}><TA value={prBrief} onChange={setPrBrief} placeholder="What's the news?" rows={3} /></div>
            <div style={{ marginTop: 10 }}>
               <Btn primary onClick={async () => { setPrLoading(true); setPrResult(""); let acc = ""; await streamAI({ type: 'press-release', client: prClient, brief: prBrief }, (d) => { acc += d; setPrResult(acc); }, () => setPrLoading(false), (e) => { toast.error(e); setPrLoading(false); }); }} disabled={prLoading || !prClient || !prBrief}>
                 <I name="sparkle" size={12} /> {prLoading ? "Writing..." : "Generate"}
               </Btn>
            </div>
          </div>
          {(prResult || prLoading) && <div style={{ ...cardSx, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginBottom: 8 }}>
              <Btn small onClick={() => navigator.clipboard?.writeText(prResult).then(() => toast.success("Copied!"))}><I name="copy" size={11} /> Copy</Btn>
              {prResult && !prLoading && <Btn small primary onClick={() => { saveOutput.mutate({ type: "press-release", title: `${prClient} — ${prBrief.slice(0, 40)}`, content: prResult, inputs: { client: prClient, brief: prBrief } }); toast.success("Saved!"); }}><I name="notes" size={11} /> Save</Btn>}
            </div>
            <pre style={{ fontSize: 10, color: C.textDim, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: F.body, margin: 0 }}>{prResult}{prLoading && <span style={{ display: "inline-block", width: 6, height: 14, background: C.accent, animation: "blink 1s infinite", marginLeft: 2, verticalAlign: "text-bottom" }} />}</pre>
          </div>}
        </div>}

         {/* ═══ PITCH EMAIL ═══ */}
         {tab === "pitchemail" && <div style={{ padding: 24, maxWidth: 900 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
             <h1 style={{ fontSize: 20, fontFamily: F.display, fontWeight: 700, margin: 0, color: C.white }}>Pitch Email Composer</h1>
             <div style={{ display: "flex", gap: 6 }}>
               <Btn small onClick={() => setHistoryTab(historyTab === "pitch-email" ? null : "pitch-email")}><I name="notes" size={12} /> History ({aiHistory.filter(h => h.type === "pitch-email").length})</Btn>
               <Btn small primary onClick={() => { setEmailJ(""); setEmailAngle(""); setEmailResult(""); setHistoryTab(null); }}>+ New Pitch</Btn>
             </div>
           </div>
          {historyTab === "pitch-email" && <div style={{ ...cardSx, borderRadius: 10, padding: 14, marginBottom: 14, maxHeight: 300, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 8 }}>Saved Pitches</div>
            {aiHistory.filter(h => h.type === "pitch-email").length === 0 && <div style={{ fontSize: 10, color: C.textMuted, padding: 10 }}>No saved outputs yet</div>}
            {aiHistory.filter(h => h.type === "pitch-email").map(h => (
              <div key={h.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 11, fontWeight: 500, color: C.white }}>{h.title}</div><div style={{ fontSize: 9, color: C.textMuted }}>{new Date(h.created_at).toLocaleDateString()}</div></div>
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn small onClick={() => { setEmailResult(h.content); setHistoryTab(null); }}>Load</Btn>
                  <Btn small color={C.hot} onClick={() => deleteOutput.mutate(h.id)}>✕</Btn>
                </div>
              </div>
            ))}
          </div>}
          <div style={{ ...cardSx, borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <Select value={emailJ} onChange={setEmailJ} options={dbContacts.map((c) => ({ value: c.name, label: `${c.name} — ${c.outlet}` }))} placeholder="Select journalist..." />
            {emailJ && (() => { const j = dbContacts.find((c) => c.name === emailJ); return j ? <div style={{ background: "#0c0c0c", borderRadius: 6, padding: 8, margin: "8px 0", display: "flex", gap: 12, fontSize: 10, color: C.textDim }}><span>{j.outlet}</span><span>{j.beat}</span><Badge text={j.relationship} color={j.relationship === "strong" ? C.accent : C.blue} /></div> : null; })()}
            <TA value={emailAngle} onChange={setEmailAngle} placeholder="Story angle..." rows={2} />
            <div style={{ marginTop: 10 }}>
               <Btn primary onClick={async () => { setEmailLoading(true); setEmailResult(""); const j = dbContacts.find((c) => c.name === emailJ); let acc = ""; await streamAI({ type: 'pitch-email', journalist: emailJ, outlet: j?.outlet || '', beat: j?.beat || '', relationship: j?.relationship || '', angle: emailAngle }, (d) => { acc += d; setEmailResult(acc); }, () => setEmailLoading(false), (e) => { toast.error(e); setEmailLoading(false); }); }} disabled={emailLoading || !emailJ || !emailAngle}>
                 <I name="sparkle" size={12} /> {emailLoading ? "..." : "Generate Pitch"}
               </Btn>
            </div>
          </div>
          {(emailResult || emailLoading) && <div style={{ ...cardSx, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginBottom: 8 }}>
              <Btn small onClick={() => navigator.clipboard?.writeText(emailResult).then(() => toast.success("Copied!"))}><I name="copy" size={11} /> Copy</Btn>
              {emailResult && !emailLoading && <Btn small primary onClick={() => { saveOutput.mutate({ type: "pitch-email", title: `${emailJ} — ${emailAngle.slice(0, 40)}`, content: emailResult, inputs: { journalist: emailJ, angle: emailAngle } }); toast.success("Saved!"); }}><I name="notes" size={11} /> Save</Btn>}
            </div>
            <pre style={{ fontSize: 10, color: C.textDim, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: F.body, margin: 0 }}>{emailResult}{emailLoading && <span style={{ display: "inline-block", width: 6, height: 14, background: C.accent, animation: "blink 1s infinite", marginLeft: 2, verticalAlign: "text-bottom" }} />}</pre>
          </div>}
        </div>}

         {/* ═══ CREATIVE AI ═══ */}
         {tab === "imagegen" && <div style={{ padding: 24, maxWidth: 1000 }}>
           <SectionHeader title="Creative AI Studio" onAdd={() => { setImgPrompt(""); setImgConcepts([]); }} />
           <div style={{ ...cardSx, borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <TA value={imgPrompt} onChange={setImgPrompt} placeholder="Campaign concept, brand, audience..." rows={3} />
            <div style={{ marginTop: 10, textAlign: "right" }}>
               <Btn primary onClick={async () => { setImgLoading(true); try { const { data, error } = await supabase.functions.invoke('ai-generate', { body: { type: 'creative-concepts', prompt: imgPrompt } }); if (error) throw error; if (data?.error) { toast.error(data.error); } else { setImgConcepts(data.concepts || []); } } catch (e: any) { toast.error(e.message || 'Generation failed'); } finally { setImgLoading(false); } }} disabled={imgLoading || !imgPrompt}>
                 <I name="sparkle" size={12} /> {imgLoading ? "..." : "Generate"}
               </Btn>
            </div>
          </div>
          {imgConcepts.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
            {imgConcepts.map((c: any, i: number) => (
              <div key={i} style={{ ...cardSx, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: 50, display: "flex" }}>{(c.palette || []).map((cl: string, j: number) => <div key={j} style={{ flex: 1, background: cl }} />)}</div>
                 <div style={{ padding: 14 }}>
                   <div style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 4 }}>{c.title}</div>
                   <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.5 }}>{c.description}</div>
                   {c.tagline && <div style={{ fontSize: 11, fontStyle: "italic", color: C.white, marginTop: 6 }}>"{c.tagline}"</div>}
                   {c.copy && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4, lineHeight: 1.5 }}>{c.copy}</div>}
                   <div style={{ fontSize: 9, color: C.textMuted, marginTop: 6 }}>Mood: {c.mood}</div>
                 </div>
              </div>
            ))}
          </div>}
        </div>}

         {/* ═══ MEDIA LIST ═══ */}
         {tab === "medialist" && <div style={{ padding: 24, maxWidth: 1200 }}>
           <SectionHeader title="Media Lists" onAdd={() => openAdd("Add media contact", [
             { name: "name", label: "Name", required: true, maxLength: 120 },
             { name: "outlet", label: "Outlet", maxLength: 120 },
             { name: "beat", label: "Beat", maxLength: 120 },
             { name: "email", label: "Email", type: "email", maxLength: 255 },
             { name: "relationship", label: "Relationship", type: "select", options: ["strong", "good", "new"], required: true },
             { name: "notes", label: "Notes", type: "textarea", maxLength: 1000 },
           ], (v) => addContact.mutateAsync(v as any))} />
           <div style={{ ...cardSx, borderRadius: 10 }}>
            {dbContacts.map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 70px 60px", alignItems: "center", padding: "9px 14px", borderBottom: i < dbContacts.length - 1 ? `1px solid ${C.border}` : "none", fontSize: 11 }}>
                <div style={{ fontWeight: 500, color: C.white }}>{c.name}</div>
                <div style={{ color: C.textDim }}>{c.outlet}</div>
                <div style={{ color: C.textDim }}>{c.beat}</div>
                <Badge text={c.relationship} color={c.relationship === "strong" ? C.accent : C.blue} />
                <Badge text={c.response} color={c.response === "positive" ? C.accent : C.blue} />
              </div>
            ))}
          </div>
        </div>}

         {/* ═══ CLIPPER + SENTIMENT ═══ */}
         {tab === "clipper" && <div style={{ padding: 24, maxWidth: 900 }}>
           <SectionHeader title="Coverage Clipper + AI Sentiment" subtitle="Paste article text/headline → AI analyzes sentiment, reach, and PR impact" onAdd={() => openAdd("Add coverage", [
             { name: "outlet", label: "Outlet", required: true, maxLength: 120 },
             { name: "title", label: "Headline", required: true, maxLength: 240 },
             { name: "url", label: "Article URL", type: "url", maxLength: 500 },
             { name: "date", label: "Date", type: "date" },
             { name: "sentiment", label: "Sentiment", type: "select", options: ["positive", "neutral", "negative"], required: true },
             { name: "reach", label: "Reach", maxLength: 40 },
             { name: "client", label: "Client", maxLength: 120 },
           ], (v) => addCoverage.mutateAsync(v as any))} />
          <TA value={sentimentUrl} onChange={setSentimentUrl} placeholder="Paste article headline, text, or URL..." rows={2} />
          <div style={{ marginTop: 10 }}>
             <Btn primary onClick={async () => { setSentimentLoading(true); try { const { data, error } = await supabase.functions.invoke('ai-generate', { body: { type: 'sentiment', text: sentimentUrl } }); if (error) throw error; if (data?.error) { toast.error(data.error); } else { setSentimentResult(data); } } catch (e: any) { toast.error(e.message || 'Analysis failed'); } finally { setSentimentLoading(false); } }} disabled={sentimentLoading || !sentimentUrl}>
               <I name="sparkle" size={12} /> {sentimentLoading ? "Analyzing..." : "Analyze Sentiment"}
             </Btn>
          </div>
          {sentimentResult && <div style={{ ...cardSx, border: `1px solid ${sentimentResult.sentiment === "positive" ? C.accent : sentimentResult.sentiment === "negative" ? C.hot : C.blue}40`, borderRadius: 10, padding: 16, marginTop: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div><div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Sentiment</div><div style={{ fontSize: 16, fontWeight: 700, color: sentimentResult.sentiment === "positive" ? C.accent : sentimentResult.sentiment === "negative" ? C.hot : C.blue, textTransform: "capitalize" }}>{sentimentResult.sentiment}</div></div>
              <div><div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Score</div><div style={{ fontSize: 16, fontWeight: 700, color: C.white }}>{sentimentResult.score}/100</div></div>
              <div><div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" }}>Est. Reach</div><div style={{ fontSize: 16, fontWeight: 700, color: C.accent }}>{sentimentResult.reach_estimate}</div></div>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}><strong style={{ color: C.white }}>PR Impact:</strong> {sentimentResult.pr_impact}</div>
          </div>}
        </div>}

         {/* ═══ SOCIAL CALENDAR ═══ */}
         {tab === "calendar" && <div style={{ padding: 24, maxWidth: 1200 }}>
           <SectionHeader title="Social Calendar" onAdd={() => openAdd("Add social post", [
             { name: "post_date", label: "Post date", type: "date", required: true },
             { name: "post_time", label: "Post time", maxLength: 30 },
             { name: "channel", label: "Channel", type: "select", options: ["IG", "LI", "X", "TikTok", "Facebook"], required: true },
             { name: "caption", label: "Caption", type: "textarea", required: true, maxLength: 2000 },
             { name: "status", label: "Status", type: "select", options: ["pending", "approved", "published"], required: true },
             { name: "client", label: "Client", maxLength: 120 },
           ], (v) => addCalendarPost.mutateAsync(v))} />
           <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
             {Array.from({ length: 7 }, (_, i) => new Date(2026, 3, 9 + i)).map((d, di) => {
               const ds = d.toISOString().split("T")[0]; const today = ds === "2026-04-10";
               const addedPosts = calendarPosts.filter((p: any) => p.post_date === ds);
               return <div key={di} style={{ ...cardSx, border: `1px solid ${today ? C.accent + "50" : C.border}`, borderRadius: 8, padding: 8, minHeight: 160 }}>
                <div style={{ fontSize: 8, color: today ? C.accent : C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{d.toLocaleDateString("en-US", { weekday: "short" })} {d.getDate()}</div>
                 {[{ t: "10 AM", p: "IG", c: "Launch prep", s: "approved" }, { t: "2 PM", p: "LI", c: "Industry insight", s: "pending" }].filter((_, j) => j <= di % 3).map((p, j) => (
                   <div key={`seed-${j}`} style={{ background: "#0c0c0c", borderRadius: 4, padding: 5, marginBottom: 3, borderLeft: `2px solid ${p.s === "approved" ? C.accent : C.blue}`, fontSize: 9 }}>
                     <div style={{ color: C.textMuted }}>{p.t} · {p.p}</div>
                     <div style={{ color: C.textDim }}>{p.c}</div>
                   </div>
                 ))}
                 {addedPosts.map((p: any) => <div key={p.id} style={{ background: C.accentGlow, borderRadius: 4, padding: 5, marginBottom: 3, borderLeft: `2px solid ${C.accent}`, fontSize: 9 }}><div style={{ color: C.accent }}>{p.post_time || "Scheduled"} · {p.channel}</div><div style={{ color: C.textDim }}>{p.caption}</div></div>)}
              </div>;
            })}
          </div>
        </div>}

         {/* ═══ ANALYTICS ═══ */}
         {tab === "analytics" && <div style={{ padding: 24, maxWidth: 1200 }}>
           <SectionHeader title="Analytics & Insights" onAdd={() => openAdd("Add coverage", [
             { name: "outlet", label: "Outlet", required: true, maxLength: 120 },
             { name: "title", label: "Headline", required: true, maxLength: 240 },
             { name: "url", label: "Article URL", type: "url", maxLength: 500 },
             { name: "date", label: "Date", type: "date" },
             { name: "sentiment", label: "Sentiment", type: "select", options: ["positive", "neutral", "negative"], required: true },
             { name: "reach", label: "Reach", maxLength: 40 },
             { name: "client", label: "Client", maxLength: 120 },
           ], (v) => addCoverage.mutateAsync(v as any))} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            <Stat label="Coverage (30d)" value="127" icon="monitor" color={C.accent} glow={C.accentGlow} />
            <Stat label="Media Value" value="$480K" icon="trending" color={C.accent} glow={C.accentGlow} />
            <Stat label="Sentiment" value="94%" icon="health" color={C.blue} glow={C.blueGlow} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ ...cardSx, borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, margin: "0 0 10px", color: C.accent }}>Reach Over Time</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={CHART_DATA}><CartesianGrid strokeDasharray="3 3" stroke={C.border} /><XAxis dataKey="month" tick={{ fontSize: 10, fill: C.textDim }} /><YAxis tick={{ fontSize: 10, fill: C.textDim }} /><Tooltip contentStyle={{ ...cardSx, borderRadius: 8, fontSize: 11 }} /><Line type="monotone" dataKey="reach" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent }} /></LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ ...cardSx, borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, margin: "0 0 10px", color: C.accent }}>Smart Pitch Timing</h3>
              {(() => {
                const best = bestPitchDay([{ day: "Tue", response: "positive" }, { day: "Tue", response: "positive" }, { day: "Wed", response: "positive" }, { day: "Mon", response: "negative" }, { day: "Tue", response: "positive" }, { day: "Thu", response: "negative" }, { day: "Wed", response: "positive" }]);
                return <div style={{ textAlign: "center", padding: 20 }}>
                  <div style={{ fontSize: 36, fontFamily: F.display, fontWeight: 700, color: C.accent }}>{best[0]}</div>
                  <div style={{ fontSize: 11, color: C.textDim }}>Best day to pitch ({best[1]} positive responses)</div>
                  <div style={{ fontSize: 10, color: C.textMuted, marginTop: 8 }}>Based on historical response analysis</div>
                </div>;
              })()}
            </div>
          </div>
        </div>}

         {/* ═══ ROI CALCULATOR ═══ */}
         {tab === "roi" && <div style={{ padding: 24, maxWidth: 800 }}>
             <SectionHeader title="ROI Calculator" onAdd={() => openAdd("Save ROI scenario", [
              { name: "name", label: "Scenario name", required: true, maxLength: 120 },
              { name: "client", label: "Client", type: "select", options: [{ value: "", label: "No client" }, ...clientOptions], maxLength: 120 },
             { name: "retainer", label: "Monthly retainer", type: "number", required: true },
             { name: "ad_value", label: "Media value", type: "number", required: true },
             { name: "months", label: "Months", type: "number", required: true, defaultValue: "12" },
           ], (v) => addROIScenario.mutateAsync({ ...v, roi: calcROI(v.retainer, v.ad_value, v.months).roi }))} />
           <div style={{ ...cardSx, borderRadius: 12, padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div><label style={{ fontSize: 10, color: C.textMuted, display: "block", marginBottom: 4 }}>Monthly Retainer ($)</label><Input value={roiRetainer} onChange={setRoiRetainer} type="number" /></div>
              <div><label style={{ fontSize: 10, color: C.textMuted, display: "block", marginBottom: 4 }}>Total Ad Equivalency ($)</label><Input value={roiAdValue} onChange={setRoiAdValue} type="number" /></div>
              <div><label style={{ fontSize: 10, color: C.textMuted, display: "block", marginBottom: 4 }}>Months</label><Input value={roiMonths} onChange={setRoiMonths} type="number" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, textAlign: "center" }}>
              <div style={{ background: "#0c0c0c", borderRadius: 10, padding: 16 }}><div style={{ fontSize: 24, fontFamily: F.display, fontWeight: 700, color: C.hot }}>${(roi.inv / 1000).toFixed(0)}K</div><div style={{ fontSize: 10, color: C.textMuted }}>Total Investment</div></div>
              <div style={{ background: "#0c0c0c", borderRadius: 10, padding: 16 }}><div style={{ fontSize: 24, fontFamily: F.display, fontWeight: 700, color: C.accent }}>${(roi.adValue / 1000).toFixed(0)}K</div><div style={{ fontSize: 10, color: C.textMuted }}>Media Value Earned</div></div>
              <div style={{ background: C.accentGlow, borderRadius: 10, padding: 16, border: `1px solid ${C.accent}30` }}><div style={{ fontSize: 24, fontFamily: F.display, fontWeight: 700, color: C.accent }}>{roi.roi}%</div><div style={{ fontSize: 10, color: C.textMuted }}>Return on Investment</div></div>
            </div>
          </div>
        </div>}

         {/* ═══ MEETING PARSER ═══ */}
         {tab === "meeting" && <div style={{ padding: 24, maxWidth: 900 }}>
           <SectionHeader title="Meeting Notes → Action Items" subtitle="Paste meeting notes, AI extracts tasks with assignees and deadlines" onAdd={() => openAdd("Save meeting notes", [
             { name: "title", label: "Meeting title", required: true, maxLength: 160 },
             { name: "meeting_date", label: "Date", type: "date" },
             { name: "attendees", label: "Attendees", maxLength: 500 },
             { name: "notes", label: "Notes", type: "textarea", required: true, maxLength: 5000 },
             { name: "client", label: "Client", maxLength: 120 },
           ], (v) => addMeetingNote.mutateAsync(v))} />
          <TA value={meetingNotes} onChange={setMeetingNotes} placeholder="Paste meeting notes here..." rows={5} />
          <div style={{ marginTop: 10 }}>
             <Btn primary onClick={async () => { setMeetingLoading(true); try { const { data, error } = await supabase.functions.invoke('ai-generate', { body: { type: 'meeting-actions', notes: meetingNotes } }); if (error) throw error; if (data?.error) { toast.error(data.error); } else { setMeetingActions(data.actions || []); } } catch (e: any) { toast.error(e.message || 'Parsing failed'); } finally { setMeetingLoading(false); } }} disabled={meetingLoading || !meetingNotes}>
               <I name="sparkle" size={12} /> {meetingLoading ? "Parsing..." : "Extract Action Items"}
             </Btn>
          </div>
          {meetingActions && <div style={{ marginTop: 14 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 10 }}>Extracted Actions ({meetingActions.length})</h3>
            {meetingActions.map((a: any, i: number) => (
              <div key={i} style={{ ...cardSx, borderRadius: 8, padding: 12, marginBottom: 6, borderLeft: `3px solid ${a.priority === "high" ? C.hot : a.priority === "medium" ? C.orange : C.accent}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.white }}>{a.task}</div>
                <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, color: C.textDim }}>
                  <span>👤 {a.assignee}</span><span>📅 {a.deadline}</span><Badge text={a.priority} color={a.priority === "high" ? C.hot : C.orange} />
                </div>
              </div>
            ))}
          </div>}
        </div>}

         {/* ═══ COMPETITOR INTEL ═══ */}
         {tab === "competitor" && <div style={{ padding: 24, maxWidth: 900 }}>
           <SectionHeader title="Competitor Intelligence" subtitle="Describe competitor activity → AI finds PR opportunities" onAdd={() => openAdd("Add competitor note", [
             { name: "competitor", label: "Competitor", required: true, maxLength: 160 },
             { name: "source", label: "Source / outlet", maxLength: 200 },
             { name: "note", label: "Observation", type: "textarea", required: true, maxLength: 2000 },
             { name: "urgency", label: "Urgency", type: "select", options: ["high", "medium", "low"], required: true },
             { name: "note_date", label: "Date", type: "date" },
           ], (v) => addCompetitorNote.mutateAsync(v))} />
          <TA value={competitorQ} onChange={setCompetitorQ} placeholder="What's your competitor doing?..." rows={3} />
          <div style={{ marginTop: 10 }}>
             <Btn primary onClick={async () => { setCompetitorLoading(true); try { const { data, error } = await supabase.functions.invoke('ai-generate', { body: { type: 'competitor-intel', query: competitorQ } }); if (error) throw error; if (data?.error) { toast.error(data.error); } else { setCompetitorResult(data.opportunities || []); } } catch (e: any) { toast.error(e.message || 'Analysis failed'); } finally { setCompetitorLoading(false); } }} disabled={competitorLoading || !competitorQ}>
               <I name="sparkle" size={12} /> {competitorLoading ? "Analyzing..." : "Find Opportunities"}
             </Btn>
          </div>
          {competitorResult && <div style={{ marginTop: 14 }}>
            {competitorResult.map((c: any, i: number) => (
              <div key={i} style={{ ...cardSx, borderRadius: 8, padding: 14, marginBottom: 8, borderLeft: `3px solid ${c.urgency === "high" ? C.hot : C.orange}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.white, marginBottom: 4 }}>{c.opportunity}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.textDim }}><span>📰 {c.outlet}</span><span>📐 {c.angle}</span><Badge text={c.urgency} color={c.urgency === "high" ? C.hot : C.orange} /></div>
              </div>
            ))}
          </div>}
        </div>}

         {/* ═══ BOILERPLATES ═══ */}
         {tab === "boilerplate" && <div style={{ padding: 24, maxWidth: 900 }}>
           <SectionHeader title="Boilerplate Manager" onAdd={() => openAdd("Add boilerplate", [
             { name: "client", label: "Client", required: true, maxLength: 160 },
             { name: "body", label: "Boilerplate text", type: "textarea", required: true, maxLength: 5000 },
           ], (v) => addBoilerplate.mutateAsync(v))} />
           <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <Input value={bpClient} onChange={setBpClient} placeholder="Client name to generate boilerplate..." style={{ flex: 1 }} />
             <Btn primary onClick={async () => { setBpLoading(true); const clientName = bpClient; let acc = ""; setBoilerplates((p) => [...p, { id: Date.now(), client: clientName, text: "", generated: true }]); setBpClient(""); await streamAI({ type: 'boilerplate', client: clientName }, (d) => { acc += d; setBoilerplates((p) => p.map((b) => b.client === clientName && b.text.length <= acc.length ? { ...b, text: acc } : b)); }, () => setBpLoading(false), (e) => { toast.error(e); setBpLoading(false); }); }} disabled={bpLoading || !bpClient}>
               <I name="sparkle" size={12} /> {bpLoading ? "..." : "Generate"}
             </Btn>
          </div>
          {boilerplates.map((b) => (
            <div key={b.id} style={{ ...cardSx, borderRadius: 10, padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>{b.client}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn small onClick={() => navigator.clipboard?.writeText(b.text)}><I name="copy" size={11} /> Copy</Btn>
                  {b.generated && <Badge text="AI Generated" color={C.purple} />}
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>{b.text}</div>
            </div>
          ))}
        </div>}

         {/* ═══ CLIENT ONBOARD ═══ */}
         {tab === "onboard" && <div style={{ padding: 24, maxWidth: 800 }}>
           <SectionHeader title="Client Onboarding Wizard" onAdd={() => openAdd("Add client", [
             { name: "name", label: "Client name", required: true, maxLength: 160 },
             { name: "industry", label: "Industry", maxLength: 120 },
             { name: "website", label: "Website", type: "url", maxLength: 500 },
             { name: "contact_email", label: "Contact email", type: "email", maxLength: 255 },
             { name: "status", label: "Status", type: "select", options: ["active", "paused", "prospect"], required: true },
             { name: "notes", label: "Notes", type: "textarea", maxLength: 2000 },
           ], (v) => addClient.mutateAsync(v))} />
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {["Company Info", "Campaign Goals", "Brand Assets", "Complete"].map((s, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= onboardStep ? C.accent : C.border }} />
            ))}
          </div>
          <div style={{ ...cardSx, borderRadius: 12, padding: 24 }}>
            {onboardStep === 0 && <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.accent, margin: "0 0 14px" }}>Step 1: Company Info</h3>
              <div style={{ display: "grid", gap: 10 }}>
                <Input value={onboardData.name} onChange={(v: string) => setOnboardData((p) => ({ ...p, name: v }))} placeholder="Company name" />
                <Input value={onboardData.industry} onChange={(v: string) => setOnboardData((p) => ({ ...p, industry: v }))} placeholder="Industry" />
                <Input value={onboardData.website} onChange={(v: string) => setOnboardData((p) => ({ ...p, website: v }))} placeholder="Website" />
                <Input value={onboardData.contact} onChange={(v: string) => setOnboardData((p) => ({ ...p, contact: v }))} placeholder="Primary contact name & email" />
              </div>
            </div>}
            {onboardStep === 1 && <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.accent, margin: "0 0 14px" }}>Step 2: Campaign Goals</h3>
              <TA value={onboardData.goals} onChange={(v: string) => setOnboardData((p) => ({ ...p, goals: v }))} placeholder="What are the PR objectives?" rows={3} />
              <div style={{ marginTop: 10 }}><TA value={onboardData.audience} onChange={(v: string) => setOnboardData((p) => ({ ...p, audience: v }))} placeholder="Target audience" rows={2} /></div>
              <div style={{ marginTop: 10 }}><TA value={onboardData.messages} onChange={(v: string) => setOnboardData((p) => ({ ...p, messages: v }))} placeholder="Key messages" rows={2} /></div>
            </div>}
            {onboardStep === 2 && <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: C.accent, margin: "0 0 14px" }}>Step 3: Brand Assets</h3>
              <TA value={onboardData.boilerplate} onChange={(v: string) => setOnboardData((p) => ({ ...p, boilerplate: v }))} placeholder="Company boilerplate (or we'll generate one)" rows={3} />
              <div style={{ marginTop: 10 }}><Input value={onboardData.spokesperson} onChange={(v: string) => setOnboardData((p) => ({ ...p, spokesperson: v }))} placeholder="Primary spokesperson name & title" /></div>
              <div style={{ marginTop: 10 }}><Input value={onboardData.voice} onChange={(v: string) => setOnboardData((p) => ({ ...p, voice: v }))} placeholder="Brand voice (professional, casual, bold, etc.)" /></div>
            </div>}
            {onboardStep === 3 && <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.accent, margin: "0 0 8px" }}>Onboarding Complete!</h3>
              <p style={{ fontSize: 12, color: C.textDim }}>Client <strong>{onboardData.name || "New Client"}</strong> is ready.</p>
            </div>}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <Btn small onClick={() => setOnboardStep((p) => Math.max(0, p - 1))} disabled={onboardStep === 0}>← Back</Btn>
              <Btn primary onClick={() => setOnboardStep((p) => Math.min(3, p + 1))} disabled={onboardStep === 3}>{onboardStep === 2 ? "Complete Setup →" : "Next →"}</Btn>
            </div>
          </div>
        </div>}

         {/* ═══ REPORT BUILDER ═══ */}
         {tab === "reports" && <div style={{ padding: 24, maxWidth: 900 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
             <h1 style={{ fontSize: 20, fontFamily: F.display, fontWeight: 700, margin: 0, color: C.white }}>Report Builder</h1>
             <div style={{ display: "flex", gap: 6 }}>
               <Btn small onClick={() => setHistoryTab(historyTab === "report" ? null : "report")}><I name="notes" size={12} /> History ({aiHistory.filter(h => h.type === "report").length})</Btn>
               <Btn small primary onClick={() => openAdd("Save report", [
                 { name: "title", label: "Report title", required: true, maxLength: 160 },
                 { name: "client", label: "Client", maxLength: 160 },
                 { name: "period", label: "Period", maxLength: 80 },
                 { name: "body", label: "Summary", type: "textarea", required: true, maxLength: 10000 },
               ], (v) => addReport.mutateAsync(v))}>+ Add Report</Btn>
             </div>
           </div>
           {historyTab === "report" && <div style={{ ...cardSx, borderRadius: 10, padding: 14, marginBottom: 14, maxHeight: 300, overflowY: "auto" }}>
             <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 8 }}>Saved Reports</div>
             {storedReports.length > 0 && <div style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}><div style={{ fontSize: 10, color: C.textDim, marginBottom: 4 }}>Portal reports</div>{storedReports.map((r: any) => <div key={r.id} style={{ fontSize: 10, color: C.white, padding: "3px 0" }}>{r.title} <span style={{ color: C.textMuted }}>· {r.period || "No period"}</span></div>)}</div>}
            {aiHistory.filter(h => h.type === "report").length === 0 && <div style={{ fontSize: 10, color: C.textMuted, padding: 10 }}>No saved outputs yet</div>}
            {aiHistory.filter(h => h.type === "report").map(h => (
              <div key={h.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 11, fontWeight: 500, color: C.white }}>{h.title}</div><div style={{ fontSize: 9, color: C.textMuted }}>{new Date(h.created_at).toLocaleDateString()}</div></div>
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn small onClick={() => { setReportResult(h.content); setHistoryTab(null); }}>Load</Btn>
                  <Btn small color={C.hot} onClick={() => deleteOutput.mutate(h.id)}>✕</Btn>
                </div>
              </div>
            ))}
          </div>}
          <div style={{ ...cardSx, borderRadius: 10, padding: 16, marginBottom: 14 }}>
            <Select value={reportClient} onChange={setReportClient} options={[...new Set(dbCoverage.map((c) => c.client))].map((c) => ({ value: c, label: c }))} placeholder="Choose client..." />
            {reportClient && <div style={{ background: "#0c0c0c", borderRadius: 7, padding: 10, marginTop: 10, display: "flex", gap: 16 }}>
              <div><span style={{ fontSize: 18, fontFamily: F.display, fontWeight: 700, color: C.accent }}>{dbCoverage.filter((c) => c.client === reportClient).length}</span><div style={{ fontSize: 9, color: C.textMuted }}>Placements</div></div>
              <div><span style={{ fontSize: 18, fontFamily: F.display, fontWeight: 700, color: C.accent }}>{dbCoverage.filter((c) => c.client === reportClient).reduce((a, c) => a + parseInt(c.reach), 0).toLocaleString()}</span><div style={{ fontSize: 9, color: C.textMuted }}>Reach</div></div>
            </div>}
            <div style={{ marginTop: 10 }}>
               <Btn primary onClick={async () => { setReportLoading(true); setReportResult(""); const clientCoverage = dbCoverage.filter((c) => c.client === reportClient); let acc = ""; await streamAI({ type: 'report', client: reportClient, placements: clientCoverage.length, reach: clientCoverage.reduce((a, c) => a + parseInt(c.reach || '0'), 0).toLocaleString(), titles: clientCoverage.map((c) => c.title).join(', ') }, (d) => { acc += d; setReportResult(acc); }, () => setReportLoading(false), (e) => { toast.error(e); setReportLoading(false); }); }} disabled={reportLoading || !reportClient}>
                 <I name="sparkle" size={12} /> {reportLoading ? "..." : "Generate Report"}
               </Btn>
            </div>
          </div>
          {(reportResult || reportLoading) && <div style={{ ...cardSx, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginBottom: 8 }}>
              <Btn small onClick={() => navigator.clipboard?.writeText(reportResult).then(() => toast.success("Copied!"))}><I name="copy" size={11} /> Copy</Btn>
              {reportResult && !reportLoading && <Btn small primary onClick={() => { saveOutput.mutate({ type: "report", title: `${reportClient} — Monthly Report`, content: reportResult, inputs: { client: reportClient } }); toast.success("Saved!"); }}><I name="notes" size={11} /> Save</Btn>}
            </div>
            <pre style={{ fontSize: 10, color: C.textDim, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: F.body, margin: 0 }}>{reportResult}{reportLoading && <span style={{ display: "inline-block", width: 6, height: 14, background: C.accent, animation: "blink 1s infinite", marginLeft: 2, verticalAlign: "text-bottom" }} />}</pre>
          </div>}
        </div>}



         {/* ═══ MEDIA MONITOR ═══ */}
         {tab === "monitor" && <div style={{ padding: 24, maxWidth: 1200 }}>
           <SectionHeader title="Media Monitor" onAdd={() => openAdd("Add media mention", [
             { name: "outlet", label: "Outlet", required: true, maxLength: 120 },
             { name: "title", label: "Headline", required: true, maxLength: 240 },
             { name: "url", label: "Article URL", type: "url", maxLength: 500 },
             { name: "date", label: "Date", type: "date" },
             { name: "sentiment", label: "Sentiment", type: "select", options: ["positive", "neutral", "negative"], required: true },
             { name: "reach", label: "Reach", maxLength: 40 },
             { name: "client", label: "Client", maxLength: 120 },
           ], (v) => addCoverage.mutateAsync(v as any))} />
           <div style={{ ...cardSx, borderRadius: 10, padding: 16 }}>
            {dbCoverage.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < dbCoverage.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 500, color: C.white }}>{c.title}</div><div style={{ fontSize: 9, color: C.textDim }}>{c.outlet} · {c.client} · {c.reach}</div></div>
                <Badge text={c.sentiment} color={c.sentiment === "positive" ? C.accent : C.blue} />
              </div>
            ))}
          </div>
        </div>}

         {/* ═══ CLIENT PORTAL ═══ */}
         {tab === "portal" && <div style={{ padding: 24, maxWidth: 1100 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
             <h1 style={{ fontSize: 20, fontFamily: F.display, fontWeight: 700, margin: 0, color: C.white }}>Client Portal</h1>
             <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
               <Btn small primary onClick={() => openAdd("Add client", [
                 { name: "name", label: "Client name", required: true, maxLength: 160 },
                 { name: "industry", label: "Industry", maxLength: 120 },
                 { name: "website", label: "Website", type: "url", maxLength: 500 },
                 { name: "contact_email", label: "Contact email", type: "email", maxLength: 255 },
                 { name: "status", label: "Status", type: "select", options: ["active", "paused", "prospect"], required: true },
                 { name: "notes", label: "Notes", type: "textarea", maxLength: 2000 },
               ], (v) => addClient.mutateAsync(v))}>+ Add Client</Btn>
               <Select value={portalClient} onChange={setPortalClient} options={[...new Set([...dbCoverage.map((c) => c.client), ...clients.map((c: any) => c.name)].filter(Boolean))].map((c) => ({ value: c, label: c }))} />
             </div>
           </div>
          <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}30`, borderRadius: 12, padding: 18, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 15, fontFamily: F.display, fontWeight: 700, color: C.white }}>{portalClient}</div><div style={{ fontSize: 10, color: C.textDim }}>Managed by ABM PR</div></div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: F.display, fontWeight: 700, color: C.accent }}>{dbCoverage.filter((c) => c.client === portalClient).length}</div><div style={{ fontSize: 8, color: C.textMuted }}>Placements</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: F.display, fontWeight: 700, color: C.accent }}>{calcHealth({ placements: dbCoverage.filter((c) => c.client === portalClient).length, sentiment: 85, overdue: 1, daysSince: 3, hitRate: 38 })}</div><div style={{ fontSize: 8, color: C.textMuted }}>Health</div></div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ ...cardSx, borderRadius: 10, padding: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, margin: "0 0 8px", color: C.accent }}>Coverage</h3>
              {dbCoverage.filter((c) => c.client === portalClient).map((c, i) => (
                <div key={i} style={{ padding: "7px 0", borderBottom: `1px solid ${C.border}` }}><div style={{ fontSize: 10, fontWeight: 500 }}>{c.title}</div><div style={{ fontSize: 9, color: C.textDim }}>{c.outlet} · {c.date}</div></div>
              ))}
            </div>
            <div style={{ ...cardSx, borderRadius: 10, padding: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, margin: "0 0 8px", color: C.purple }}>Pending Approval</h3>
              {[{ item: "Press Release v2", due: "Apr 10", u: true }, { item: "Social batch #5", due: "Apr 11", u: false }, { item: "Media kit update", due: "Apr 12", u: false }].map((a, i) => (
                <div key={i} style={{ background: "#0c0c0c", borderRadius: 6, padding: 8, marginBottom: 5, borderLeft: `2px solid ${a.u ? C.hot : C.accent}` }}>
                  <div style={{ fontSize: 10, fontWeight: 500, marginBottom: 4 }}>{a.item} <span style={{ fontSize: 8, color: C.textMuted }}>Due: {a.due}</span></div>
                  <div style={{ display: "flex", gap: 3 }}><Btn primary small color={C.accent}>Approve</Btn><Btn small>Changes</Btn></div>
                </div>
              ))}
            </div>
            <div style={{ ...cardSx, borderRadius: 10, padding: 16, gridColumn: "1/-1" }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, margin: "0 0 10px", color: C.accent }}>Campaign Progress</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[{ p: "Strategy", pct: 100 }, { p: "Content", pct: 75 }, { p: "Outreach", pct: 60 }, { p: "Reporting", pct: 20 }].map((s, i) => (
                  <div key={i} style={{ background: "#0c0c0c", borderRadius: 6, padding: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 500, marginBottom: 4 }}>{s.p}</div>
                    <div style={{ height: 4, borderRadius: 2, background: C.border, overflow: "hidden" }}><div style={{ height: "100%", width: `${s.pct}%`, borderRadius: 2, background: s.pct === 100 ? C.accent : C.accentDim }} /></div>
                    <div style={{ fontSize: 8, color: C.accent, fontWeight: 600, textAlign: "right", marginTop: 2 }}>{s.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>}

        {/* ═══ SETTINGS ═══ */}
         {tab === "settings" && <div style={{ padding: 24, maxWidth: 1100 }}>
           <h1 style={{ fontSize: 22, fontFamily: F.display, fontWeight: 700, margin: "0 0 4px", color: C.white }}>Settings</h1>
           <p style={{ color: C.textDim, margin: "0 0 18px", fontSize: 12 }}>Workspace connections and tool access</p>
           <MCPConnectorsPanel />
         </div>}
       </SidebarInset>

       {addModal && <AddRecordModal open title={addModal.title} fields={addModal.fields} onClose={() => setAddModal(null)} onSubmit={submitAdd} />}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePw && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.7)" }} onClick={() => setShowChangePw(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...cardSx, borderRadius: 14, padding: 28, width: 380, maxWidth: "90vw" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.white, fontFamily: F.display, marginBottom: 18 }}>Change Password</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Input type="password" value={pwCurrent} onChange={setPwCurrent} placeholder="Current password" />
              <Input type="password" value={pwNew} onChange={setPwNew} placeholder="New password" />
              <Input type="password" value={pwConfirm} onChange={setPwConfirm} placeholder="Confirm new password" />
            </div>
            {pwNew && pwConfirm && pwNew !== pwConfirm && (
              <div style={{ fontSize: 11, color: C.hot, marginTop: 8 }}>Passwords do not match</div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "flex-end" }}>
              <Btn small onClick={() => { setShowChangePw(false); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }}>Cancel</Btn>
              <Btn small primary disabled={pwLoading || !pwCurrent || !pwNew || pwNew !== pwConfirm || pwNew.length < 6} onClick={async () => {
                setPwLoading(true);
                try {
                  // Verify current password by signing in
                  const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user!.email!, password: pwCurrent });
                  if (signInErr) { toast.error("Current password is incorrect"); setPwLoading(false); return; }
                  const { error } = await supabase.auth.updateUser({ password: pwNew });
                  if (error) { toast.error(error.message); } else { toast.success("Password updated!"); setShowChangePw(false); setPwCurrent(""); setPwNew(""); setPwConfirm(""); }
                } catch (e: any) { toast.error(e.message || "Failed"); }
                setPwLoading(false);
              }}>{pwLoading ? "Updating…" : "Update Password"}</Btn>
            </div>
          </div>
        </div>
      )}
      </div>
    </SidebarProvider>
  );
}

