import React, { useEffect, useRef } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LayoutOtherSetting = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tabListRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  const routeCommission = "/settings/others/commission"
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

  return (
    <div className="h-full">
      <div className="border-border bg-background sticky top-16 z-10 w-full border-b shadow-sm">
        <Tabs
          value={pathname}
          onValueChange={(value) => navigate(value)}
          className="w-full"
        >
          <div className="overflow-x-auto">
            <TabsList
              ref={tabListRef}
              className="h-auto w-full min-w-fit justify-start rounded-none border-0 bg-transparent p-0"
            >
              <TabsTrigger
                ref={pathname === routeCommission ? activeTabRef : undefined}
                value={routeCommission}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Commission
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routeTax ? activeTabRef : undefined}
                value={routeTax}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Tax
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routeInvoice ? activeTabRef : undefined}
                value={routeInvoice}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Invoice
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routeLoyaltyPoint ? activeTabRef : undefined}
                value={routeLoyaltyPoint}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Loyalty Point
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routeMembership ? activeTabRef : undefined}
                value={routeMembership}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Membership
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-6 md:px-8">
        {children || <Outlet />}
      </div>
    </div>
  )
}

export default LayoutOtherSetting
