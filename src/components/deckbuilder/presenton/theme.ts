import { PRESENTON_TEMPLATES } from "./templateCatalog";

// Presenton workspace tokens and source-faithful template catalog.
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
  description: string;
  layouts: Array<{ id: string; description: string; kind: SlideLayout }>;
}

export const TEMPLATES: Template[] = PRESENTON_TEMPLATES;

export const getTemplate = (id?: string | null): Template =>
  TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Italian"];
export const TONES = ["Professional", "Sales Pitch", "Educational", "Casual"];
export const VERBOSITIES = ["Concise", "Standard", "Detailed"];
