import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDecks, useCreateDeck, useDeleteDeck, type Deck, type Slide, type OutlineItem } from "@/hooks/useDecks";
import { P } from "./theme";
import SlideCanvas from "./SlideCanvas";
import CreateStep, { type CreateConfig } from "./CreateStep";
import OutlineStep from "./OutlineStep";
import PresentationEditor from "./PresentationEditor";
import TemplateGallery from "./TemplateGallery";
import { useNavigate } from "react-router-dom";

type Step = "dashboard" | "create" | "outline" | "editor";

export default function PresentonApp() {
  const navigate = useNavigate();
  const { data: decks = [], isLoading } = useDecks();
  const createDeck = useCreateDeck();
  const deleteDeck = useDeleteDeck();
  const [step, setStep] = useState<Step>("dashboard");
  const [config, setConfig] = useState<CreateConfig | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [template, setTemplate] = useState("general");
  const [loading, setLoading] = useState(false);
  const [openDeck, setOpenDeck] = useState<Deck | null>(null);
  const [dashboardView, setDashboardView] = useState<"presentations" | "templates">("presentations");

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
      const data = await call({ mode: "outline", topic: c.topic, businessName: c.businessName, tone: c.tone.toLowerCase(), language: c.language, slideCount: c.autoSlides ? 8 : c.slideCount, verbosity: c.verbosity, instructions: c.instructions, includeTitleSlide: c.includeTitleSlide, includeTableOfContents: c.includeTableOfContents, webSearch: c.webSearch, sourceFile: c.sourceFile });
      setOutline(data.outline || []);
      if (c.generationMode === "smart") {
        const generated = await call({ mode: "slides", topic: c.topic, businessName: c.businessName, tone: c.tone.toLowerCase(), language: c.language, slideCount: c.autoSlides ? 8 : c.slideCount, outline: data.outline || [], verbosity: c.verbosity, instructions: c.instructions, includeTitleSlide: c.includeTitleSlide, includeTableOfContents: c.includeTableOfContents });
        const slides: Slide[] = generated.slides || [];
        const deck = await createDeck.mutateAsync({ title: c.title, business_name: c.businessName, topic: c.topic, tone: c.tone.toLowerCase(), slides, theme: template });
        setOpenDeck({ ...(deck as unknown as Deck), slides });
        setStep("editor");
      } else setStep("outline");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to draft outline");
    }
    setLoading(false);
  };

  const generate = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const data = await call({ mode: "slides", topic: config.topic, businessName: config.businessName, tone: config.tone.toLowerCase(), language: config.language, slideCount: outline.length, outline, verbosity: config.verbosity, instructions: config.instructions, includeTitleSlide: config.includeTitleSlide, includeTableOfContents: config.includeTableOfContents });
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
          <button onClick={() => navigate("/")} style={{ border: "none", background: "none", color: P.textMuted, padding: 0, marginBottom: 12, cursor: "pointer", fontFamily: P.font }}>← ABM PR Portal</button>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{dashboardView === "presentations" ? "Presentations" : "Templates"}</h1>
        </div>
        <button onClick={() => setStep("create")} style={{ background: P.primary, border: "none", borderRadius: 11, color: "#fff", padding: "11px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: P.font }}>+ New presentation</button>
      </div>

      <div style={{ display: "flex", gap: 22, borderBottom: `1px solid ${P.border}`, marginBottom: 22 }}>
        {(["presentations", "templates"] as const).map((view) => <button key={view} onClick={() => setDashboardView(view)} style={{ border: "none", borderBottom: `2px solid ${dashboardView === view ? P.primary : "transparent"}`, background: "none", color: dashboardView === view ? P.text : P.textMuted, padding: "0 0 10px", fontFamily: P.font, fontWeight: 700, textTransform: "capitalize", cursor: "pointer" }}>{view}</button>)}
      </div>

      {dashboardView === "templates" ? <div><TemplateGallery value={template} onChange={setTemplate} /><div style={{ marginTop: 18, border: `1px dashed ${P.borderStrong}`, padding: 22, borderRadius: 12 }}><div style={{ fontWeight: 750 }}>Create a custom template</div><div style={{ color: P.textDim, fontSize: 12, marginTop: 5 }}>Upload a PPTX to review its slides, map fonts, and save reusable layouts.</div><button onClick={() => toast.info("Custom template processing is available after the database update applies")} style={{ marginTop: 12, background: P.panel, border: `1px solid ${P.border}`, borderRadius: 8, padding: "8px 13px", color: P.text, fontFamily: P.font, cursor: "pointer" }}>Upload PPTX</button></div></div> : isLoading ? (
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
