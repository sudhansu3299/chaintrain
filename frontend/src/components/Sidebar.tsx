import {
  LayoutDashboard,
  Database,
  Upload,
  Brain,
  Shield,
  GitBranch,
  FileCheck,
  Info,
} from "lucide-react";
import { NavLink } from "./NavLink";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Upload Dataset", url: "/upload", icon: Upload },
  { title: "Datasets", url: "/datasets", icon: Database },
  { title: "Models", url: "/models", icon: Brain },
  { title: "Proofs", url: "/proofs", icon: Shield },
  { title: "Lineage", url: "/lineage", icon: GitBranch },
  { title: "Governance", url: "/governance", icon: FileCheck },
  { title: "About", url: "/about", icon: Info },
];

export function Sidebar() {
  const { open } = useSidebar();

  return (
    <SidebarUI className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarUI>
  );
}
