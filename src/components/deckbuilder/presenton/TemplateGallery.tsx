import { P, TEMPLATES } from "./theme";
import SlideCanvas from "./SlideCanvas";
import type { Slide } from "@/hooks/useDecks";
import { HighlightPanel } from "@/components/ui/highlight-card";


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
             <HighlightPanel
               key={t.id}
               variant="feature"
               onClick={() => onChange(t.id)}
               className="cursor-pointer"
               innerClassName="p-2"
               style={{ border: `2px solid ${active ? P.primary : P.border}`, background: P.panel }}
             >
               <div style={{ overflow: "hidden", borderRadius: 9, border: `1px solid ${P.border}` }}>
                 <SlideCanvas slide={demo} templateId={t.id} width={190} />
               </div>
               <div style={{ fontSize: 12, fontWeight: 700, color: active ? P.primary : P.textDim, marginTop: 8 }}>{t.name}</div>
             </HighlightPanel>
           );
        })}
      </div>
    </div>
  );
}
