// Presenton-style design tokens (light UI, indigo primary)
export const P = {
  bg: "#f7f7fb",
  panel: "#ffffff",
  border: "#e6e6ef",
  borderStrong: "#d3d3e2",
  text: "#101020",
  textDim: "#5b5b70",
  textMuted: "#9494a8",
  primary: "#5146E5",
  primaryHover: "#4038cc",
  primarySoft: "#eeecff",
  danger: "#e04a4a",
  shadow: "0 1px 2px rgba(16,16,32,.06), 0 8px 24px rgba(16,16,32,.06)",
  font: "'Inter','Satoshi',system-ui,sans-serif",
};

export type SlideLayout =
  | "title"
  | "bullets"
  | "two-column"
  | "image-text"
  | "stats"
  | "quote"
  | "closing";

export const LAYOUTS: SlideLayout[] = [
  "title",
  "bullets",
  "two-column",
  "image-text",
  "stats",
  "quote",
  "closing",
];

export interface Template {
  id: string;
  name: string;
  bg: string;
  panel: string;
  text: string;
  dim: string;
  accent: string;
  titleFont: string;
  bodyFont: string;
}

export const TEMPLATES: Template[] = [
  { id: "general", name: "General", bg: "#ffffff", panel: "#f3f4f9", text: "#101020", dim: "#5b5b70", accent: "#5146E5", titleFont: "'Inter',sans-serif", bodyFont: "'Inter',sans-serif" },
  { id: "modern", name: "Modern", bg: "#0d0d18", panel: "#1c1c2e", text: "#f5f5ff", dim: "#a2a2c0", accent: "#7c6cff", titleFont: "'Inter',sans-serif", bodyFont: "'Inter',sans-serif" },
  { id: "classic", name: "Classic", bg: "#fdfaf3", panel: "#f2ebdc", text: "#241f18", dim: "#6b5f4c", accent: "#a8763e", titleFont: "Georgia,serif", bodyFont: "Georgia,serif" },
  { id: "professional", name: "Professional", bg: "#0a1628", panel: "#132539", text: "#eaf1fa", dim: "#9db2c9", accent: "#3ba0ff", titleFont: "'Inter',sans-serif", bodyFont: "'Inter',sans-serif" },
];

export const getTemplate = (id?: string | null): Template =>
  TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian"];
export const TONES = ["Professional", "Sales Pitch", "Educational", "Casual"];
