import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDecks, useCreateDeck, useDeleteDeck, type Deck, type Slide, type OutlineItem } from "@/hooks/useDecks";
import { P } from "./theme";
import SlideCanvas from "./SlideCanvas";
import CreateStep, { type CreateConfig } from "./CreateStep";
import OutlineStep from "./OutlineStep";
import PresentationEditor from "./PresentationEditor";

type Step = "dashboard" | "create" | "outline" | "editor";

export default function PresentonApp() {
  const { data: decks = [], isLoading } = useDecks();
  const createDeck = useCreateDeck();
  const deleteDeck = useDeleteDeck();
  const [step, setStep] = useState<Step>("dashboard");
  const [config, setConfig] = useState<CreateConfig | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [template, setTemplate] = useState("general");
  const [loading, setLoading] = useState(false);
  const [openDeck, setOpenDeck] = useState<Deck | null>(null);

  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("generate-deck", { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const draftOutline = async (c: CreateConfig) => {
    setConfig(c);
    setLoading(true);
    try {
      const data = await call({ mode: "outline", topic: c.topic, businessName: c.businessName, tone: c.tone.toLowerCase(), language: c.language, slideCount: c.slideCount });
      setOutline(data.outline || []);
      setStep("outline");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to draft outline");
    }
    setLoading(false);
  };

  const generate = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const data = await call({ mode: "slides", topic: config.topic, businessName: config.businessName, tone: config.tone.toLowerCase(), language: config.language, slideCount: outline.length, outline });
      const slides: Slide[] = data.slides || [];
      const deck = await createDeck.mutateAsync({ title: config.title, business_name: config.businessName, topic: config.topic, tone: config.tone.toLowerCase(), slides, theme: template });
      setOpenDeck({ ...(deck as unknown as Deck), slides });
      setStep("editor");
      toast.success("Presentation generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    }
    setLoading(false);
  };

  const duplicate = async (d: Deck) => {
    await createDeck.mutateAsync({ title: `${d.title} (copy)`, business_name: d.business_name || undefined, topic: d.topic || undefined, tone: d.tone || undefined, slides: d.slides, theme: d.theme || "general" });
    toast.success("Duplicated");
  };

  if (step === "editor" && openDeck) {
    return <PresentationEditor deck={openDeck} onBack={() => { setOpenDeck(null); setStep("dashboard"); }} />;
  }

  const shell = (children: React.ReactNode) => (
    <div style={{ background: P.bg, minHeight: "calc(100vh - 60px)", fontFamily: P.font, color: P.text }}>{children}</div>
  );

  if (step === "create") return shell(<CreateStep onNext={draftOutline} onCancel={() => setStep("dashboard")} loading={loading} />);
  if (step === "outline")
    return shell(
      <OutlineStep outline={outline} setOutline={setOutline} template={template} setTemplate={setTemplate} onBack={() => setStep("create")} onGenerate={generate} loading={loading} />
    );

  return shell(
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Presentations</h1>
          <p style={{ fontSize: 13, color: P.textDim, marginTop: 6 }}>Generate, edit, present and export AI decks.</p>
        </div>
        <button onClick={() => setStep("create")} style={{ background: P.primary, border: "none", borderRadius: 11, color: "#fff", padding: "11px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: P.font }}>+ New presentation</button>
      </div>

      {isLoading ? (
        <div style={{ color: P.textDim, textAlign: "center", padding: 60, fontSize: 14 }}>Loading…</div>
      ) : decks.length === 0 ? (
        <div style={{ background: P.panel, border: `1px dashed ${P.borderStrong}`, borderRadius: 18, padding: 70, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>No presentations yet</div>
          <div style={{ fontSize: 13, color: P.textDim, marginTop: 8 }}>Start from a prompt and Presenton drafts the outline and slides.</div>
          <button onClick={() => setStep("create")} style={{ marginTop: 20, background: P.primary, border: "none", borderRadius: 11, color: "#fff", padding: "11px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: P.font }}>Create your first deck</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
          {decks.map((d) => (
            <div key={d.id} style={{ background: P.panel, border: `1px solid ${P.border}`, borderRadius: 16, overflow: "hidden", boxShadow: P.shadow }}>
              <div
                onClick={() => { setOpenDeck(d); setStep("editor"); }}
                style={{ cursor: "pointer", borderBottom: `1px solid ${P.border}`, background: "#f0f0f6", display: "flex", justifyContent: "center" }}
              >
                {d.slides[0] ? (
                  <SlideCanvas slide={d.slides[0]} templateId={d.theme} width={300} />
                ) : (
                  <div style={{ height: 168, display: "flex", alignItems: "center", color: P.textMuted, fontSize: 12 }}>Empty deck</div>
                )}
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>{d.title}</div>
                <div style={{ fontSize: 11.5, color: P.textMuted, marginTop: 4 }}>
                  {d.business_name ? `${d.business_name} · ` : ""}{d.slides.length} slides · {new Date(d.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                  <button onClick={() => { setOpenDeck(d); setStep("editor"); }} style={{ background: P.primarySoft, border: "none", borderRadius: 8, color: P.primary, padding: "6px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: P.font }}>Open</button>
                  <button onClick={() => duplicate(d)} style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 8, color: P.textDim, padding: "6px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: P.font }}>Duplicate</button>
                  <button
                    onClick={async () => { if (confirm("Delete this presentation?")) { await deleteDeck.mutateAsync(d.id); toast.success("Deleted"); } }}
                    style={{ background: "#fff", border: `1px solid ${P.border}`, borderRadius: 8, color: P.danger, padding: "6px 12px", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: P.font }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
