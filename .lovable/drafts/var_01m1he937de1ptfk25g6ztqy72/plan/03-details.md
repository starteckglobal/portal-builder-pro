## Technical details

`src/components/app-sidebar.tsx`
- `<Sidebar collapsible="icon">` with `SidebarHeader` (ABM logo + "ABM PR / New Orleans" label), one `SidebarGroup` with `SidebarGroupLabel "Workspace"`, `SidebarGroupContent > SidebarMenu`, and a `SidebarMenuItem` + `SidebarMenuButton` per nav entry (`isActive`, `tooltip={label}`, existing `I` icon).
- `SidebarFooter`: user email, Change Password button, Sign Out button as `SidebarMenuButton`s.
- `SidebarRail` for edge-drag collapse.
- Props: `tab`, `onSelect(id)`, `onChangePassword`, `userEmail`, `onSignOut` — so the portal keeps owning state.

`src/components/ABMPortal.tsx`
- Move the `NAV` array into `app-sidebar.tsx` (exported so it stays a single source of truth).
- Replace the root `div` + `<aside>` with `SidebarProvider` (wrapper `div` keeps `w-full`), `<AppSidebar …/>`, and `<SidebarInset>` around the current `<main>` contents.
- Add a slim inset header holding `SidebarTrigger` on the left; keep the notification bell where it is.
- Remove the now-unused `collapsed` state and the logo-click toggle.

`src/index.css`
- Map the existing sidebar design tokens (`--sidebar-background`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`) to the portal's dark surface/green-accent values so the shadcn sidebar matches the current look. Keep the bold Satoshi label + hover animation via the existing `.abm-nav-item` class applied to `SidebarMenuButton`.

Verification: typecheck, production build, and a browser pass confirming nav switching, collapse/expand via trigger and rail, Deck Builder navigation, Change Password modal, and Sign Out.
