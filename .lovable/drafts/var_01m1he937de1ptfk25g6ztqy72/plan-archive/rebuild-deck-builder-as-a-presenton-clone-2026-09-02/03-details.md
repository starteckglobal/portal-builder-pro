## Technical detail

**Files replaced** (`src/components/deckbuilder/`): remove `DeckDashboard.tsx`, `SlideEditor.tsx`, `SlidePreview.tsx`; keep and extend `DeckExport.ts`.

**New files**
- `presenton/theme.ts` — Presenton's own palette/typography tokens (light UI, indigo primary) plus the four slide templates as data.
- `presenton/PresentonApp.tsx` — step router (dashboard / create / outline / presentation), mounted where Deck Builder renders today.
- `presenton/CreateStep.tsx`, `OutlineStep.tsx`, `TemplateGallery.tsx`.
- `presenton/PresentationEditor.tsx` — thumbnail rail, canvas, layout switcher, notes, present mode.
- `presenton/SlideCanvas.tsx` — renders one slide per layout at 16:9, `contentEditable` fields writing back to slide state.
- `presenton/layouts/` — seven layout renderers shared by canvas, thumbnails, and export.

**Backend**
- Reuse `supabase/functions/generate-deck` and add an `outline` mode: given topic/count/tone/language, return `[{title, description}]`; a second call expands the approved outline into full slides. Structured tool-calling output as today.
- Reuse the `decks` table. `slides` jsonb gains optional per-slide `template`, `imagePrompt`, and `stats`; `theme` stores the template id. No schema change needed — jsonb absorbs it.
- Autosave stays debounced at 2s via `useUpdateDeck`.

**Export**
- PPTX: extend `exportPPTX` to cover all seven layouts with template colors.
- PDF: render each slide to canvas via `jspdf` + html rasterization, one page per slide, landscape 16:9.

**Not portable from the upstream repo:** Docker compose, FastAPI service, Python `python-pptx` export, its Postgres/Redis stack, its local-LLM (Ollama) options, and file-upload document parsing. The React screens, slide layouts, outline flow, and export outputs are recreated; the server topology is this project's.

**Testing:** browser run of the full flow — create → outline edit → generate → edit a slide → present mode → PPTX and PDF download — plus reload to confirm autosave persistence.
