# Rebuild Deck Builder as a Presenton clone

Replace the current Deck Builder (dashboard + simple slide editor) with a native React rebuild of Presenton's product: its light UI, its three-step flow (prompt → editable outline → generated slides), its template/theme picker, its slide editor, and its PPTX/PDF export.

Important constraint: Presenton is a Next.js + FastAPI + Postgres app with its own Docker stack and Python export service. What is buildable here is a like-for-like recreation of its screens and behavior in React/TypeScript, with the AI generation running through the existing backend function and decks stored in the existing database.

## Presenton flow being recreated

1. **Create screen** — big prompt box, slide-count selector, language selector, tone, optional bullet/file context, "Next" button. Presenton's own light card layout, not the portal's dark theme.
2. **Outline screen** — AI returns a numbered outline of slide titles + one-line descriptions. Each row is editable, reorderable, deletable, with "Add slide". Template/theme gallery below (General, Modern, Classic, Professional) with thumbnail previews. "Generate Presentation" button.
3. **Presentation screen** — left thumbnail rail, large slide canvas, per-slide layout switcher (title, bullets, two-column, image+text, stats, quote, closing), inline text editing on the canvas itself, speaker notes drawer, present mode (fullscreen arrow-key deck), and Export → PPTX / PDF.
4. **Dashboard** — Presenton-style grid of saved presentations with thumbnail, title, slide count, date, and open/duplicate/delete actions.
