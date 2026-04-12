import type { Slide } from "@/hooks/useDecks";

const THEME_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  dark: { bg: "1a1a2e", text: "ffffff", accent: "5cb85c" },
  light: { bg: "ffffff", text: "1a1a2e", accent: "2563eb" },
  navy: { bg: "0a1628", text: "e8e8e8", accent: "f0a050" },
  charcoal: { bg: "2d2d2d", text: "e0e0e0", accent: "2dd4bf" },
};

export async function exportPPTX(slides: Slide[], title: string, theme: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.title = title;
  const tc = THEME_COLORS[theme] || THEME_COLORS.dark;

  slides.forEach((s) => {
    const sl = pptx.addSlide();
    sl.background = { color: tc.bg };

    if (s.layout === "title" || s.layout === "closing") {
      sl.addText(s.title, { x: 0.5, y: 1.5, w: 9, h: 1.5, fontSize: 36, bold: true, color: tc.text, align: "center" });
      if (s.subtitle) sl.addText(s.subtitle, { x: 1, y: 3, w: 8, h: 0.8, fontSize: 16, color: tc.accent, align: "center" });
      if (s.layout === "closing" && s.bullets.length > 0) sl.addText(s.bullets[0], { x: 1, y: 3.8, w: 8, h: 0.6, fontSize: 14, color: tc.accent, align: "center" });
    } else {
      sl.addText(s.title, { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 24, bold: true, color: tc.text });
      sl.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.05, w: 2, h: 0.04, fill: { color: tc.accent } });
      const bullets = s.bullets.map((b) => ({ text: b, options: { fontSize: 14, color: tc.text, bullet: { type: "bullet" as const, color: tc.accent } } }));
      if (s.layout === "two-column") {
        const mid = Math.ceil(bullets.length / 2);
        sl.addText(bullets.slice(0, mid), { x: 0.5, y: 1.3, w: 4.2, h: 3.5 });
        sl.addText(bullets.slice(mid), { x: 5.2, y: 1.3, w: 4.2, h: 3.5 });
      } else {
        sl.addText(bullets, { x: 0.5, y: 1.3, w: 9, h: 3.5 });
      }
    }
    if (s.notes) sl.addNotes(s.notes);
  });

  await pptx.writeFile({ fileName: `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pptx` });
}

export function exportPDF() {
  window.print();
}
