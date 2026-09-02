## Technical details

**New files**
- `src/components/ui/portal-card.tsx` — `PortalCard` with `variant="feature" | "panel"`, optional `icon`, `title`, `footer`. Reference's Tailwind classes adapted: gradient surface, `border-white/10` → theme border token, glow blobs and sheen driven by `group-hover`, accent glow uses `--accent` instead of white. No new UI library.
- `src/components/charts/FunnelChart.tsx` — port of the pasted funnel component (`PatternLines`, gradient stops, stage bands, value labels, percentage pills). Requires the `motion` package (`bun add motion`) for the spring-animated widths; if we prefer zero new deps, the same animation is achievable with CSS transitions — the plan uses `motion` since the reference source depends on it.

**Dashboard wiring** (`src/components/ABMPortal.tsx`)
- Derive funnel stages from existing hooks: `useLeads()` (total, contacted, engaged/qualified by `status`), `useKanbanCards()` (pitched), `useCoverage()` (won). Percentages computed against stage one. Placed full-width under the stat row, above the existing charts.

**Card swap**
- Replace inline-styled containers with `PortalCard` in: `ABMPortal.tsx` (~30 containers incl. `Stat`, chart cards, lead rows, kanban columns, AI tool panels, history lists, ROI tiles, modals), `src/components/settings/MCPConnectorsPanel.tsx`, `src/components/deckbuilder/presenton/PresentonApp.tsx` deck cards and empty state, `TemplateGallery.tsx` tiles.
- Deck Builder keeps its own light Presenton palette; its cards use the `PortalCard` structure with the local token set so that surface doesn't turn dark.
- Existing hover-lift/active-bar chart behavior stays; the card wrapper takes over the lift so there's no double transform.

**Verification**
- Typecheck + production build.
- Authenticated Playwright pass: dashboard funnel renders with real numbers, hover states on cards in Dashboard, Leads, AI tools, Settings and Deck Builder, no console errors.
