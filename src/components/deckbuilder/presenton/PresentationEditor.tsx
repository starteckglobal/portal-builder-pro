import { useState, useEffect, useRef, useCallback } from "react";
import type { Deck, Slide } from "@/hooks/useDecks";
import { useUpdateDeck } from "@/hooks/useDecks";
import { P, LAYOUTS, TEMPLATES } from "./theme";
import SlideCanvas from "./SlideCanvas";
import PresentMode from "./PresentMode";
import { exportPPTX, exportPDF } from "../DeckExport";
import { toast } from "sonner";

export default function PresentationEditor({ deck, onBack }: { deck: Deck; onBack: () => void }) {
  const [slides, setSlides] = useState<Slide[]>(deck.slides.length ? deck.slides : [{ id: "s1", title: "New slide", bullets: ["Point"], layout: "bullets", notes: "" }]);
  const [idx, setIdx] = useState(0);
  const [template, setTemplate] = useState(deck.theme || "general");
  const [title, setTitle] = useState(deck.title);
  const [notesOpen, setNotesOpen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [saved, setSaved] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const updateDeck = useUpdateDeck();
  const ref = useRef<ReturnType<typeof setTimeout>>();
  const first = useRef(true);

  const patch = useCallback((i: number, p: Partial<Slide>) => {
    setSlides((prev) => prev.map((s, j) => (j === i ? { ...s, ...p } : s)));
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setSaved(false);
    clearTimeout(ref.current);
    ref.current = setTimeout(async () => {
      await updateDeck.mutateAsync({ id: deck.id, slides, theme: template, title });
      setSaved(true);
    }, 2000);
    return () => clearTimeout(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, template, title]);

  const addSlide = () => {
    const ns: Slide = { id: `slide-${Date.now()}`, title: "New slide", bullets: ["Point 1"], layout: "bullets", notes: "" };
    setSlides((prev) => [...prev, ns]);
    setIdx(slides.length);
  };
  const delSlide = (i: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, j) => j !== i));
    setIdx((p) => Math.max(0, Math.min(p, slides.length - 2)));
  };
  const drop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...slides];
    const [m] = next.splice(dragIdx, 1);
    next.splice(i, 0, m);
    setSlides(next);
    setIdx(i);
    setDragIdx(null);
  };

  const cur = slides[idx] || slides[0];

  const btn = (primary?: boolean): React.CSSProperties => ({
    background: primary ? P.primary : "#fff",
    border: primary ? "none" : `1px solid ${P.border}`,
    color: primary ? "#fff" : P.textDim,
    borderRadius: 9,
    padding: "7px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: P.font,
  });

  return (
    <div style={{ background: P.bg, fontFamily: P.font, height: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }}>
      {presenting && <PresentMode slides={slides} templateId={template} start={idx} onExit={() => setPresenting(false)} />}

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", background: "#fff", borderBottom: `1px solid ${P.border}` }}>
        <button onClick={onBack} style={btn()}>← Dashboard</button>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: P.text, fontFamily: P.font, flex: 1, background: "transparent" }} />
        <span style={{ fontSize: 11, color: saved ? P.textMuted : P.primary }}>{saved ? "Saved" : "Saving…"}</span>
        <select value={template} onChange={(e) => setTemplate(e.target.value)} style={{ ...btn(), padding: "7px 10px" }}>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={() => setNotesOpen((o) => !o)} style={btn()}>Notes</button>
        <button onClick={() => setPresenting(true)} style={btn()}>▶ Present</button>
        <button onClick={() => exportPPTX(slides, title, template).catch(() => toast.error("PPTX export failed"))} style={btn(true)}>Export PPTX</button>
        <button onClick={() => exportPDF(slides, title, template).catch(() => toast.error("PDF export failed"))} style={btn()}>Export PDF</button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Thumbnail rail */}
        <div style={{ width: 216, borderRight: `1px solid ${P.border}`, background: "#fff", overflowY: "auto", padding: 12 }}>
          {slides.map((s, i) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => drop(i)}
              onClick={() => setIdx(i)}
              style={{ marginBottom: 10, cursor: "pointer", position: "relative" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10.5, color: idx === i ? P.primary : P.textMuted, fontWeight: 700 }}>{i + 1}. {s.layout}</span>
                <button onClick={(e) => { e.stopPropagation(); delSlide(i); }} style={{ background: "none", border: "none", color: P.textMuted, cursor: "pointer", fontSize: 11 }}>✕</button>
              </div>
              <div style={{ border: `2px solid ${idx === i ? P.primary : P.border}`, borderRadius: 10, overflow: "hidden" }}>
                <SlideCanvas slide={s} templateId={template} width={184} />
              </div>
            </div>
          ))}
          <button onClick={addSlide} style={{ width: "100%", padding: 9, borderRadius: 10, border: `1px dashed ${P.borderStrong}`, background: "transparent", color: P.primary, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: P.font }}>+ Add slide</button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflowY: "auto", padding: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {LAYOUTS.map((l) => (
              <button
                key={l}
                onClick={() => patch(idx, { layout: l })}
                style={{
                  background: cur.layout === l ? P.primarySoft : "#fff",
                  border: `1px solid ${cur.layout === l ? P.primary : P.border}`,
                  color: cur.layout === l ? P.primary : P.textDim,
                  borderRadius: 999, padding: "5px 13px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: P.font,
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={{ boxShadow: P.shadow, borderRadius: 12, border: `1px solid ${P.border}` }}>
            <SlideCanvas slide={cur} templateId={template} width={860} editable index={idx} total={slides.length} onChange={(p) => patch(idx, p)} />
          </div>

          <div style={{ width: 860, background: "#fff", border: `1px solid ${P.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.textDim, marginBottom: 6 }}>BULLETS (one per line)</div>
            <textarea
              value={cur.bullets.join("\n")}
              onChange={(e) => patch(idx, { bullets: e.target.value.split("\n") })}
              style={{ width: "100%", boxSizing: "border-box", minHeight: 80, borderRadius: 10, border: `1px solid ${P.border}`, padding: 10, fontSize: 13, color: P.text, fontFamily: P.font, outline: "none", resize: "vertical" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <input value={cur.title} onChange={(e) => patch(idx, { title: e.target.value })} placeholder="Title" style={{ boxSizing: "border-box", width: "100%", borderRadius: 10, border: `1px solid ${P.border}`, padding: "9px 12px", fontSize: 13, fontFamily: P.font, outline: "none", color: P.text }} />
              <input value={cur.subtitle || ""} onChange={(e) => patch(idx, { subtitle: e.target.value })} placeholder="Subtitle" style={{ boxSizing: "border-box", width: "100%", borderRadius: 10, border: `1px solid ${P.border}`, padding: "9px 12px", fontSize: 13, fontFamily: P.font, outline: "none", color: P.text }} />
            </div>
          </div>
        </div>

        {/* Notes drawer */}
        {notesOpen && (
          <div style={{ width: 300, borderLeft: `1px solid ${P.border}`, background: "#fff", padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: P.text, marginBottom: 8 }}>Speaker notes</div>
            <textarea
              value={cur.notes || ""}
              onChange={(e) => patch(idx, { notes: e.target.value })}
              style={{ width: "100%", boxSizing: "border-box", minHeight: 260, borderRadius: 10, border: `1px solid ${P.border}`, padding: 10, fontSize: 13, color: P.text, fontFamily: P.font, outline: "none", resize: "vertical", lineHeight: 1.6 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
