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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import abmLogo from "@/assets/abm-logo.png";
import { I } from "@/components/portalIcons";

export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "leads", label: "Leads CRM", icon: "leads" },
  { id: "kanban", label: "Pitch Kanban", icon: "kanban" },
  { id: "chat", label: "Team Chat", icon: "chat" },
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

type AppSidebarProps = {
  tab: string;
  onSelect: (id: string) => void;
  userEmail?: string | null;
  onChangePassword: () => void;
  onSignOut: () => void;
};

export function AppSidebar({ tab, onSelect, userEmail, onChangePassword, onSignOut }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <img src={abmLogo} alt="ABM PR" className="h-7 w-7 shrink-0 rounded-md object-contain" />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold leading-none text-white">ABM PR</div>
              <div className="text-[7px] uppercase tracking-[2px] text-muted-foreground">New Orleans</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((n) => (
                <SidebarMenuItem key={n.id}>
                  <SidebarMenuButton
                    className="abm-nav-item text-[11px] font-bold text-white"
                    isActive={tab === n.id}
                    tooltip={n.label}
                    onClick={() => onSelect(n.id)}
                  >
                    <I name={n.icon} size={14} />
                    <span>{n.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && userEmail && (
          <div className="truncate px-2 text-[9px] text-muted-foreground">{userEmail}</div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-[11px]" tooltip="Change Password" onClick={onChangePassword}>
              <I name="lock" size={14} />
              <span>Change Password</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-[11px] text-destructive hover:text-destructive" tooltip="Sign Out" onClick={onSignOut}>
              <I name="logout" size={14} />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
