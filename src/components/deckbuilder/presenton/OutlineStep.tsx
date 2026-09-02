import { useState } from "react";
import type { OutlineItem } from "@/hooks/useDecks";
import { P } from "./theme";
import TemplateGallery from "./TemplateGallery";

interface Props {
  outline: OutlineItem[];
  setOutline: (o: OutlineItem[]) => void;
  template: string;
  setTemplate: (t: string) => void;
  onBack: () => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function OutlineStep({ outline, setOutline, template, setTemplate, onBack, onGenerate, loading }: Props) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const update = (i: number, patch: Partial<OutlineItem>) =>
    setOutline(outline.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const remove = (i: number) => setOutline(outline.filter((_, idx) => idx !== i));
  const add = () => setOutline([...outline, { title: "New slide", description: "" }]);

  const drop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = [...outline];
    const [m] = next.splice(dragIdx, 1);
    next.splice(i, 0, m);
    setOutline(next);
    setDragIdx(null);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: P.text, margin: 0, letterSpacing: "-0.02em" }}>Review the outline</h1>
          <p style={{ color: P.textDim, fontSize: 13, marginTop: 6 }}>Edit titles, reorder by dragging, then pick a template.</p>
        </div>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${P.border}`, borderRadius: 10, color: P.textDim, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: P.font }}>← Back</button>
      </div>

      <div style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 16, padding: 16, boxShadow: P.shadow, marginBottom: 22 }}>
        {outline.map((o, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(i)}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: 12,
              borderRadius: 12,
              border: `1px solid ${dragIdx === i ? P.primary : P.border}`,
              marginBottom: 8,
              background: "#fff",
            }}
          >
            <div style={{ cursor: "grab", color: P.textMuted, fontSize: 16, lineHeight: "24px" }}>⠿</div>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: P.primarySoft, color: P.primary, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <input
                value={o.title}
                onChange={(e) => update(i, { title: e.target.value })}
                style={{ width: "100%", border: "none", outline: "none", fontSize: 14, fontWeight: 700, color: P.text, fontFamily: P.font, background: "transparent" }}
              />
              <input
                value={o.description}
                onChange={(e) => update(i, { description: e.target.value })}
                placeholder="What this slide covers"
                style={{ width: "100%", border: "none", outline: "none", fontSize: 12.5, color: P.textDim, fontFamily: P.font, marginTop: 3, background: "transparent" }}
              />
            </div>
            <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: P.textMuted, cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
        ))}
        <button onClick={add} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px dashed ${P.borderStrong}`, background: "transparent", color: P.primary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: P.font }}>+ Add slide</button>
      </div>

      <TemplateGallery value={template} onChange={setTemplate} />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
        <button
          onClick={onGenerate}
          disabled={loading || outline.length === 0}
          style={{ background: P.primary, border: "none", borderRadius: 12, color: "#fff", padding: "12px 26px", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: P.font }}
        >
          {loading ? "Generating presentation…" : "Generate presentation"}
        </button>
      </div>
    </div>
  );
}
