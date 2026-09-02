import { useState, useEffect, useRef, useCallback } from "react";
import type { Deck, Slide, SlideElement, SlideElementType } from "@/hooks/useDecks";
import { useUpdateDeck } from "@/hooks/useDecks";
import { P, LAYOUTS, TEMPLATES } from "./theme";
import SlideCanvas from "./SlideCanvas";
import PresentMode from "./PresentMode";
import { exportPPTX, exportPDF } from "../DeckExport";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Blocks, Image, LayoutTemplate, MessageSquareShare, Redo2, Shapes, Table2, TextCursorInput, Undo2 } from "lucide-react";

type EditorPanel = "ai" | "blocks" | "texts" | "charts" | "infographics" | "tables" | "images" | "elements";

export default function PresentationEditor({ deck, onBack }: { deck: Deck; onBack: () => void }) {
  const [slides, setSlides] = useState<Slide[]>(deck.slides.length ? deck.slides : [{ id: "s1", title: "New slide", bullets: ["Point"], layout: "bullets", notes: "" }]);
  const [idx, setIdx] = useState(0);
  const [template, setTemplate] = useState(deck.theme || "general");
  const [title, setTitle] = useState(deck.title);
  const [notesOpen, setNotesOpen] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [saved, setSaved] = useState(true);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [panel, setPanel] = useState<EditorPanel | null>(null);
  const [chat, setChat] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [history, setHistory] = useState<Slide[][]>([]);
  const [redo, setRedo] = useState<Slide[][]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const updateDeck = useUpdateDeck();
  const ref = useRef<ReturnType<typeof setTimeout>>();
  const first = useRef(true);

  const patch = useCallback((i: number, p: Partial<Slide>) => {
    setSlides((prev) => {
      setHistory((h) => [...h.slice(-29), prev]);
      setRedo([]);
      return prev.map((s, j) => (j === i ? { ...s, ...p } : s));
    });
  }, []);

  const undo = () => setHistory((h) => { const prev = h[h.length - 1]; if (!prev) return h; setRedo((r) => [slides, ...r]); setSlides(prev); return h.slice(0, -1); });
  const redoChange = () => setRedo((r) => { const next = r[0]; if (!next) return r; setHistory((h) => [...h, slides]); setSlides(next); return r.slice(1); });

  const addElement = (type: SlideElementType, variant?: string) => {
    const defaults: Record<SlideElementType, Partial<SlideElement>> = {
      text: { text: "Add your text", width: 430, height: 90 }, chart: { width: 430, height: 250 }, table: { width: 500, height: 220, rows: [["Category", "Value"], ["Item A", "72"], ["Item B", "48"]] },
      image: { width: 440, height: 280 }, shape: { width: 180, height: 120 }, infographic: { width: 520, height: 180 },
    };
    patch(idx, { elements: [...(cur.elements || []), { id: `el-${Date.now()}`, type, variant, x: 650, y: 360, width: 300, height: 160, ...defaults[type] }] });
  };

  const askAI = async () => {
    if (!chat.trim()) return;
    setChatBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-deck", { body: { mode: "edit", instruction: chat, slide: cur } });
      if (error || data?.error) throw error || new Error(data.error);
      patch(idx, data.slide || {});
      setChat("");
      toast.success("Slide updated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "AI edit failed"); }
    setChatBusy(false);
  };

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
  const selectedElement = cur.elements?.find((el) => el.id === selectedElementId);

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
        <button onClick={onBack} style={btn()}>← Presentations</button>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ border: "none", outline: "none", fontSize: 15, fontWeight: 700, color: P.text, fontFamily: P.font, flex: 1, background: "transparent" }} />
        <span style={{ fontSize: 11, color: saved ? P.textMuted : P.primary }}>{saved ? "Saved" : "Saving…"}</span>
        <button title="Undo" onClick={undo} disabled={!history.length} style={btn()}><Undo2 size={14} /></button>
        <button title="Redo" onClick={redoChange} disabled={!redo.length} style={btn()}><Redo2 size={14} /></button>
        <select value={template} onChange={(e) => setTemplate(e.target.value)} style={{ ...btn(), padding: "7px 10px" }}>
          {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={() => setNotesOpen((o) => !o)} style={btn()}>Notes</button>
        <button onClick={() => setPresenting(true)} style={btn()}>▶ Present</button>
        <button onClick={() => exportPPTX(slides, title, template).catch(() => toast.error("PPTX export failed"))} style={btn(true)}>Export PPTX</button>
        <button onClick={() => exportPDF(slides, title, template).catch(() => toast.error("PDF export failed"))} style={btn()}>Export PDF</button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 68, background: "#fff", borderRight: `1px solid ${P.border}`, padding: "10px 6px", display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            ["ai", MessageSquareShare, "AI"], ["blocks", Blocks, "Blocks"], ["texts", TextCursorInput, "Text"], ["charts", BarChart3, "Charts"], ["infographics", LayoutTemplate, "Info"], ["tables", Table2, "Tables"], ["images", Image, "Images"], ["elements", Shapes, "Elements"],
          ].map(([id, Icon, label]) => <button key={String(id)} onClick={() => setPanel(panel === id ? null : id as typeof panel)} style={{ border: "none", borderRadius: 8, padding: "8px 2px", background: panel === id ? P.primarySoft : "transparent", color: panel === id ? P.primary : P.textDim, fontSize: 9.5, display: "grid", placeItems: "center", gap: 3, cursor: "pointer" }}><Icon size={17} />{String(label)}</button>)}
        </div>
        {panel && <div style={{ width: 260, background: "#fff", borderRight: `1px solid ${P.border}`, padding: 14, overflowY: "auto" }}>
          <div style={{ fontWeight: 800, fontSize: 14, textTransform: "capitalize", marginBottom: 12 }}>{panel}</div>
          {panel === "ai" ? <><textarea value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Ask AI to rewrite, summarize, add data, or change this slide…" style={{ width: "100%", minHeight: 130, boxSizing: "border-box", border: `1px solid ${P.border}`, borderRadius: 9, padding: 10, fontFamily: P.font, resize: "vertical" }} /><button onClick={askAI} disabled={chatBusy} style={{ ...btn(true), width: "100%", marginTop: 8 }}>{chatBusy ? "Applying…" : "Apply to slide"}</button></> : panel === "blocks" ? <div style={{ display: "grid", gap: 7 }}>{getLayoutOptions(template).map((l) => <button key={l.id} onClick={() => patch(idx, { layoutId: l.id, layout: l.kind })} style={{ ...btn(), textAlign: "left" }}><strong>{l.id.replace(/_/g, " ")}</strong><span style={{ display: "block", fontSize: 10, marginTop: 3 }}>{l.description}</span></button>)}</div> : <InsertOptions panel={panel} add={addElement} />}
        </div>}
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
            <SlideCanvas slide={cur} templateId={template} width={860} editable index={idx} total={slides.length} onChange={(p) => patch(idx, p)} onElementSelect={setSelectedElementId} selectedElementId={selectedElementId} />
          </div>

          {selectedElement && <ElementInspector element={selectedElement} onChange={(next) => patch(idx, { elements: (cur.elements || []).map((el) => el.id === selectedElementId ? { ...el, ...next } : el) })} onDelete={() => { patch(idx, { elements: (cur.elements || []).filter((el) => el.id !== selectedElementId) }); setSelectedElementId(null); }} />}

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

function ElementInspector({ element, onChange, onDelete }: { element: SlideElement; onChange: (patch: Partial<SlideElement>) => void; onDelete: () => void }) {
  return <div style={{ width: 860, background: "#fff", border: `1px solid ${P.border}`, borderRadius: 14, padding: 14, display: "flex", alignItems: "end", gap: 10 }}><strong style={{ fontSize: 12, alignSelf: "center", textTransform: "capitalize" }}>{element.type}</strong>{(["x", "y", "width", "height"] as const).map((field) => <label key={field} style={{ fontSize: 10, color: P.textMuted }}>{field.toUpperCase()}<input type="number" value={element[field]} onChange={(e) => onChange({ [field]: Number(e.target.value) })} style={{ display: "block", width: 72, marginTop: 3, border: `1px solid ${P.border}`, borderRadius: 7, padding: 6, fontFamily: P.font }} /></label>)}<label style={{ fontSize: 10, color: P.textMuted }}>COLOR<input type="color" value={element.color || "#625df5"} onChange={(e) => onChange({ color: e.target.value })} style={{ display: "block", width: 44, height: 31, marginTop: 3 }} /></label><button onClick={onDelete} style={{ border: `1px solid #fecaca`, color: "#dc2626", background: "#fff", borderRadius: 8, padding: "8px 12px", marginLeft: "auto", cursor: "pointer" }}>Delete</button></div>;
}

const getLayoutOptions = (templateId: string) => TEMPLATES.find((t) => t.id === templateId)?.layouts || [];

function InsertOptions({ panel, add }: { panel: Exclude<EditorPanel, "ai" | "blocks">; add: (type: SlideElementType, variant?: string) => void }) {
  const options: Record<string, Array<[string, SlideElementType, string?]>> = {
    texts: [["Heading", "text", "heading"], ["Body text", "text", "body"], ["Quote", "text", "quote"]],
    charts: [["Bar chart", "chart", "bar"], ["Line chart", "chart", "line"], ["Pie chart", "chart", "pie"], ["Radar chart", "chart", "radar"]],
    infographics: [["Timeline", "infographic", "timeline"], ["Process", "infographic", "process"], ["Funnel", "infographic", "funnel"], ["Roadmap", "infographic", "roadmap"]],
    tables: [["Table", "table"]], images: [["Upload image", "image"]], elements: [["Rectangle", "shape", "rectangle"], ["Circle", "shape", "circle"], ["Arrow", "shape", "arrow"]],
  };
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{(options[panel] || []).map(([name, type, variant]) => <button key={name} onClick={() => add(type, variant)} style={{ border: `1px solid ${P.border}`, borderRadius: 8, background: P.bg, minHeight: 72, color: P.textDim, fontFamily: P.font, cursor: "pointer", fontSize: 11 }}>{name}</button>)}</div>;
}
