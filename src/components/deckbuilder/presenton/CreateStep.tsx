import { useState } from "react";
import { P, LANGUAGES, TONES } from "./theme";

export interface CreateConfig {
  title: string;
  topic: string;
  businessName: string;
  tone: string;
  language: string;
  slideCount: number;
}

const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px",
  borderRadius: 10,
  border: `1px solid ${P.border}`,
  background: "#fff",
  color: P.text,
  fontSize: 14,
  fontFamily: P.font,
  outline: "none",
};
const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: P.textDim, display: "block", marginBottom: 6 };

export default function CreateStep({ onNext, onCancel, loading }: { onNext: (c: CreateConfig) => void; onCancel: () => void; loading: boolean }) {
  const [c, setC] = useState<CreateConfig>({ title: "", topic: "", businessName: "", tone: "Professional", language: "English", slideCount: 8 });
  const set = (p: Partial<CreateConfig>) => setC((prev) => ({ ...prev, ...p }));
  const ready = c.title.trim() && c.topic.trim();

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px 60px" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: P.text, margin: 0, letterSpacing: "-0.02em" }}>Create a presentation</h1>
        <p style={{ color: P.textDim, fontSize: 14, marginTop: 8 }}>Describe your topic and Presenton drafts an outline you can edit.</p>
      </div>

      <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 16, padding: 24, boxShadow: P.shadow }}>
        <div style={{ marginBottom: 16 }}>
          <label style={label}>Prompt</label>
          <textarea
            value={c.topic}
            onChange={(e) => set({ topic: e.target.value })}
            rows={5}
            placeholder="e.g. A Q4 media strategy pitch for a craft brewery expanding into three new markets"
            style={{ ...input, resize: "vertical", lineHeight: 1.6, fontSize: 15 }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <label style={label}>Presentation title</label>
            <input value={c.title} onChange={(e) => set({ title: e.target.value })} placeholder="Q4 Media Strategy" style={input} />
          </div>
          <div>
            <label style={label}>Audience / business</label>
            <input value={c.businessName} onChange={(e) => set({ businessName: e.target.value })} placeholder="Crescent City Brewing" style={input} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={label}>Slides</label>
            <select value={c.slideCount} onChange={(e) => set({ slideCount: +e.target.value })} style={input}>
              {Array.from({ length: 16 }, (_, i) => i + 5).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Tone</label>
            <select value={c.tone} onChange={(e) => set({ tone: e.target.value })} style={input}>
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Language</label>
            <select value={c.language} onChange={(e) => set({ language: e.target.value })} style={input}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 10, color: P.textDim, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: P.font }}>Cancel</button>
          <button
            onClick={() => ready && onNext(c)}
            disabled={!ready || loading}
            style={{ background: P.primary, border: "none", borderRadius: 10, color: "#fff", padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: ready && !loading ? "pointer" : "not-allowed", opacity: ready && !loading ? 1 : 0.5, fontFamily: P.font }}
          >
            {loading ? "Drafting outline…" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
