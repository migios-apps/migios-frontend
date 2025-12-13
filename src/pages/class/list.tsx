import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { ClassCategoryDetail } from "@/services/api/@types/class"
import {
  apiGetClassCategory,
  apiGetClassList,
} from "@/services/api/ClassService"
import dayjs from "dayjs"
import { Chart21, Layer, Profile2User } from "iconsax-reactjs"
import { ArrowRight, Flame } from "lucide-react"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import InputDebounce from "@/components/ui/input-debounce"
import Loading from "@/components/ui/loading"
import { FullPagination } from "@/components/ui/pagination"
import {
  ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import FormClassPage from "@/components/form/class/FormClassPage"
import {
  LevelClassOptions,
  useClassPageForm,
} from "@/components/form/class/validation"
import { EventFrequency } from "@/components/form/event/events"
import LayoutClasses from "./Layout"

const ClassIndex = () => {
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const [showForm, setShowForm] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<"create" | "update">("create")
  const [category, setCategory] = React.useState<ClassCategoryDetail>()

  const formProps = useClassPageForm()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.classes, tableData, category?.id],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetClassList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "id",
              sort_type: "desc",
            }),
        search: [
          ...((tableData.query === ""
            ? []
            : [
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ]) as Filter[]),
          ...(category?.id
            ? ([
                {
                  search_operator: "and",
                  search_column: "category.id",
                  search_condition: "eq",
                  search_text: category?.id.toString(),
                },
              ] as unknown as Filter[])
            : []),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listData = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const getClassCategoryList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<ClassCategoryDetail, GroupBase<ClassCategoryDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetClassCategory({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        search: [
          (inputValue || "").length > 0
            ? ({
                search_column: "name",
                search_condition: "like",
                search_text: `${inputValue}`,
              } as any)
            : null,
        ],
      })
      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: response.data.data,
          hasMore: response.data.data.length >= 1,
          additional: {
            page: additional!.page + 1,
          },
        })
      })
    },
    []
  )

  return (
    <LayoutClasses>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <SelectAsyncPaginate
            isClearable
            isLoading={isLoading}
            loadOptions={getClassCategoryList as any}
            additional={{ page: 1 }}
            placeholder="Filter by Category"
            className="w-full md:max-w-max"
            value={category}
            getOptionLabel={(option) => option.name!}
            getOptionValue={(option) => option.id.toString()}
            debounceTimeout={500}
            onChange={(option) => setCategory(option!)}
          />
          <InputDebounce
            placeholder="Search..."
            className="w-full"
            handleOnchange={(value) => {
              setTableData({
                ...tableData,
                query: value,
                pageIndex: 1,
              })
            }}
          />
        </div>
        <Loading loading={isLoading}>
          <div className="mt-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading || isFetchingNextPage
                ? // Skeleton cards
                  Array(6)
                    .fill(null)
                    .map((_, index) => (
                      <Card key={index} className="min-h-[140px]">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-6 w-20" />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                          <div className="mt-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="mt-2 h-5 w-3/4" />
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <Skeleton className="h-8 w-24 rounded-full" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                : listData.map((item, index) => {
                    const status = item.enabled ? "active" : "inactive"
                    const event = item.events[0]
                    return (
                      <Card key={index} className="gap-0">
                        <CardHeader>
                          <CardTitle>{item.name}</CardTitle>
                          <CardAction>
                            <Badge className={statusColor[status]}>
                              <span className="capitalize">{status}</span>
                            </Badge>
                          </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-4 py-2">
                          <Separator />

                          <div className="grid gap-3">
                            <div className="flex items-center gap-3">
                              <Profile2User
                                color="currentColor"
                                size={16}
                                variant="Bulk"
                                className="text-muted-foreground shrink-0"
                              />
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">
                                  Capacity
                                </div>
                                <div className="text-sm font-medium">
                                  {item.capacity}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Chart21
                                color="currentColor"
                                size={16}
                                variant="Bulk"
                                className="text-muted-foreground shrink-0"
                              />
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">
                                  Level
                                </div>
                                <div className="text-sm font-medium">
                                  {
                                    LevelClassOptions.find(
                                      (cls) => cls.value === item.level
                                    )?.label
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Layer
                                color="currentColor"
                                size={16}
                                variant="Bulk"
                                className="text-muted-foreground shrink-0"
                              />
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">
                                  Category
                                </div>
                                <div className="text-sm font-medium">
                                  {item.category?.name || "-"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Flame
                                size={16}
                                className="text-muted-foreground shrink-0"
                              />
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">
                                  Calorie Burn
                                </div>
                                <div className="text-sm font-medium">
                                  {item.burn_calories} Cal
                                </div>
                              </div>
                            </div>
                          </div>

                          {item.events.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-muted-foreground text-xs font-medium">
                                Schedule
                              </div>
                              {event?.frequency === EventFrequency.daily ? (
                                <div className="text-sm">
                                  {`${dayjs(event.start).format("DD MMM YYYY HH:mm")} - ${dayjs(event.end).format("DD MMM YYYY HH:mm")}`}
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {event.selected_weekdays?.map(
                                    (weekday, weekdayIndex) => (
                                      <Badge
                                        key={weekdayIndex}
                                        variant="outline"
                                        className="flex flex-col items-start gap-1 px-3 py-1.5"
                                      >
                                        <span className="text-xs font-semibold capitalize">
                                          {weekday.day_of_week}
                                        </span>
                                        <span className="text-xs">
                                          {weekday.start_time} -{" "}
                                          {weekday.end_time}
                                        </span>
                                      </Badge>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {item.description && (
                            <div className="space-y-2">
                              <div className="text-muted-foreground text-xs font-medium">
                                Description
                              </div>
                              <p className="text-muted-foreground text-sm">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex items-center justify-between border-t pt-2!">
                          <div className="flex items-center">
                            {item.allow_all_instructor ? (
                              <Badge className={statusColor["active"]}>
                                <span className="capitalize">
                                  All Instructor
                                </span>
                              </Badge>
                            ) : (
                              <div className="flex items-center -space-x-2">
                                {item.instructors
                                  ?.slice(0, 3)
                                  .map(
                                    (
                                      instructor: any,
                                      instructorIndex: number
                                    ) => (
                                      <Tooltip key={instructorIndex}>
                                        <TooltipTrigger asChild>
                                          <Avatar className="border-background size-7 cursor-pointer border-2">
                                            <AvatarImage
                                              src={instructor.photo || ""}
                                              alt={instructor.name || ""}
                                            />
                                            <AvatarFallback className="text-xs">
                                              {instructor.name
                                                ?.charAt(0)
                                                ?.toUpperCase() || "?"}
                                            </AvatarFallback>
                                          </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{instructor.name || "Unknown"}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )
                                  )}
                                {(item.instructors?.length || 0) > 3 && (
                                  <Avatar className="bg-muted border-background size-7 border-2">
                                    <AvatarFallback className="text-xs">
                                      +{(item.instructors?.length || 0) - 3}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowForm(true)
                              setFormType("update")
                              formProps.setValue("id", item.id)
                              formProps.setValue("photo", item.photo)
                              formProps.setValue("name", item.name)
                              formProps.setValue("capacity", item.capacity)
                              formProps.setValue("level", item.level ?? null)
                              formProps.setValue(
                                "burn_calories",
                                item.burn_calories ?? null
                              )
                              formProps.setValue(
                                "category",
                                item.category ?? null
                              )
                              formProps.setValue(
                                "description",
                                item.description ?? null
                              )
                              formProps.setValue(
                                "allow_all_instructor",
                                item.allow_all_instructor
                              )
                              formProps.setValue("enabled", item.enabled)
                              formProps.setValue("start_date", item.start_date)
                              formProps.setValue("end_date", item.end_date)
                              formProps.setValue("is_forever", item.is_forever)
                              formProps.setValue("is_publish", item.is_publish)
                              formProps.setValue(
                                "available_for",
                                item.available_for
                              )
                              formProps.setValue(
                                "visible_for",
                                item.visible_for
                              )
                              formProps.setValue("class_type", item.class_type)
                              formProps.setValue(
                                "embed_video",
                                item.embed_video ?? null
                              )
                              formProps.setValue(
                                "background_color",
                                item.background_color ?? null
                              )
                              formProps.setValue("color", item.color ?? null)
                              formProps.setValue("start_time", item.start_time)
                              formProps.setValue(
                                "duration_time",
                                item.duration_time
                              )
                              formProps.setValue(
                                "duration_time_type",
                                item.duration_time_type as any
                              )
                              // Instructors will be set by useEffect in FormClassPage
                              // formProps.setValue('instructors', item.instructors)
                            }}
                          >
                            Edit class
                            <ArrowRight size={16} />
                          </Button>
                        </CardFooter>
                      </Card>
                    )
                  })}
            </div>

            <div className="mt-3">
              <FullPagination
                displayTotal
                total={total}
                pageSize={tableData.pageSize}
                currentPage={tableData.pageIndex}
                onChange={(value) => {
                  setTableData({
                    ...tableData,
                    pageIndex: value,
                  })
                }}
                onPageSizeChange={(value) => {
                  setTableData({
                    ...tableData,
                    pageSize: value,
                    pageIndex: 1,
                  })
                }}
              />
            </div>
          </div>
        </Loading>

        <FormClassPage
          open={showForm}
          type={formType}
          formProps={formProps}
          onClose={() => setShowForm(false)}
        />
      </div>
    </LayoutClasses>
  )
}

export default ClassIndex
