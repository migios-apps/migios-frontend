import { useThemeConfig } from "@/stores/theme-config-store"
import { cn } from "@/lib/utils"
import { useSidebarData } from "@/hooks/use-sidebar-data"
import Logo from "@/components/layout/Logo"
import ClubButtonSelect from "@/components/layout/club-button-select"
// import { AppTitle } from './app-title'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/layout/vertical/sidebar"
import { SidebarNotification } from "@/components/sidebar-notification"
import { NavGroup } from "../nav-group"

export function AppSidebar() {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const sidebarData = useSidebarData()

  return (
    <Sidebar
      collapsible={themeConfig.sidebar}
      variant={themeConfig.layout as "sidebar" | "inset" | "floating"}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-col items-start gap-3">
            <Logo
              type={themeConfig.sidebar_state ? "full" : "icon"}
              className={cn(
                "flex items-start justify-start",
                themeConfig.layout === "inset"
                  ? "text-sidebar-accent-inset-foreground"
                  : "text-sidebar-accent-foreground"
              )}
              svgProps={{
                className: themeConfig.sidebar_state ? "h-10 w-auto" : "size-8",
              }}
            />
            <ClubButtonSelect sideNavCollapse={!themeConfig.sidebar_state} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {themeConfig.sidebar_state && <SidebarNotification />}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
