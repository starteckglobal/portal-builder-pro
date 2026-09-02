## Implementation scope

### 1. Rebuild navigation and creation flow
- Add the dedicated protected `/deck-builder` route while keeping the existing CRM sidebar entry.
- Recreate Presenton's presentations dashboard, card/list states, empty state, deck actions, and templates area.
- Rebuild the create screen around prompt or supporting-document input, slide count/auto mode, language, tone, verbosity, audience/additional instructions, title-slide control, and standard/smart generation mode.
- Recreate the editable outline screen, streamed progress, prompt refinement, template selection, and generation transition.

### 2. Port the real template system
- Port the eight Apache-2.0 bundled Presenton templates and their template metadata, thumbnails, themes, fonts, static assets, merged components, and layout definitions into native project assets.
- Replace the four hardcoded themes and seven generic layouts with a renderer driven by the imported template definitions.
- Add the template dashboard and custom-template workflow: PPTX upload, slide/layout review, font mapping/upload, preview, and saving reusable user templates.
- Persist selected template, theme overrides, fonts, layout IDs, and slide content without breaking existing saved decks; migrate older decks into the new model on load.

### 3. Rebuild the editor to Presenton parity
- Match the editor shell: header, sortable thumbnail rail, main slide canvas, slide action bar, side panels, notes/presentation mode, autosave status, and responsive behavior.
- Add insert panels for text, charts, infographics, tables, images, and elements using Presenton's catalog and interactions.
- Add direct selection, move/resize/edit behavior, layout replacement, duplicate/delete/add slide, undo/redo, keyboard shortcuts, theme selector, and slide-level regeneration.
- Add the AI chat panel for presentation and selected-slide changes, including streaming progress and applying structured edits.
- Add real media handling: file uploads, generated/searchable imagery through approved project-native services, crop/position/replace controls, and persisted asset references.

### 4. Align generation, persistence, and export
- Expand the existing AI function into the multi-stage generation contract needed by the uploaded-document, outline, slide, image, and chat-edit flows; authenticate every request and return detailed errors.
- Stage additive database/storage changes for templates, richer slide documents, uploaded source files/assets, generation state, and version-safe autosave. Existing user decks remain readable.
- Use one normalized slide document and rendering rules for canvas, thumbnails, present mode, PPTX, and PDF so exported output tracks the editor.
- Preserve editable PPTX output, PDF output, speaker notes, template typography, charts/tables, images, and layout geometry.

### 5. Verification
- Add focused tests for template parsing, legacy-deck conversion, slide operations, autosave diffs, AI response validation, and export mapping.
- Run authenticated browser coverage for dashboard → prompt/document → outline → template → generation → rich editing → AI edit → autosave/reload → present → PPTX/PDF.
- Compare desktop screenshots against the audited Presenton screens and verify all eight templates and representative layout families visually.

## Technical constraints

- Presenton source is Apache-2.0; retain required attribution/notices for directly ported source and assets.
- No iframe, Docker, Python/FastAPI service, or external application dependency will be introduced.
- Provider-selection/local-model/admin infrastructure from Presenton will not be copied because this project uses its existing managed auth and AI/backend. The equivalent user-facing presentation behavior will be implemented through that infrastructure.
- New backend structures will be additive and will apply when the draft is accepted; existing portal modules and saved decks remain intact.
