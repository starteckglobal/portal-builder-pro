import { ChevronRight, ChevronsUpDown, LogOut, KeyRound, UserRound, Bell, Check } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import abmLogo from "@/assets/abm-logo.png";
import { I } from "@/components/portalIcons";
import { useLiveMeetings } from "@/hooks/useLiveMeetings";

export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "leads", label: "Leads CRM", icon: "leads" },
  { id: "kanban", label: "Pitch Kanban", icon: "kanban" },
  { id: "chat", label: "Team Chat", icon: "chat" },
  { id: "livemeeting", label: "Live Meeting", icon: "video" },
  { id: "deckbuilder", label: "Deck Builder", icon: "deck" },
  { id: "pressrelease", label: "Press Release", icon: "press" },
  { id: "pitchemail", label: "Pitch Composer", icon: "email" },
  { id: "imagegen", label: "Creative AI", icon: "image" },
  { id: "medialist", label: "Media Lists", icon: "list" },
  { id: "clipper", label: "Clipper + Sentiment", icon: "clip" },
  { id: "calendar", label: "Social Calendar", icon: "calendar" },
  { id: "analytics", label: "Analytics", icon: "chart" },
  { id: "roi", label: "ROI Calculator", icon: "calc" },
  { id: "meeting", label: "Meeting Parser", icon: "notes" },
  { id: "competitor", label: "Competitor Intel", icon: "search" },
  { id: "boilerplate", label: "Boilerplates", icon: "assets" },
  { id: "onboard", label: "Client Onboard", icon: "wizard" },
  { id: "reports", label: "Report Builder", icon: "report" },
  { id: "monitor", label: "Media Monitor", icon: "monitor" },
  { id: "portal", label: "Client Portal", icon: "portal" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const byId = (id: string) => {
  const item = NAV.find((n) => n.id === id);
  if (!item) throw new Error(`Unknown navigation item: ${id}`);
  return item;
};

/** Grouped nav with collapsible pop-out sub-menus (shadcn sidebar pattern). */
const GROUPS: { id: string; label: string; icon: string; items: typeof NAV }[] = [
  {
    id: "workspace",
    label: "Workspace",
    icon: "dashboard",
    items: [byId("dashboard"), byId("leads"), byId("kanban"), byId("chat"), byId("livemeeting")],
  },
  {
    id: "create",
    label: "Create",
    icon: "deck",
    items: [byId("deckbuilder"), byId("pressrelease"), byId("pitchemail"), byId("imagegen"), byId("boilerplate")],
  },
  {
    id: "media",
    label: "Media",
    icon: "monitor",
    items: [byId("medialist"), byId("clipper"), byId("calendar"), byId("monitor"), byId("competitor")],
  },
  {
    id: "insights",
    label: "Insights",
    icon: "chart",
    items: [byId("analytics"), byId("roi"), byId("reports"), byId("meeting")],
  },
  {
    id: "clients",
    label: "Clients",
    icon: "portal",
    items: [byId("onboard"), byId("portal"), byId("settings")],
  },
];

const WORKSPACES = [
  { name: "ABM PR", plan: "New Orleans" },
  { name: "ABM PR", plan: "Baton Rouge" },
  { name: "ABM PR", plan: "Agency HQ" },
];

type AppSidebarProps = {
  tab: string;
  onSelect: (id: string) => void;
  userEmail?: string | null;
  onChangePassword: () => void;
  onSignOut: () => void;
  onNotifications?: () => void;
  workspace?: string;
  onWorkspaceChange?: (name: string) => void;
};

export function AppSidebar({
  tab,
  onSelect,
  userEmail,
  onChangePassword,
  onSignOut,
  onNotifications,
  workspace,
  onWorkspaceChange,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { data: liveMeetings = [] } = useLiveMeetings();
  const liveCount = liveMeetings.length;
  const active = workspace ?? WORKSPACES[0].plan;

  return (
    <Sidebar collapsible="icon">
      {/* ── HEADER: workspace switcher pop-out ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <img src={abmLogo} alt="ABM PR" className="size-8 shrink-0 rounded-md object-contain" />
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-bold text-white">ABM PR</span>
                    <span className="truncate text-[10px] text-muted-foreground">{active}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-60" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side={collapsed ? "right" : "bottom"}
                className="w-56 rounded-lg"
              >
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Workspaces
                </DropdownMenuLabel>
                {WORKSPACES.map((w) => (
                  <DropdownMenuItem key={w.plan} onClick={() => onWorkspaceChange?.(w.plan)} className="gap-2 text-xs">
                    <img src={abmLogo} alt="" className="size-4 rounded object-contain" />
                    <span className="flex-1">{w.plan}</span>
                    {w.plan === active && <Check className="size-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── CONTENT: collapsible groups with sub-menus ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {GROUPS.map((g) => {
                const hasActive = g.items.some((i) => i.id === tab);
                const groupLive = liveCount > 0 && g.items.some((i) => i.id === "livemeeting");
                return (
                  <Collapsible key={g.id} asChild defaultOpen={hasActive} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="abm-nav-item text-[11px] font-bold text-white"
                          isActive={hasActive}
                          tooltip={g.label}
                        >
                          <I name={g.icon} size={14} />
                          <span>{g.label}</span>
                          {groupLive && <span className="live-dot ml-1 size-2 shrink-0 rounded-full bg-destructive" />}
                          <ChevronRight className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {g.items.map((n) => (
                            <SidebarMenuSubItem key={n.id}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={tab === n.id}
                                className="cursor-pointer text-[11px] text-white"
                              >
                                <button type="button" onClick={() => onSelect(n.id)} className="w-full text-left">
                                  <I name={n.icon} size={12} />
                                  <span>{n.label}</span>
                                  {n.id === "livemeeting" && liveCount > 0 && (
                                    <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-destructive">
                                      <span className="live-dot size-2 rounded-full bg-destructive" />
                                      {liveCount} LIVE
                                    </span>
                                  )}
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── FOOTER: user pop-out menu ── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold text-primary">
                    {(userEmail ?? "U").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-xs font-bold text-white">
                      {userEmail?.split("@")[0] ?? "Account"}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">{userEmail ?? "Signed in"}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 opacity-60" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side={collapsed ? "right" : "top"} className="w-60 rounded-lg">
                <DropdownMenuLabel className="text-xs font-normal">
                  <div className="font-bold text-white">{userEmail?.split("@")[0] ?? "Account"}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{userEmail}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs" onClick={() => onSelect("settings")}>
                  <UserRound className="size-3.5" /> Account
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={() => onNotifications?.()}>
                  <Bell className="size-3.5" /> Notifications
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-xs" onClick={onChangePassword}>
                  <KeyRound className="size-3.5" /> Change Password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-xs text-destructive focus:text-destructive" onClick={onSignOut}>
                  <LogOut className="size-3.5" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
