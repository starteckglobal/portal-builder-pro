# Presenton parity rebuild

## Audit result

The current Deck Builder does **not** match the current Presenton repository. It reproduces only the broad dashboard → prompt → outline → editor flow.

Confirmed gaps include:

- Four simplified color themes versus Presenton's eight repository templates: **Dynamic, Editorial, Executive, General, Modern, Momentum, Standard, and Swift**, comprising roughly 158 supplied layouts.
- No true template/layout engine, template browser, custom-template workflow, or per-template fonts/assets.
- No prompt-or-document creation flow, supporting-file processing, title-slide option, verbosity control, additional instructions, or Presenton's generation-mode choices.
- No AI editing chat, streamed generation state, rich slide-element editor, undo/redo, keyboard-shortcut panel, or insertion palettes.
- No real images, charts, tables, infographics, equations, icons, shapes, image grids, or image editing.
- Only basic text layouts and client-side exports; visual fidelity between editor and exports is not guaranteed.
- The module is a portal tab rather than a dedicated `/deck-builder` route.

## Goal

Replace the simplified module with a source-faithful React/TypeScript port of Presenton's current user-facing presentation workspace, pinned to audited upstream commit `84fc0c5317f90a5ce4e13ee3817c6db4e9133972`. Preserve only the infrastructure substitutions required by this Lovable project: React Router/Vite for routing, Lovable Cloud for authentication/data/files/functions, and Lovable AI for generation.

“Exact” means matching Presenton's screens, controls, interaction model, bundled templates, layout catalog, editor capabilities, and presentation lifecycle. It does not mean introducing Presenton's incompatible Next.js, Python, Docker, local-model, or multi-provider server stack.
