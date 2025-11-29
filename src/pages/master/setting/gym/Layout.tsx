import React, { useEffect, useRef } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LayoutGymSetting = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tabListRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  const aboutGym = "/settings/gym/about"
  const routeLocation = "/settings/gym/location"
  const routePayments = "/settings/gym/payments"
  const routePlan = "/settings/gym/plan"

  const tabItems = [
    { route: aboutGym, label: "Tentang Gym" },
    { route: routeLocation, label: "Daftar Lokasi" },
    { route: routePlan, label: "Langganan" },
    { route: routePayments, label: "Pembayaran" },
  ]

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
    <div className="h-full">
      <div className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-16 z-10 w-full backdrop-blur">
        <Tabs
          value={pathname}
          onValueChange={(value) => navigate(value)}
          className="w-full"
        >
          <div className="scrollbar-hide overflow-x-auto">
            <TabsList
              ref={tabListRef}
              className={cn(
                "inline-flex h-12 w-full items-center justify-start",
                "rounded-none border-b-2 bg-transparent p-0",
                "space-x-0"
              )}
            >
              {tabItems.map((item) => (
              <TabsTrigger
                  key={item.route}
                  ref={pathname === item.route ? activeTabRef : undefined}
                  value={item.route}
                  className={cn(
                    "relative inline-flex items-center justify-center rounded-none border-t-0 border-r-0 border-b-2 border-l-0 border-transparent whitespace-nowrap",
                    "px-4 py-3 text-sm font-medium transition-all",
                    "border-b-2 border-transparent bg-transparent",
                    "hover:text-foreground focus-visible:outline-none",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "data-[state=active]:border-primary! data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:shadow-none",
                    "text-muted-foreground hover:text-foreground/80"
                  )}
                >
                  {item.label}
              </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </div>
    </div>
  )
}

export default LayoutGymSetting
