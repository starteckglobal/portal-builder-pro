

# Deck Builder Module — Implementation Plan

## Overview
Add a full Deck Builder feature to the ABM PR Portal: a new `/deck-builder` route with AI-powered slide generation, inline editing, drag-to-reorder, theme switching, and PPTX/PDF export. All data persists in the database.

## Key Design Decision
**No Anthropic API key exists in this project.** Only `LOVABLE_API_KEY` is configured. The AI generation will use Lovable AI (via an edge function calling the Lovable AI Gateway), not Anthropic/Claude. This requires no extra setup — the key is already available.

---

## Step 1: Database Migration
Create a `decks` table:
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, NOT NULL)
- `title` (text, NOT NULL)
- `business_name` (text)
- `topic` (text)
- `tone` (text, default 'professional')
- `slides` (jsonb, default '[]')
- `theme` (text, default 'dark')
- `created_at` / `updated_at` (timestamptz, default now())

RLS policy: users manage own decks (`auth.uid() = user_id`). Add the existing `update_updated_at_column` trigger.

## Step 2: Edge Function — `generate-deck`
- Receives `{ topic, businessName, tone, slideCount }` from the client
- Calls Lovable AI Gateway with a system prompt instructing it to return a JSON array of slide objects
- Uses tool calling (structured output) to guarantee valid JSON with the correct slide schema
- Returns the parsed slides array to the client
- Handles 429/402 errors gracefully

## Step 3: New Dependencies
- `pptxgenjs` — PPTX export
- `jspdf` — PDF export
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-to-reorder slides

## Step 4: Data Hook — `useDecks`
New hook in `src/hooks/useDecks.ts`:
- `useDecks()` — fetch all user decks
- `useCreateDeck()` — insert new deck
- `useUpdateDeck()` — update deck (used for auto-save with 2s debounce)
- `useDeleteDeck()` — delete a deck

## Step 5: New Components
All in `src/components/deckbuilder/`:

1. **DeckDashboard.tsx** — Grid of deck cards (title, date, slide count) with New/Edit/Preview/Export/Delete actions
2. **NewDeckForm.tsx** — Modal/panel with title, topic, business name, tone selector, slide count input, "Generate Deck" button
3. **SlideEditor.tsx** — Left: vertical sortable list of editable slide cards. Right: live 16:9 preview. Drag-to-reorder via @dnd-kit. Add/delete slide buttons. Theme selector (Dark/Light/Navy/Charcoal).
4. **SlidePreview.tsx** — Renders a single slide as a styled 16:9 card based on layout type (title, bullets, two-column, image-text, closing)
5. **DeckExport.ts** — Utility functions for PPTX export (pptxgenjs) and PDF export (jsPDF or window.print)

## Step 6: Routing & Navigation
- Add `/deck-builder` route in `App.tsx` (protected)
- Create `src/pages/DeckBuilder.tsx` as the page wrapper
- The existing ABMPortal sidebar already has a "Deck Builder" nav item (`id: "deckbuilder"`). Change it to navigate to `/deck-builder` instead of switching tabs, OR keep it as a tab — whichever is simpler. Since the portal is tab-based (not route-based), the cleanest approach is to **keep it as a tab** and render the DeckDashboard/SlideEditor within ABMPortal when `tab === "deckbuilder"`.

## Step 7: Slide Themes
Four themes applied to preview cards:
- **Dark**: `#1a1a2e` bg, white text, green accents
- **Light**: `#ffffff` bg, dark text, blue accents  
- **Navy**: `#0a1628` bg, light text, gold accents
- **Charcoal**: `#2d2d2d` bg, light gray text, teal accents

## Step 8: Auto-Save
Debounced (2s) call to `useUpdateDeck` whenever slides, title, or theme change in the editor.

## Design Rules
- All components use the existing inline-style pattern (C, F, Btn, Badge, etc.) from ABMPortal
- No new UI library — matches existing dark theme exactly
- Slide previews styled as polished 16:9 cards with proper typography

---

## File Summary
| File | Action |
|------|--------|
| `supabase/migrations/...` | Create `decks` table + RLS |
| `supabase/functions/generate-deck/index.ts` | Edge function for AI slide generation |
| `src/hooks/useDecks.ts` | CRUD hooks for decks |
| `src/components/deckbuilder/DeckDashboard.tsx` | Deck listing + new deck form |
| `src/components/deckbuilder/SlideEditor.tsx` | Editor with drag-reorder + live preview |
| `src/components/deckbuilder/SlidePreview.tsx` | Single slide renderer |
| `src/components/deckbuilder/DeckExport.ts` | PPTX + PDF export utilities |
| `src/components/ABMPortal.tsx` | Wire `tab === "deckbuilder"` to render DeckDashboard/SlideEditor |
| `package.json` | Add pptxgenjs, jspdf, @dnd-kit/core, @dnd-kit/sortable |

