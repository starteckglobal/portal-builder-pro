import type { Slide } from "@/hooks/useDecks";
import { getTemplate } from "./presenton/theme";

const hex = (c: string) => c.replace("#", "").toUpperCase();
const safe = (s: string) => (s || "presentation").replace(/[^a-zA-Z0-9]+/g, "_");

export async function exportPPTX(slides: Slide[], title: string, templateId: string) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  pptx.title = title;
  const t = getTemplate(templateId);
  const BG = hex(t.bg), TX = hex(t.text), DIM = hex(t.dim), AC = hex(t.accent), PN = hex(t.panel);

  slides.forEach((s) => {
    const sl = pptx.addSlide();
    sl.background = { color: BG };

    const bullets = (items: string[], x: number, y: number, w: number, size: number) =>
      sl.addText(
        items.filter(Boolean).map((b) => ({ text: b, options: { fontSize: size, color: TX, bullet: { type: "bullet" as const }, paraSpaceAfter: 8 } })),
        { x, y, w, h: 3.6, valign: "top" }
      );

    if (s.layout === "title" || s.layout === "closing") {
      sl.addShape(pptx.ShapeType.rect, { x: 4.55, y: 1.7, w: 0.9, h: 0.07, fill: { color: AC } });
      sl.addText(s.title, { x: 0.8, y: 2.0, w: 8.4, h: 1.4, fontSize: 40, bold: true, color: TX, align: "center" });
      if (s.subtitle) sl.addText(s.subtitle, { x: 1.2, y: 3.4, w: 7.6, h: 0.6, fontSize: 18, color: DIM, align: "center" });
      if (s.layout === "closing" && s.bullets[0]) sl.addText(s.bullets[0], { x: 1.2, y: 4.1, w: 7.6, h: 0.5, fontSize: 16, bold: true, color: AC, align: "center" });
    } else if (s.layout === "quote") {
      sl.addText("\u201C", { x: 0.5, y: 0.7, w: 1.5, h: 1.2, fontSize: 80, color: AC });
      sl.addText(s.title, { x: 0.8, y: 1.9, w: 8.4, h: 1.6, fontSize: 28, bold: true, color: TX });
      sl.addText(s.subtitle || s.bullets[0] || "", { x: 0.8, y: 3.5, w: 8.4, h: 0.6, fontSize: 16, color: DIM });
    } else if (s.layout === "stats") {
      sl.addText(s.title, { x: 0.6, y: 0.45, w: 8.8, h: 0.7, fontSize: 26, bold: true, color: TX });
      sl.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.2, w: 0.8, h: 0.05, fill: { color: AC } });
      const cards = s.bullets.slice(0, 3);
      const w = cards.length ? 8.8 / cards.length - 0.2 : 8.8;
      cards.forEach((b, i) => {
        const parts = b.split(/\s*[—–:-]\s*/);
        const x = 0.6 + i * (w + 0.3);
        sl.addShape(pptx.ShapeType.roundRect, { x, y: 1.6, w, h: 2.1, fill: { color: PN }, rectRadius: 0.1, line: { color: PN } });
        sl.addText(parts[0], { x: x + 0.25, y: 1.85, w: w - 0.5, h: 0.8, fontSize: 30, bold: true, color: AC });
        sl.addText(parts.slice(1).join(" "), { x: x + 0.25, y: 2.65, w: w - 0.5, h: 0.9, fontSize: 13, color: DIM });
      });
    } else if (s.layout === "two-column") {
      sl.addText(s.title, { x: 0.6, y: 0.45, w: 8.8, h: 0.7, fontSize: 26, bold: true, color: TX });
      sl.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.2, w: 0.8, h: 0.05, fill: { color: AC } });
      const mid = Math.ceil(s.bullets.length / 2);
      bullets(s.bullets.slice(0, mid), 0.6, 1.5, 4.1, 14);
      bullets(s.bullets.slice(mid), 5.1, 1.5, 4.1, 14);
    } else if (s.layout === "image-text") {
      sl.addText(s.title, { x: 0.6, y: 0.45, w: 8.8, h: 0.7, fontSize: 26, bold: true, color: TX });
      sl.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.2, w: 0.8, h: 0.05, fill: { color: AC } });
      bullets(s.bullets, 0.6, 1.55, 4.6, 14);
      sl.addShape(pptx.ShapeType.roundRect, { x: 5.5, y: 1.65, w: 3.9, h: 2.6, fill: { color: PN }, rectRadius: 0.12, line: { color: PN } });
      sl.addText(s.subtitle || "Visual", { x: 5.6, y: 2.7, w: 3.7, h: 0.5, fontSize: 14, color: DIM, align: "center" });
    } else {
      sl.addText(s.title, { x: 0.6, y: 0.45, w: 8.8, h: 0.7, fontSize: 26, bold: true, color: TX });
      if (s.subtitle) sl.addText(s.subtitle, { x: 0.6, y: 1.12, w: 8.8, h: 0.4, fontSize: 15, color: DIM });
      sl.addShape(pptx.ShapeType.rect, { x: 0.6, y: s.subtitle ? 1.6 : 1.2, w: 0.8, h: 0.05, fill: { color: AC } });
      bullets(s.bullets, 0.6, s.subtitle ? 1.9 : 1.5, 8.8, 15);
    }
    if (s.notes) sl.addNotes(s.notes);
    s.elements?.forEach((el) => {
      const x = el.x / 128, y = el.y / 96, w = el.width / 128, h = el.height / 96;
      if (el.type === "text") sl.addText(el.text || "Text", { x, y, w, h, fontSize: el.variant === "heading" ? 24 : 14, bold: el.variant === "heading", color: hex(el.color || t.text) });
      if (el.type === "shape") sl.addShape(el.variant === "circle" ? pptx.ShapeType.ellipse : pptx.ShapeType.rect, { x, y, w, h, fill: { color: hex(el.color || t.accent) }, line: { color: hex(el.color || t.accent) } });
      if (el.type === "image" && el.src) sl.addImage({ path: el.src, x, y, w, h });
      if (el.type === "table") sl.addTable((el.rows || [["Category", "Value"], ["Item", "100"]]).map((row) => row.map((text) => ({ text }))), { x, y, w, h, border: { color: DIM, pt: 1 }, fill: { color: PN }, color: TX, fontSize: 11 });
      if (el.type === "chart") {
        const data = (el.data || [{ label: "A", value: 35 }, { label: "B", value: 70 }, { label: "C", value: 52 }]).map((d, i) => ({ name: String(d.label || i + 1), labels: [String(d.label || i + 1)], values: [Number(d.value || 0)] }));
        sl.addChart(pptx.ChartType.bar, data, { x, y, w, h, showLegend: false, showTitle: false, chartColors: [AC, DIM] });
      }
    });
  });

  await pptx.writeFile({ fileName: `${safe(title)}.pptx` });
}

