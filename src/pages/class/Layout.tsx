import React from "react"
import { Calendar, DocumentText1, Layer } from "iconsax-reactjs"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const LayoutClasses = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const routeSchedule = "/class/schedule"
  const routeList = "/class/list"
  const routeCategory = "/class/category"

  return (
    <div className="relative">
      <div className="text-muted-foreground/95 supports-backdrop-filter:text-muted-foreground/60 sticky top-16 z-10 w-full py-2 backdrop-blur">
        <Tabs value={pathname} onValueChange={(tab) => navigate(tab)}>
          <div className="scrollbar-hide flex justify-start overflow-x-auto px-4 md:justify-center md:px-6 lg:px-8">
            <TabsList className="w-auto md:w-full">
              <TabsTrigger value={routeSchedule} className="min-w-[140px]">
                <Calendar color="currentColor" size={20} variant="Bold" />
                Jadwal
              </TabsTrigger>
              <TabsTrigger value={routeList} className="min-w-[140px]">
                <DocumentText1 color="currentColor" size={20} variant="Bold" />
                Daftar Kelas
              </TabsTrigger>
              <TabsTrigger value={routeCategory} className="min-w-[140px]">
                <Layer color="currentColor" size={20} variant="Bold" />
                Kategori
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
      <div className="relative py-8">{children || <Outlet />}</div>
    </div>
  )
}

export default LayoutClasses
