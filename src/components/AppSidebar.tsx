import {
  LayoutDashboard, AlertTriangle, PlusCircle, Database, Settings,
  Heart, Radio, Brain, Wrench, Package, DollarSign, Zap, Leaf,
  Bell, TrendingUp, FileText, ClipboardList, Shield
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Asset Health", url: "/asset-health", icon: Heart },
  { title: "Real-Time Monitoring", url: "/monitoring", icon: Radio },
  { title: "Assets", url: "/assets", icon: Database },
];

const analyticsItems = [
  { title: "Predictive Analytics", url: "/predictive-analytics", icon: Brain },
  { title: "Historical Trends", url: "/historical-trends", icon: TrendingUp },
  { title: "Energy Production", url: "/energy-production", icon: Zap },
  { title: "Financial Analytics", url: "/financial-analytics", icon: DollarSign },
  { title: "Sustainability", url: "/sustainability", icon: Leaf },
];

const operationsItems = [
  { title: "Maintenance Planner", url: "/maintenance-planner", icon: Wrench },
  { title: "Spare Parts", url: "/spare-parts", icon: Package },
  { title: "Alerts Center", url: "/alerts-center", icon: Bell },
  { title: "Alerts (Legacy)", url: "/alerts", icon: AlertTriangle },
  { title: "Add Assets", url: "/add-assets", icon: PlusCircle },
];

const systemItems = [
  { title: "Reports Center", url: "/reports", icon: FileText },
  { title: "Activity Logs", url: "/activity-logs", icon: ClipboardList },
  { title: "Admin Panel", url: "/admin", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { isAdmin } = useUserRole();

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                <NavLink
                  to={item.url}
                  end={item.url === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 ${isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent/50"}`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">GT</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">GreenTech</h2>
              <p className="text-xs text-muted-foreground">Reliability Intelligence</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">GT</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {renderGroup("Overview", mainItems)}
        {renderGroup("Analytics", analyticsItems)}
        {renderGroup("Operations", operationsItems)}
        {renderGroup("System", systemItems)}
      </SidebarContent>

      {!isCollapsed && (
        <SidebarFooter className="border-t border-border/50 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">v2.0</Badge>
            <span>GreenTech GRIP</span>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
