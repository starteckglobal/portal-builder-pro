# Funnel Chart + Highlight Card Restyle

## What you get

1. **A funnel chart on the Dashboard** — the five-stage gradient funnel from the reference: stage values on top, percentage pills inside each band, labels underneath, smooth animated widths on load and on hover. It will be fed by real portal data (leads pipeline: total leads → contacted → engaged → pitched → coverage won), so it reflects the database, not mock numbers.

2. **One shared card look across the whole portal** — the "highlight card" style from the reference: dark gradient surface, thin white/accent hairline border, soft inner glow blobs, a sheen that sweeps on hover, and a gentle lift/scale. Every card-shaped container in the app is switched to this single component so the site stays consistent.

## How the card rollout works

Today every card is a hand-written inline-styled `div` (about 40 of them). Instead of restyling each one, the plan introduces one `PortalCard` component and swaps those containers over to it.

Two intensity levels so the app stays readable:

- **Feature cards** (stat tiles, chart cards, deck/toolkit/lead cards) — full treatment: glow blobs, hover sheen, lift, icon ring.
- **Panels** (long forms, editors, history lists, kanban columns, modals) — same surface, border and radius, but no sweeping sheen or scale, so text input and scrolling stay calm.

The green ABM accent replaces the reference's pure-white glow so it matches the existing theme rather than importing a new one.
