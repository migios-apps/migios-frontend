import React, { useEffect, useRef } from "react"
import { People, Profile2User, Weight } from "iconsax-reactjs"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LayoutPackages = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tabListRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  const routeMembership = "/packages/membership"
  const routePTProgram = "/packages/pt-program"
  const routeClass = "/packages/class"

  useEffect(() => {
    if (activeTabRef.current && tabListRef.current) {
      const tabList = tabListRef.current
      const activeTab = activeTabRef.current
      const scrollLeft =
        activeTab.offsetLeft -
        tabList.clientWidth / 2 +
        activeTab.clientWidth / 2
      tabList.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      })
    }
  }, [pathname])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-foreground text-xl font-semibold">Packages</h3>
      </div>
      <div className="border-border bg-background sticky top-16 z-10 w-full border-b shadow-sm">
        <Tabs value={pathname} onValueChange={(value) => navigate(value)}>
          <div className="overflow-x-auto">
            <TabsList
              ref={tabListRef}
              className="h-auto w-full min-w-fit justify-start rounded-none border-0 bg-transparent p-0"
            >
              <TabsTrigger
                ref={pathname === routeMembership ? activeTabRef : undefined}
                value={routeMembership}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                <Profile2User className="mr-2 size-4" />
                Membership
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routePTProgram ? activeTabRef : undefined}
                value={routePTProgram}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                <Weight className="mr-2 size-4" />
                PT Program
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routeClass ? activeTabRef : undefined}
                value={routeClass}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                <People className="mr-2 size-4" />
                Class
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
      <div className="relative">{children || <Outlet />}</div>
    </div>
  )
}

export default LayoutPackages
