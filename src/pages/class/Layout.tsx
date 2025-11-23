import React from "react"
import { Add, Calendar, DocumentText1, Layer } from "iconsax-reactjs"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormClassPage from "@/components/form/class/FormClassPage"
import FromClassCategory from "@/components/form/class/FromClassCategory"
import {
  resetClassCategoryPageForm,
  resetClassPageForm,
  useClassCategoryPageForm,
  useClassPageForm,
} from "@/components/form/class/validation"

const LayoutClasses = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const routeSchedule = "/class/schedule"
  const routeList = "/class/list"
  const routeCategory = "/class/category"

  const formProps = useClassPageForm()
  const formPropsCategory = useClassCategoryPageForm()
  const [showForm, setShowForm] = React.useState<boolean>(false)
  const [showFormCategory, setShowFormCategory] = React.useState<boolean>(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3>
          Class{" "}
          {pathname === routeSchedule
            ? "schedule"
            : pathname === routeCategory
              ? "category"
              : "list"}
        </h3>
        {pathname !== routeCategory ? (
          <Button
            variant="default"
            onClick={() => {
              resetClassPageForm(formProps)
              setShowForm(true)
            }}
          >
            <Add color="currentColor" size={20} />
            Add new class
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => {
              resetClassCategoryPageForm(formPropsCategory)
              setShowFormCategory(true)
            }}
          >
            <Add color="currentColor" size={20} />
            Add new category
          </Button>
        )}
      </div>
      <Tabs value={pathname} onValueChange={(tab) => navigate(tab)}>
        <TabsList>
          <TabsTrigger value={routeSchedule} className="min-w-[140px]">
            <Calendar color="currentColor" size={20} variant="Bold" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value={routeList} className="min-w-[140px]">
            <DocumentText1 color="currentColor" size={20} variant="Bold" />
            Class List
          </TabsTrigger>
          <TabsTrigger value={routeCategory} className="min-w-[140px]">
            <Layer color="currentColor" size={20} variant="Bold" />
            Category
          </TabsTrigger>
        </TabsList>
        <div className="relative mt-4">{children || <Outlet />}</div>
      </Tabs>

      <FormClassPage
        open={showForm}
        type={"create"}
        formProps={formProps}
        onClose={() => setShowForm(false)}
      />

      <FromClassCategory
        open={showFormCategory}
        type={"create"}
        formProps={formPropsCategory}
        onClose={() => setShowFormCategory(false)}
      />
    </div>
  )
}

export default LayoutClasses
