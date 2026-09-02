import { useRef, useState } from "react";
import { P, LANGUAGES, TONES, VERBOSITIES } from "./theme";

export interface CreateConfig {
  title: string;
  topic: string;
  businessName: string;
  tone: string;
  language: string;
  slideCount: number;
  autoSlides: boolean;
  verbosity: string;
  instructions: string;
  includeTitleSlide: boolean;
  includeTableOfContents: boolean;
  webSearch: boolean;
  generationMode: "standard" | "smart";
  sourceFile?: { name: string; type: string; text: string };
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
  const [c, setC] = useState<CreateConfig>({ title: "", topic: "", businessName: "", tone: "Professional", language: "English", slideCount: 8, autoSlides: false, verbosity: "Standard", instructions: "", includeTitleSlide: true, includeTableOfContents: false, webSearch: false, generationMode: "standard" });
  const [advanced, setAdvanced] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (p: Partial<CreateConfig>) => setC((prev) => ({ ...prev, ...p }));
  const ready = c.title.trim() && (c.topic.trim() || c.sourceFile);
  const attach = async (file?: File) => {
    if (!file) return;
    const text = file.type.startsWith("text/") || /\.(md|txt|csv)$/i.test(file.name) ? (await file.text()).slice(0, 30000) : "";
    set({ sourceFile: { name: file.name, type: file.type, text } });
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px 60px" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: P.text, margin: 0, letterSpacing: "-0.02em" }}>Create a presentation</h1>
        <p style={{ color: P.textDim, fontSize: 14, marginTop: 8 }}>Describe your topic and Presenton drafts an outline you can edit.</p>
      </div>

      <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 16, padding: 24, boxShadow: P.shadow }}>
        <div style={{ marginBottom: 16 }}>
          <label style={label}>What would you like to present?</label>
          <textarea
            value={c.topic}
            onChange={(e) => set({ topic: e.target.value })}
            rows={5}
            placeholder="Enter a topic, paste notes, or describe the presentation you want to create"
            style={{ ...input, resize: "vertical", lineHeight: 1.6, fontSize: 15 }}
          />
        </div>

        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.md,image/*" hidden onChange={(e) => attach(e.target.files?.[0])} />
        <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: 13, marginBottom: 16, borderRadius: 10, border: `1px dashed ${P.borderStrong}`, background: P.bg, color: P.textDim, cursor: "pointer", fontFamily: P.font, textAlign: "left" }}>
          {c.sourceFile ? `Attached: ${c.sourceFile.name}` : "Attach PDF, document, spreadsheet, presentation, text, or image"}
        </button>

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
            <select value={c.autoSlides ? "auto" : c.slideCount} onChange={(e) => set(e.target.value === "auto" ? { autoSlides: true } : { autoSlides: false, slideCount: +e.target.value })} style={input}>
              <option value="auto">Auto</option>
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

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {(["standard", "smart"] as const).map((mode) => <button key={mode} onClick={() => set({ generationMode: mode })} style={{ flex: 1, padding: 10, borderRadius: 9, border: `1px solid ${c.generationMode === mode ? P.primary : P.border}`, background: c.generationMode === mode ? P.primarySoft : P.panel, color: c.generationMode === mode ? P.primary : P.textDim, fontWeight: 700, fontFamily: P.font, cursor: "pointer", textTransform: "capitalize" }}>{mode}<span style={{ display: "block", fontWeight: 400, fontSize: 10, marginTop: 2 }}>{mode === "standard" ? "Review outline first" : "Generate slides directly"}</span></button>)}
        </div>
        <button onClick={() => setAdvanced((v) => !v)} style={{ marginTop: 14, background: "none", border: "none", color: P.primary, cursor: "pointer", fontFamily: P.font, fontWeight: 700 }}>{advanced ? "Hide" : "Show"} advanced settings</button>
        {advanced && <div style={{ marginTop: 12, paddingTop: 14, borderTop: `1px solid ${P.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={label}>Verbosity</label><select value={c.verbosity} onChange={(e) => set({ verbosity: e.target.value })} style={input}>{VERBOSITIES.map((v) => <option key={v}>{v}</option>)}</select></div>
            <div><label style={label}>Additional instructions</label><input value={c.instructions} onChange={(e) => set({ instructions: e.target.value })} placeholder="Brand voice, facts, formatting…" style={input} /></div>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap" }}>
            {[{ key: "includeTitleSlide", label: "Title slide" }, { key: "includeTableOfContents", label: "Table of contents" }, { key: "webSearch", label: "Web research" }].map((x) => <label key={x.key} style={{ fontSize: 12, color: P.textDim, display: "flex", gap: 7, alignItems: "center" }}><input type="checkbox" checked={Boolean(c[x.key as keyof CreateConfig])} onChange={(e) => set({ [x.key]: e.target.checked })} />{x.label}</label>)}
          </div>
        </div>}

        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 10, color: P.textDim, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: P.font }}>Cancel</button>
          <button
            onClick={() => ready && onNext(c)}
            disabled={!ready || loading}
            style={{ background: P.primary, border: "none", borderRadius: 10, color: "#fff", padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: ready && !loading ? "pointer" : "not-allowed", opacity: ready && !loading ? 1 : 0.5, fontFamily: P.font }}
          >
            {loading ? "Creating…" : c.generationMode === "smart" ? "Generate presentation" : "Continue to outline →"}
          </button>
        </div>
      </div>
    </div>
  );
}
