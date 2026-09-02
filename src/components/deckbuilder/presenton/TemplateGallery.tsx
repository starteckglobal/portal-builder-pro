import { P, TEMPLATES } from "./theme";
import SlideCanvas from "./SlideCanvas";
import type { Slide } from "@/hooks/useDecks";

const demo: Slide = {
  id: "demo",
  title: "Presentation title",
  subtitle: "A short supporting line",
  bullets: ["Key point"],
  layout: "title",
  notes: "",
};

export default function TemplateGallery({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: P.text, marginBottom: 10 }}>Template</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
        {TEMPLATES.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              style={{
                padding: 8,
                borderRadius: 14,
                border: `2px solid ${active ? P.primary : P.border}`,
                background: P.panel,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: P.font,
              }}
            >
              <div style={{ overflow: "hidden", borderRadius: 9, border: `1px solid ${P.border}` }}>
                <SlideCanvas slide={demo} templateId={t.id} width={190} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: active ? P.primary : P.textDim, marginTop: 8 }}>{t.name}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
