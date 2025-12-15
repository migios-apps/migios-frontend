import React, { useEffect, useRef } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LayoutOtherSetting = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tabListRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  const routeSales = "/settings/others/sales"
  const routeTax = "/settings/others/taxes"
  const routeInvoice = "/settings/others/invoice"
  const routeLoyaltyPoint = "/settings/others/loyalty-point"
  const routeMembership = "/settings/others/membership"

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

  const tabItems = [
    { route: routeSales, label: "Penjualan" },
    { route: routeTax, label: "Pajak" },
    { route: routeInvoice, label: "Invoice" },
    { route: routeLoyaltyPoint, label: "Poin Loyalitas" },
    { route: routeMembership, label: "Keanggotaan" },
  ]

  return (
    <>
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
    </>
  )
}

export default LayoutOtherSetting