const rgb = (c: string): [number, number, number] => {
  const h = c.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

export async function exportPDF(slides: Slide[], title: string, templateId: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: [1280, 720] });
  const t = getTemplate(templateId);
  const [br, bg, bb] = rgb(t.bg);
  const [tr, tg, tb] = rgb(t.text);
  const [dr, dg, db] = rgb(t.dim);
  const [ar, ag, ab] = rgb(t.accent);
  const serif = t.titleFont.toLowerCase().includes("georgia");
  const face = serif ? "times" : "helvetica";

  slides.forEach((s, i) => {
    if (i > 0) doc.addPage([1280, 720], "landscape");
    doc.setFillColor(br, bg, bb);
    doc.rect(0, 0, 1280, 720, "F");

    if (s.layout === "title" || s.layout === "closing") {
      doc.setFillColor(ar, ag, ab);
      doc.rect(608, 250, 64, 5, "F");
      doc.setFont(face, "bold").setFontSize(46).setTextColor(tr, tg, tb);
      doc.text(doc.splitTextToSize(s.title, 900), 640, 330, { align: "center" });
      if (s.subtitle) {
        doc.setFont(face, "normal").setFontSize(22).setTextColor(dr, dg, db);
        doc.text(doc.splitTextToSize(s.subtitle, 860), 640, 400, { align: "center" });
      }
      if (s.layout === "closing" && s.bullets[0]) {
        doc.setFont(face, "bold").setFontSize(18).setTextColor(ar, ag, ab);
        doc.text(s.bullets[0], 640, 450, { align: "center" });
      }
    } else {
      doc.setFont(face, "bold").setFontSize(34).setTextColor(tr, tg, tb);
      const titleLines = doc.splitTextToSize(s.title, 1100);
      doc.text(titleLines, 82, 120);
      const afterTitle = 120 + titleLines.length * 40;
      doc.setFillColor(ar, ag, ab);
      doc.rect(82, afterTitle - 10, 56, 4, "F");
      let y = afterTitle + 40;
      doc.setFont(face, "normal").setFontSize(20).setTextColor(tr, tg, tb);
      s.bullets.filter(Boolean).forEach((b) => {
        const lines = doc.splitTextToSize(b, 1050);
        doc.setFillColor(ar, ag, ab);
        doc.circle(88, y - 7, 4, "F");
        doc.text(lines, 108, y);
        y += lines.length * 28 + 12;
      });
    }
    doc.setFont(face, "normal").setFontSize(13).setTextColor(dr, dg, db);
    doc.text(`${i + 1} / ${slides.length}`, 1200, 686);
    s.elements?.forEach((el) => {
      if (el.type === "text") { doc.setFont(face, el.variant === "heading" ? "bold" : "normal").setFontSize(el.variant === "heading" ? 26 : 16).setTextColor(tr, tg, tb); doc.text(doc.splitTextToSize(el.text || "Text", el.width), el.x, el.y + 22); }
      if (el.type === "shape") { doc.setFillColor(ar, ag, ab); el.variant === "circle" ? doc.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, "F") : doc.roundedRect(el.x, el.y, el.width, el.height, 8, 8, "F"); }
      if (el.type === "table") { (el.rows || []).forEach((row, ri) => row.forEach((cell, ci) => { const cw = el.width / row.length, rh = 34; doc.rect(el.x + ci * cw, el.y + ri * rh, cw, rh); doc.setFontSize(12).text(String(cell), el.x + ci * cw + 6, el.y + ri * rh + 21); })); }
    });
  });

  doc.save(`${safe(title)}.pdf`);
}
