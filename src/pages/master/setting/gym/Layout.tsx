import React, { useEffect, useRef } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
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
                ref={pathname === aboutGym ? activeTabRef : undefined}
                value={aboutGym}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Tentang Gym
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routeLocation ? activeTabRef : undefined}
                value={routeLocation}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Daftar Lokasi
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routePlan ? activeTabRef : undefined}
                value={routePlan}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Langganan
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routePayments ? activeTabRef : undefined}
                value={routePayments}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                Pembayaran
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

export default LayoutGymSetting
