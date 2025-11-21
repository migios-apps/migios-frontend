import React, { useEffect, useRef } from "react"
import { MoneyArchive, Moneys, Wallet1 } from "iconsax-reactjs"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LayoutFinance = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tabListRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  const routeRekening = "/finance/rekening"
  const routeCategory = "/finance/category"
  const routeHistory = "/finance/history"

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
        <h3 className="text-foreground">Finance</h3>
      </div>
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
                ref={pathname === routeRekening ? activeTabRef : undefined}
                value={routeRekening}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                <Wallet1
                  color="currentColor"
                  size={20}
                  variant="Bold"
                  className="mr-2"
                />
                Rekening
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routeCategory ? activeTabRef : undefined}
                value={routeCategory}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                <Moneys
                  color="currentColor"
                  size={20}
                  variant="Bold"
                  className="mr-2"
                />
                Category
              </TabsTrigger>
              <TabsTrigger
                ref={pathname === routeHistory ? activeTabRef : undefined}
                value={routeHistory}
                className="data-[state=active]:border-primary min-w-fit rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent"
              >
                <MoneyArchive
                  color="currentColor"
                  size={20}
                  variant="Bold"
                  className="mr-2"
                />
                History
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
      <div className="relative">{children || <Outlet />}</div>
    </div>
  )
}

export default LayoutFinance
