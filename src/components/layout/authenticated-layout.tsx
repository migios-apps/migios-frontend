import { Suspense, useState } from "react"
import { ContainerProps, RouteProps } from "@/@types/routes"
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
import { Search } from "../search"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "../theme-customizer"
import { ThemeSwitch } from "../theme-switch"
import { PageLoader } from "../ui/page-loader"
import Logo from "./Logo"
import { Header } from "./header"
import { Main } from "./main"
import { ProfileDropdown } from "./profile-dropdown"

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
} & RouteProps["meta"]

export function AuthenticatedLayout({
  children,
  container,
  themeConfig,
}: AuthenticatedLayoutProps) {
  const themeConfigState = useThemeConfig((state) => state.themeConfig)
  const setThemeConfig = useThemeConfig((state) => state.setThemeConfig)
  const sidebarData = useSidebarData()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themeCustomizerOpen, setThemeCustomizerOpen] = useState(false)

  const containerProps = {
    fixed: container?.fixed ?? false,
    fluid: container?.fluid ?? true,
    className: container?.className ?? undefined,
  } as ContainerProps

  const handleOpenChange = (open: boolean) => {
    setThemeConfig({ sidebar_state: open })
  }

  const isHorizontalLayout =
    themeConfig?.layout === "horizontal" ||
    themeConfigState.layout === "horizontal"
  const isBlankLayout =
    themeConfig?.layout === "blank" || themeConfigState.layout === "blank"

  // Blank Layout (no header, no sidebar)
  if (!isBlankLayout) {
    return (
      <SidebarProvider
        open={themeConfigState.sidebar_state}
        onOpenChange={handleOpenChange}
      >
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
              <ProfileDropdown />
            </div>
          </Header>
          <Suspense fallback={<PageLoader />}>
            <Main {...containerProps}>{children ?? <Outlet />}</Main>
          </Suspense>
        </SidebarInset>

        {/* Theme Customizer */}
        {import.meta.env.DEV && (
          <>
            <ThemeCustomizerTrigger
              onClick={() => setThemeCustomizerOpen(true)}
            />
            <ThemeCustomizer
              open={themeCustomizerOpen}
              onOpenChange={setThemeCustomizerOpen}
            />
          </>
        )}
      </SidebarProvider>
    )
  }

  // Horizontal Layout
  if (isHorizontalLayout) {
    return (
      <SearchProvider>
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
                  <Logo
                    type="full"
                    className={cn(
                      "flex items-start justify-start",
                      "text-sidebar-accent-foreground"
                    )}
                    svgProps={{
                      className: "h-10 w-auto",
                    }}
                  />
                </div>
              </div>
              <HorizontalNav navGroups={sidebarData.navGroups} />
              <div className="ms-auto flex items-center space-x-4">
                <Search iconOnly />
                <ThemeSwitch />
                <ProfileDropdown />
              </div>
            </div>
          </Header>
          <Suspense fallback={<PageLoader />}>
            <Main
              {...containerProps}
              className={cn(
                "mx-auto w-full max-w-6xl",
                containerProps.className
              )}
            >
              {children ?? <Outlet />}
            </Main>
          </Suspense>
        </div>
      </SearchProvider>
    )
  }

  // Vertical Layout (default)
  return (
    <Suspense fallback={<PageLoader />}>
      <div className="min-h-svh">{children ?? <Outlet />}</div>
    </Suspense>
  )
}
