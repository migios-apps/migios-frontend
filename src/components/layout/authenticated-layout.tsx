import { Suspense, useState } from "react"
import { Outlet } from "react-router-dom"
import { useThemeConfig } from "@/stores/theme-config-store"
import { cn } from "@/lib/utils"
import { SearchProvider } from "@/context/search-provider"
import { useSidebarData } from "@/hooks/use-sidebar-data"
import { HorizontalNav } from "@/components/layout/horizontal/horizontal-nav"
import { MobileMenuSheet } from "@/components/layout/horizontal/mobile-menu-sheet"
import { AppSidebar } from "@/components/layout/vertical/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/layout/vertical/sidebar"
import { SkipToMain } from "@/components/skip-to-main"
import { ConfigDrawer } from "../config-drawer"
import { ProfileDropdown } from "../profile-dropdown"
import { Search } from "../search"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "../theme-customizer"
import { ThemeSwitch } from "../theme-switch"
import { PageLoader } from "../ui/page-loader"
import { Header } from "./header"
import { TeamSwitcherHorizontal } from "./horizontal/team-switcher-horizontal"
import { Main } from "./main"

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const setThemeConfig = useThemeConfig((state) => state.setThemeConfig)
  const sidebarData = useSidebarData()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    setThemeConfig({ sidebar_state: open })
  }

  const isHorizontalLayout = themeConfig.layout === "horizontal"
  const isBlankLayout = themeConfig.layout === "blank"

  // Blank Layout (no header, no sidebar)
  if (isBlankLayout) {
    return (
      <Suspense fallback={<PageLoader />}>
        <div className="min-h-svh">{children ?? <Outlet />}</div>
      </Suspense>
    )
  }

  // Horizontal Layout
  if (isHorizontalLayout) {
    return (
      <SearchProvider>
        <SkipToMain />
        <div className="flex min-h-svh flex-col">
          {/* Header dengan horizontal navigation */}
          <Header fixed showSidebarTrigger={false} className="border-b">
            <div className="mx-auto flex w-full max-w-7xl">
              <div className="flex items-center gap-2">
                <MobileMenuSheet
                  open={mobileMenuOpen}
                  onOpenChange={setMobileMenuOpen}
                />
                <div className="hidden md:block">
                  <TeamSwitcherHorizontal teams={sidebarData.teams} />
                </div>
              </div>
              <HorizontalNav navGroups={sidebarData.navGroups} />
              <div className="ms-auto flex items-center space-x-4">
                <Search iconOnly />
                <ThemeSwitch />
                <ConfigDrawer />
                <ProfileDropdown />
              </div>
            </div>
          </Header>
          <Suspense fallback={<PageLoader />}>
            <Main fluid className="mx-auto w-full max-w-6xl">
              {children ?? <Outlet />}
            </Main>
          </Suspense>
        </div>
      </SearchProvider>
    )
  }

  // Vertical Layout (default)
  return (
    <SearchProvider>
      <SidebarProvider
        open={themeConfig.sidebar_state}
        onOpenChange={handleOpenChange}
      >
        <SkipToMain />
        <AppSidebar />
        <SidebarInset
          className={cn(
            // Set content container, so we can use container queries
            "@container/content",

            // If layout is fixed, set the height
            // to 100svh to prevent overflow
            "has-data-[layout=fixed]:h-svh",

            // If layout is fixed and sidebar is inset,
            // set the height to 100svh - spacing (total margins) to prevent overflow
            "peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]"
          )}
        >
          {/* Global Header untuk semua protected routes */}
          <Header fixed>
            <Search />
            <div className="ms-auto flex items-center space-x-4">
              <ThemeSwitch />
              <ConfigDrawer />
              <ProfileDropdown />
            </div>
          </Header>
          <Suspense fallback={<PageLoader />}>
            <Main fluid>{children ?? <Outlet />}</Main>
          </Suspense>
        </SidebarInset>

        {/* Theme Customizer */}
        <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
        <ThemeCustomizer
          open={themeCustomizerOpen}
          onOpenChange={setThemeCustomizerOpen}
        />
      </SidebarProvider>
    </SearchProvider>
  )
}
