import { useState } from "react";
import { useDecks, useCreateDeck, useDeleteDeck, type Deck, type Slide } from "@/hooks/useDecks";
import { supabase } from "@/integrations/supabase/client";
import SlideEditor from "./SlideEditor";
import { exportPPTX } from "./DeckExport";
import { toast } from "sonner";

const C = { bg: "#080808", surface: "#0f0f0f", card: "#161616", cardH: "#1e1e1e", border: "#252525", accent: "#5cb85c", accentDim: "#3d8b3d", hot: "#e85d4a", text: "#f0f0f0", textDim: "#999", textMuted: "#555", white: "#fff", blue: "#5b9cf5", purple: "#a78bfa" };
const F = { display: "'Outfit',sans-serif", body: "'DM Sans',sans-serif" };

const TONES = ["Professional", "Sales Pitch", "Educational", "Casual"];

export default function DeckDashboard() {
  const { data: decks = [], isLoading } = useDecks();
  const createDeck = useCreateDeck();
  const deleteDeck = useDeleteDeck();
  const [showForm, setShowForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [tone, setTone] = useState("Professional");
  const [slideCount, setSlideCount] = useState(8);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!title || !topic) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-deck", {
        body: { topic, businessName, tone: tone.toLowerCase(), slideCount },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setGenerating(false); return; }

      const slides: Slide[] = data.slides || [];
      const result = await createDeck.mutateAsync({ title, business_name: businessName, topic, tone: tone.toLowerCase(), slides, theme: "dark" });
      setShowForm(false);
      setEditingDeck({ ...result, slides } as any);
      setTitle(""); setTopic(""); setBusinessName(""); setTone("Professional"); setSlideCount(8);
      toast.success("Deck generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate deck");
    }
    setGenerating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deck?")) return;
    await deleteDeck.mutateAsync(id);
    toast.success("Deck deleted");
  };

  if (editingDeck) return <SlideEditor deck={editingDeck} onBack={() => setEditingDeck(null)} />;

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ fontSize: 20, fontFamily: F.display, fontWeight: 700, margin: 0, color: C.white }}>Deck Builder</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ background: C.accent, border: "none", borderRadius: 8, color: "#000", padding: "10px 18px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: F.body, display: "flex", alignItems: "center", gap: 6 }}>
          + New Deck
        </button>
      </div>

      {/* New Deck Form */}
      {showForm && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 14, fontFamily: F.display }}>Create New Deck</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Deck Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q4 Media Strategy" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#0c0c0c", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Business Name</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Crescent City Brewing" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#0c0c0c", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Topic / Prompt *</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What should this deck cover?" rows={3} style={{ width: "100%", padding: 14, borderRadius: 10, border: `1px solid ${C.border}`, background: "#0c0c0c", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", resize: "vertical", lineHeight: 1.7, boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: `1px solid ${C.border}`, background: "#0c0c0c", color: C.text, fontSize: 12, fontFamily: F.body }}>
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Slide Count (5-20)</label>
              <input type="number" min={5} max={20} value={slideCount} onChange={(e) => setSlideCount(Math.max(5, Math.min(20, +e.target.value)))} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#0c0c0c", color: C.text, fontSize: 13, fontFamily: F.body, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleGenerate} disabled={generating || !title || !topic} style={{ background: C.accent, border: "none", borderRadius: 8, color: "#000", padding: "10px 18px", cursor: generating ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: F.body, opacity: generating || !title || !topic ? 0.5 : 1, display: "flex", alignItems: "center", gap: 6 }}>
              ✦ {generating ? "Generating..." : "Generate Deck"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, padding: "10px 18px", cursor: "pointer", fontSize: 12, fontFamily: F.body }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Deck Grid */}
      {isLoading ? (
        <div style={{ color: C.textDim, fontSize: 13, textAlign: "center", padding: 40 }}>Loading decks...</div>
      ) : decks.length === 0 && !showForm ? (
        <div style={{ textAlign: "center", padding: 60, color: C.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.textDim, marginBottom: 6 }}>No decks yet</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Click "New Deck" to create your first AI-powered presentation</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280, 1fr))", gap: 12 }}>
          {decks.map((d) => (
            <div key={d.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, transition: "border-color .15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accent + "60")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.white, fontFamily: F.display, marginBottom: 4 }}>{d.title}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8 }}>
                {d.business_name && <span>{d.business_name} · </span>}
                {d.slides.length} slides · {new Date(d.created_at).toLocaleDateString()}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button onClick={() => setEditingDeck(d)} style={{ background: C.accent + "15", border: `1px solid ${C.accent}30`, borderRadius: 5, color: C.accent, padding: "4px 10px", cursor: "pointer", fontSize: 10, fontFamily: F.body }}>Edit</button>
                <button onClick={() => exportPPTX(d.slides, d.title, d.theme || "dark")} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.textDim, padding: "4px 10px", cursor: "pointer", fontSize: 10, fontFamily: F.body }}>PPTX</button>
                <button onClick={() => handleDelete(d.id)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.hot, padding: "4px 10px", cursor: "pointer", fontSize: 10, fontFamily: F.body }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
