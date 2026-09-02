# Swap in the shadcn Sidebar

Replace the hand-built `<aside>` in the portal with the official shadcn sidebar composition (`SidebarProvider` / `Sidebar` / `SidebarHeader` / `SidebarContent` / `SidebarGroup` / `SidebarMenu` / `SidebarFooter` / `SidebarRail` / `SidebarInset` / `SidebarTrigger`).

The shadcn sidebar component already exists in this project at `src/components/ui/sidebar.tsx`, so nothing needs installing — it just isn't being used yet.

## What changes

- New `src/components/app-sidebar.tsx` — the `AppSidebar` from the docs, filled with the portal's existing 21 nav items (Dashboard through Settings), the ABM logo in `SidebarHeader`, and the current user email + Change Password + Sign Out in `SidebarFooter`.
- The portal shell becomes `SidebarProvider > AppSidebar + SidebarInset`, with a `SidebarTrigger` in the inset header next to the notification bell.
- Collapse uses `collapsible="icon"` plus `SidebarRail`, replacing the current logo-click collapse state.
- All existing behavior stays: clicking a nav item sets the tab, Deck Builder still routes to `/deck-builder`, active item highlighted.
