import type { Slide } from "@/hooks/useDecks";
import { getTemplate } from "./theme";

interface Props {
  slide: Slide;
  templateId?: string | null;
  width?: number;
  editable?: boolean;
  index?: number;
  total?: number;
  onChange?: (patch: Partial<Slide>) => void;
}

/** Renders one slide at 1280x720 and scales it down to `width`. */
export default function SlideCanvas({ slide, templateId, width = 880, editable, index, total, onChange }: Props) {
  const t = getTemplate(templateId);
  const scale = width / 1280;

  const editProps = (field: "title" | "subtitle") => ({
    contentEditable: !!editable,
    suppressContentEditableWarning: true,
    onBlur: (e: React.FocusEvent<HTMLElement>) =>
      onChange?.({ [field]: e.currentTarget.textContent || "" } as Partial<Slide>),
  });

  const ul = (items: string[], size = 26, offset = 0) => (
    <ul style={{ margin: 0, paddingLeft: 26, listStyle: "none" }}>
      {items.map((b, i) => (
        <li key={i} style={{ position: "relative", marginBottom: size * 0.6 }}>
          <span style={{ position: "absolute", left: -24, top: size * 0.5, width: 9, height: 9, borderRadius: 9, background: t.accent }} />
          <span
            contentEditable={!!editable}
            suppressContentEditableWarning
            style={{ outline: "none", fontSize: size, lineHeight: 1.45, color: t.text, display: "block" }}
            onBlur={(e) => {
              const next = [...slide.bullets];
              next[i + offset] = e.currentTarget.textContent || "";
              onChange?.({ bullets: next });
            }}
          >
            {b}
          </span>
        </li>
      ))}
    </ul>
  );

  const heading = (size: number, align: "left" | "center" = "left"): React.CSSProperties => ({
    fontSize: size,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.12,
    fontFamily: t.titleFont,
    color: t.text,
    textAlign: align,
    outline: "none",
  });

  let body: React.ReactNode;

  if (slide.layout === "title" || slide.layout === "closing") {
    body = (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 100px" }}>
        <div style={{ width: 64, height: 5, borderRadius: 4, background: t.accent, marginBottom: 34 }} />
        <div {...editProps("title")} style={heading(62, "center")}>{slide.title}</div>
        {(slide.subtitle || editable) && (
          <div {...editProps("subtitle")} style={{ marginTop: 26, fontSize: 28, color: t.dim, outline: "none" }}>
            {slide.subtitle || "Subtitle"}
          </div>
        )}
        {slide.layout === "closing" && slide.bullets[0] && (
          <div style={{ marginTop: 40, fontSize: 24, color: t.accent, fontWeight: 600 }}>{slide.bullets[0]}</div>
        )}
      </div>
    );
  } else if (slide.layout === "two-column") {
    const mid = Math.ceil(slide.bullets.length / 2);
    body = (
      <>
        <div {...editProps("title")} style={heading(44)}>{slide.title}</div>
        <div style={{ width: 56, height: 4, background: t.accent, margin: "22px 0 40px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
          {ul(slide.bullets.slice(0, mid), 24)}
          {ul(slide.bullets.slice(mid), 24, mid)}
        </div>
      </>
    );
  } else if (slide.layout === "image-text") {
    body = (
      <>
        <div {...editProps("title")} style={heading(44)}>{slide.title}</div>
        <div style={{ width: 56, height: 4, background: t.accent, margin: "22px 0 36px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 50, alignItems: "center" }}>
          {ul(slide.bullets, 24)}
          <div style={{ background: t.panel, borderRadius: 18, height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: t.dim, fontSize: 20, textAlign: "center", padding: 24 }}>
            {slide.subtitle || "Visual"}
          </div>
        </div>
      </>
    );
  } else if (slide.layout === "stats") {
    body = (
      <>
        <div {...editProps("title")} style={heading(44)}>{slide.title}</div>
        <div style={{ width: 56, height: 4, background: t.accent, margin: "22px 0 44px" }} />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, slide.bullets.length))},1fr)`, gap: 26 }}>
          {slide.bullets.slice(0, 3).map((b, i) => {
            const m = b.split(/\s*[—–:-]\s*/);
            return (
              <div key={i} style={{ background: t.panel, borderRadius: 18, padding: 30, minHeight: 190 }}>
                <div style={{ fontSize: 44, fontWeight: 800, color: t.accent, fontFamily: t.titleFont }}>{m[0]}</div>
                <div style={{ marginTop: 14, fontSize: 20, color: t.dim, lineHeight: 1.4 }}>{m.slice(1).join(" ")}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  } else if (slide.layout === "quote") {
    body = (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 50px" }}>
        <div style={{ fontSize: 120, lineHeight: 0.7, color: t.accent, fontFamily: t.titleFont }}>&ldquo;</div>
        <div {...editProps("title")} style={{ ...heading(40), marginTop: 18, fontWeight: 600 }}>{slide.title}</div>
        <div style={{ marginTop: 28, fontSize: 22, color: t.dim }}>{slide.subtitle || slide.bullets[0] || ""}</div>
      </div>
    );
  } else {
    body = (
      <>
        <div {...editProps("title")} style={heading(44)}>{slide.title}</div>
        {slide.subtitle && <div style={{ marginTop: 14, fontSize: 24, color: t.dim }}>{slide.subtitle}</div>}
        <div style={{ width: 56, height: 4, background: t.accent, margin: "22px 0 38px" }} />
        {ul(slide.bullets, 26)}
      </>
    );
  }

  return (
    <div style={{ width, height: width * (720 / 1280), position: "relative", overflow: "hidden", borderRadius: 12, background: t.bg }}>
      <div
        style={{
          width: 1280,
          height: 720,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          background: t.bg,
          color: t.text,
          fontFamily: t.bodyFont,
          padding: "70px 82px",
          boxSizing: "border-box",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {body}
        {typeof index === "number" && (
          <div style={{ position: "absolute", right: 44, bottom: 30, fontSize: 16, color: t.dim }}>
            {index + 1}{total ? ` / ${total}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}
