import {
  LayoutDashboard, Heart, Radio, Database, Brain, TrendingUp, Zap, DollarSign, Leaf,
  Wrench, Package, Bell, FileText, ClipboardList, Shield, Settings, HardDrive,
  Search, Info, LogOut
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Asset Health", url: "/asset-health", icon: Heart },
      { title: "Real-Time Monitor", url: "/monitoring", icon: Radio },
      { title: "Assets", url: "/assets", icon: Database },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Predictive Analytics", url: "/predictive-analytics", icon: Brain },
      { title: "Historical Trends", url: "/historical-trends", icon: TrendingUp },
      { title: "Energy Production", url: "/energy-production", icon: Zap },
      { title: "Financial Analytics", url: "/financial-analytics", icon: DollarSign },
      { title: "Sustainability", url: "/sustainability", icon: Leaf },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Maintenance Planner", url: "/maintenance-planner", icon: Wrench },
      { title: "Spare Parts", url: "/spare-parts", icon: Package },
      { title: "Alerts Center", url: "/alerts-center", icon: Bell },
    ],
  },
  {
    label: "Data & Reports",
    items: [
      { title: "Dataset Manager", url: "/dataset-manager", icon: HardDrive },
      { title: "Datasets Explorer", url: "/datasets-explorer", icon: Search },
      { title: "Reports Center", url: "/reports", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Activity Logs", url: "/activity-logs", icon: ClipboardList },
      { title: "Admin Panel", url: "/admin", icon: Shield },
      { title: "Know More", url: "/know-more", icon: Info },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald to-primary flex items-center justify-center shadow-lg shadow-emerald/20">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">GreenTech</h2>
              <p className="text-[11px] text-sidebar-foreground/50">Reliability Intelligence</p>
            </div>
          </div>
        ) : (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald to-primary flex items-center justify-center mx-auto shadow-lg shadow-emerald/20">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {sections.map((section) => (
          <SidebarGroup key={section.label} className="mb-1">
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-sidebar-foreground/40 px-3 mb-1">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined} className="h-9">
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 rounded-lg text-[13px] font-medium transition-all duration-200",
                            isActive
                              ? "bg-sidebar-accent/15 text-sidebar-accent shadow-sm"
                              : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-muted/50"
                          )
                        }
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!isCollapsed ? (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted/50 transition-all w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted/50 transition-all mx-auto"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
