import type { Slide } from "@/hooks/useDecks";

const THEMES: Record<string, { bg: string; text: string; accent: string; sub: string; bullet: string }> = {
  dark: { bg: "#1a1a2e", text: "#ffffff", accent: "#5cb85c", sub: "#cccccc", bullet: "#aaaaaa" },
  light: { bg: "#ffffff", text: "#1a1a2e", accent: "#2563eb", sub: "#555555", bullet: "#333333" },
  navy: { bg: "#0a1628", text: "#e8e8e8", accent: "#f0a050", sub: "#a0a0b0", bullet: "#c0c0d0" },
  charcoal: { bg: "#2d2d2d", text: "#e0e0e0", accent: "#2dd4bf", sub: "#999999", bullet: "#bbbbbb" },
};

export default function SlidePreview({ slide, theme = "dark", scale = 1 }: { slide: Slide; theme?: string; scale?: number }) {
  const t = THEMES[theme] || THEMES.dark;
  const w = 640 * scale;
  const h = 360 * scale;
  const fs = (n: number) => n * scale;

  const renderTitle = () => (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", textAlign: "center", padding: fs(40) }}>
      <div style={{ fontSize: fs(28), fontWeight: 800, color: t.text, lineHeight: 1.2, marginBottom: fs(10) }}>{slide.title}</div>
      {slide.subtitle && <div style={{ fontSize: fs(14), color: t.sub }}>{slide.subtitle}</div>}
    </div>
  );

  const renderBullets = () => (
    <div style={{ padding: fs(30), height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: fs(20), fontWeight: 700, color: t.text, marginBottom: fs(16), borderBottom: `2px solid ${t.accent}`, paddingBottom: fs(8) }}>{slide.title}</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: fs(8) }}>
        {slide.bullets.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: fs(8), alignItems: "flex-start" }}>
            <span style={{ color: t.accent, fontSize: fs(14), marginTop: fs(2) }}>●</span>
            <span style={{ fontSize: fs(13), color: t.bullet, lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTwoColumn = () => {
    const mid = Math.ceil(slide.bullets.length / 2);
    return (
      <div style={{ padding: fs(30), height: "100%" }}>
        <div style={{ fontSize: fs(20), fontWeight: 700, color: t.text, marginBottom: fs(16), borderBottom: `2px solid ${t.accent}`, paddingBottom: fs(8) }}>{slide.title}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: fs(20) }}>
          {[slide.bullets.slice(0, mid), slide.bullets.slice(mid)].map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: fs(6) }}>
              {col.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: fs(6), alignItems: "flex-start" }}>
                  <span style={{ color: t.accent, fontSize: fs(12), marginTop: fs(2) }}>▸</span>
                  <span style={{ fontSize: fs(12), color: t.bullet, lineHeight: 1.4 }}>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImageText = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%" }}>
      <div style={{ background: t.accent + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: fs(80), height: fs(80), borderRadius: fs(12), background: t.accent + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs(32), color: t.accent }}>◇</div>
      </div>
      <div style={{ padding: fs(24), display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: fs(18), fontWeight: 700, color: t.text, marginBottom: fs(12) }}>{slide.title}</div>
        {slide.bullets.map((b, i) => (
          <div key={i} style={{ fontSize: fs(11), color: t.bullet, lineHeight: 1.6, marginBottom: fs(4) }}>• {b}</div>
        ))}
      </div>
    </div>
  );

  const renderClosing = () => (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", textAlign: "center", padding: fs(40) }}>
      <div style={{ fontSize: fs(26), fontWeight: 800, color: t.text, marginBottom: fs(8) }}>{slide.title}</div>
      {slide.subtitle && <div style={{ fontSize: fs(14), color: t.sub, marginBottom: fs(16) }}>{slide.subtitle}</div>}
      {slide.bullets.length > 0 && <div style={{ fontSize: fs(12), color: t.accent }}>{slide.bullets[0]}</div>}
    </div>
  );

  const renderers: Record<string, () => JSX.Element> = { title: renderTitle, bullets: renderBullets, "two-column": renderTwoColumn, "image-text": renderImageText, closing: renderClosing };

  return (
    <div style={{ width: w, height: h, background: t.bg, borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.4)", flexShrink: 0 }}>
      {(renderers[slide.layout] || renderBullets)()}
    </div>
  );
}
