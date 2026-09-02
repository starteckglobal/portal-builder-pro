import { useState, useEffect, useCallback, useRef } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Slide, Deck } from "@/hooks/useDecks";
import { useUpdateDeck } from "@/hooks/useDecks";
import SlidePreview from "./SlidePreview";
import { exportPPTX, exportPDF } from "./DeckExport";

// Reuse portal theme constants
const C = { bg: "#080808", surface: "#0f0f0f", card: "#161616", cardH: "#1e1e1e", border: "#252525", accent: "#5cb85c", text: "#f0f0f0", textDim: "#999", textMuted: "#555", white: "#fff", blue: "#5b9cf5" };
const F = { display: "'Satoshi',sans-serif", body: "'Satoshi',sans-serif" };

function SortableSlideCard({ slide, index, selected, onSelect, onUpdate, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={{ ...style, background: selected ? C.accent + "15" : C.card, border: `1px solid ${selected ? C.accent : C.border}`, borderRadius: 8, padding: 10, cursor: "pointer", marginBottom: 6 }} onClick={() => onSelect(index)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div {...attributes} {...listeners} style={{ cursor: "grab", color: C.textMuted, fontSize: 14, padding: "0 4px" }}>⠿</div>
        <span style={{ fontSize: 9, color: C.textDim }}>#{index + 1} · {slide.layout}</span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(index); }} style={{ background: "none", border: "none", color: "#e85d4a", cursor: "pointer", fontSize: 12 }}>✕</button>
      </div>
      <input value={slide.title} onChange={(e) => onUpdate(index, "title", e.target.value)} onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", background: "transparent", border: "none", color: C.text, fontSize: 11, fontWeight: 600, fontFamily: F.body, outline: "none", padding: 0, boxSizing: "border-box" }} />
      <div style={{ fontSize: 9, color: C.textMuted, marginTop: 2 }}>{slide.bullets.length} bullet{slide.bullets.length !== 1 ? "s" : ""}</div>
    </div>
  );
}

const THEMES = ["dark", "light", "navy", "charcoal"];

export default function SlideEditor({ deck, onBack }: { deck: Deck; onBack: () => void }) {
  const [slides, setSlides] = useState<Slide[]>(deck.slides);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [theme, setTheme] = useState(deck.theme || "dark");
  const [title, setTitle] = useState(deck.title);
  const updateDeck = useUpdateDeck();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Auto-save with 2s debounce
  const save = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateDeck.mutate({ id: deck.id, slides, theme, title });
    }, 2000);
  }, [slides, theme, title, deck.id]);

  useEffect(() => { save(); return () => clearTimeout(debounceRef.current); }, [slides, theme, title]);

  const updateSlide = (idx: number, field: string, value: any) => {
    setSlides((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addSlide = () => {
    const ns: Slide = { id: `slide-${Date.now()}`, title: "New Slide", bullets: ["Point 1"], layout: "bullets", notes: "" };
    setSlides((prev) => [...prev, ns]);
    setSelectedIdx(slides.length);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== idx));
    if (selectedIdx >= slides.length - 1) setSelectedIdx(Math.max(0, slides.length - 2));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIdx = slides.findIndex((s) => s.id === active.id);
      const newIdx = slides.findIndex((s) => s.id === over.id);
      setSlides(arrayMove(slides, oldIdx, newIdx));
      setSelectedIdx(newIdx);
    }
  };

  const selected = slides[selectedIdx] || slides[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontFamily: F.body }}>← Back</button>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ background: "transparent", border: "none", color: C.white, fontSize: 16, fontWeight: 700, fontFamily: F.display, outline: "none", flex: 1 }} />
        <div style={{ display: "flex", gap: 4 }}>
          {THEMES.map((th) => (
            <button key={th} onClick={() => setTheme(th)} style={{ width: 22, height: 22, borderRadius: 4, border: theme === th ? `2px solid ${C.accent}` : `1px solid ${C.border}`, cursor: "pointer", fontSize: 8, fontFamily: F.body, color: C.textDim,
              background: th === "dark" ? "#1a1a2e" : th === "light" ? "#ffffff" : th === "navy" ? "#0a1628" : "#2d2d2d" }} title={th} />
          ))}
        </div>
        <button onClick={() => exportPPTX(slides, title, theme)} style={{ background: C.accent, border: "none", borderRadius: 6, color: "#000", padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: F.body }}>⬇ PPTX</button>
        <button onClick={exportPDF} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontFamily: F.body }}>⬇ PDF</button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: slide list */}
        <div style={{ width: 240, borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: 10, background: C.bg }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {slides.map((s, i) => (
                <SortableSlideCard key={s.id} slide={s} index={i} selected={selectedIdx === i} onSelect={setSelectedIdx} onUpdate={updateSlide} onDelete={deleteSlide} />
              ))}
            </SortableContext>
          </DndContext>
          <button onClick={addSlide} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px dashed ${C.border}`, background: "transparent", color: C.accent, cursor: "pointer", fontSize: 11, fontFamily: F.body, marginTop: 4 }}>+ Add Slide</button>
        </div>

        {/* Right: preview + edit */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <SlidePreview slide={selected} theme={theme} scale={1} />

          {/* Inline editor */}
          <div style={{ width: 640, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const }}>Title</label>
                <input value={selected.title} onChange={(e) => updateSlide(selectedIdx, "title", e.target.value)} style={{ width: "100%", background: "#0c0c0c", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 12, fontFamily: F.body, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const }}>Layout</label>
                <select value={selected.layout} onChange={(e) => updateSlide(selectedIdx, "layout", e.target.value)} style={{ width: "100%", background: "#0c0c0c", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 12, fontFamily: F.body }}>
                  {["title", "bullets", "two-column", "image-text", "closing"].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const }}>Subtitle</label>
              <input value={selected.subtitle || ""} onChange={(e) => updateSlide(selectedIdx, "subtitle", e.target.value)} style={{ width: "100%", background: "#0c0c0c", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 12, fontFamily: F.body, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const }}>Bullets (one per line)</label>
              <textarea value={selected.bullets.join("\n")} onChange={(e) => updateSlide(selectedIdx, "bullets", e.target.value.split("\n"))}
                style={{ width: "100%", background: "#0c0c0c", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 12, fontFamily: F.body, outline: "none", resize: "vertical", minHeight: 60, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase" as const }}>Speaker Notes</label>
              <textarea value={selected.notes} onChange={(e) => updateSlide(selectedIdx, "notes", e.target.value)}
                style={{ width: "100%", background: "#0c0c0c", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, fontSize: 12, fontFamily: F.body, outline: "none", resize: "vertical", minHeight: 40, boxSizing: "border-box" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
