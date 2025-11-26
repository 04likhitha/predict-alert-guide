import { LayoutDashboard, AlertTriangle, PlusCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Add Assets", url: "/add-assets", icon: PlusCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RE</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Renewable Energy</h2>
              <p className="text-xs text-muted-foreground">Predictive Maintenance</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">RE</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2 ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-accent/50"
                        }`
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
      </SidebarContent>
    </Sidebar>
  );
}
