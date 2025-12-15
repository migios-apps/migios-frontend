import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { ClassCategoryDetail } from "@/services/api/@types/class"
import { ClassDetail } from "@/services/api/@types/class"
import { EmployeeDetail } from "@/services/api/@types/employee"
import {
  apiGetClassCategory,
  apiGetClassList,
} from "@/services/api/ClassService"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import {
  Add,
  Chart21,
  Layer,
  People,
  Profile2User,
  User,
} from "iconsax-reactjs"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
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
  WeekdayOptions,
  resetClassPageForm,
  useClassPageForm,
} from "@/components/form/class/validation"
import LayoutClasses from "./Layout"
import DialogClassDetail from "./components/DialogClassDetail"

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
  const [selectedClass, setSelectedClass] = React.useState<ClassDetail | null>(
    null
  )
  const [showDetail, setShowDetail] = React.useState<boolean>(false)
  const [trainer, setTrainer] = React.useState<EmployeeDetail | null>(null)

  const formProps = useClassPageForm()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.classes, tableData, category?.id, trainer],
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
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ]) as Filter[]),
          ...(category?.id
            ? ([
                {
                  search_operator: "and",
                  search_column: "category_id",
                  search_condition: "=",
                  search_text: category?.id.toString(),
                },
              ] as unknown as Filter[])
            : []),
          ...(trainer !== null
            ? ([
                {
                  search_operator: "and",
                  search_column: "instructors.id",
                  search_condition: "=",
                  search_text: trainer.id.toString(),
                },
              ] as Filter[])
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

  const getTrainerList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<EmployeeDetail, GroupBase<EmployeeDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetEmployeeList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        role_name: "trainer",
        search: [
          (inputValue || "").length > 0
            ? ({
                search_column: "name",
                search_condition: "like",
                search_text: `${inputValue}`,
              } as any)
            : null,
          {
            search_operator: "and",
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
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
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <SelectAsyncPaginate
            isClearable
            isLoading={isLoading}
            loadOptions={getClassCategoryList as any}
            additional={{ page: 1 }}
            placeholder="Filter kategori"
            className="w-full md:max-w-max"
            value={category}
            getOptionLabel={(option) => option.name!}
            getOptionValue={(option) => option.id.toString()}
            debounceTimeout={500}
            onChange={(option) => setCategory(option!)}
          />
          <SelectAsyncPaginate
            isClearable
            isLoading={isLoading}
            loadOptions={getTrainerList as any}
            additional={{ page: 1 }}
            placeholder="Filter instruktur"
            className="w-full md:max-w-[200px]"
            value={trainer}
            getOptionLabel={(option) => option.name!}
            getOptionValue={(option) => option.id.toString()}
            debounceTimeout={500}
            onChange={(option) => setTrainer(option!)}
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
          <Button
            variant="default"
            onClick={() => {
              resetClassPageForm(formProps)
              setShowForm(true)
            }}
          >
            <Add color="currentColor" />
            Tambah Kelas
          </Button>
        </div>
        <Loading loading={isLoading}>
          <div className="mt-1">
            <div className="flex flex-col gap-4">
              {isLoading || isFetchingNextPage ? (
                // Skeleton cards
                Array(6)
                  .fill(null)
                  .map((_, index) => (
                    <Card key={index} className="min-h-[200px] gap-0 p-4">
                      <CardHeader className="px-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                            <div className="flex flex-col gap-1">
                              <Skeleton className="h-7 w-48" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 px-0">
                        <Separator className="mb-4" />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <Skeleton className="h-4 w-4 shrink-0" />
                              <div className="flex-1 space-y-1">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 space-y-2">
                          <Skeleton className="h-3 w-12" />
                          <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-8 w-24 rounded-md" />
                            <Skeleton className="h-8 w-24 rounded-md" />
                            <Skeleton className="h-8 w-24 rounded-md" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : listData.length === 0 ? (
                <Card className="bg-accent shadow-none">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <People
                      variant="Bulk"
                      className="text-muted-foreground mb-4 h-20 w-20"
                    />
                    <h3 className="text-lg font-semibold">
                      Belum Ada Kelas Tersedia
                    </h3>
                    <p className="text-muted-foreground mt-2 text-center text-sm">
                      Kelas yang Anda cari tidak ditemukan.
                      <br />
                      Silakan tambahkan kelas baru atau ubah filter pencarian.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {listData.map((item, index) => {
                    return (
                      <Card
                        key={index}
                        className="hover:bg-muted/50 cursor-pointer gap-0 p-4 transition-colors"
                        onClick={() => {
                          setSelectedClass(item)
                          setShowDetail(true)
                        }}
                      >
                        <CardHeader className="px-0">
                          <CardTitle className="flex items-center gap-2">
                            <People
                              variant="Bulk"
                              className="h-10 w-10 shrink-0"
                            />
                            <div className="flex flex-col">
                              <span className="text-2xl font-semibold">
                                {item.name}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {dayjs(item.start_date).format("DD MMM YYYY")} -{" "}
                                {item.is_forever
                                  ? "Tidak Berakhir"
                                  : item.end_date
                                    ? dayjs(item.end_date).format("DD MMM YYYY")
                                    : "-"}
                              </span>
                            </div>
                          </CardTitle>
                          <CardAction>
                            <Badge
                              className={
                                statusColor[
                                  item.is_publish ? "active" : "inactive"
                                ]
                              }
                            >
                              <span className="capitalize">
                                {item.is_publish ? "Terjadwal" : "Draf"}
                              </span>
                            </Badge>
                          </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-4 px-0">
                          <Separator />
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                            <div className="flex items-center gap-3">
                              <User
                                color="#3b82f6"
                                size={16}
                                variant="Bulk"
                                className="shrink-0"
                              />
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">
                                  Kapasitas
                                </div>
                                <div className="text-sm font-medium">
                                  {item.capacity}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Chart21
                                color="#f59e0b"
                                size={16}
                                variant="Bulk"
                                className="shrink-0"
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

                            {/* Detailed Info: Category */}
                            <div className="flex items-center gap-3">
                              <Layer
                                color="#8b5cf6"
                                size={16}
                                variant="Bulk"
                                className="shrink-0"
                              />
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">
                                  Kategori
                                </div>
                                <div className="text-sm font-medium">
                                  {item.category?.name || "-"}
                                </div>
                              </div>
                            </div>

                            {/* Detailed Info: Instructor */}
                            <div className="flex items-center gap-3">
                              <Profile2User
                                color="#6366f1"
                                size={16}
                                variant="Bulk"
                                className="shrink-0"
                              />
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">
                                  Instruktur
                                </div>
                                <div className="flex items-center">
                                  {item.allow_all_instructor ? (
                                    <Badge className={statusColor["active"]}>
                                      <span className="capitalize">
                                        All Instructor
                                      </span>
                                    </Badge>
                                  ) : (
                                    <div className="flex items-center -space-x-2 pt-1">
                                      {item.instructors
                                        ?.slice(0, 3)
                                        .map((instructor, index) => (
                                          <Tooltip key={index}>
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
                                              <p>
                                                {instructor.name || "Unknown"}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        ))}
                                      {(item.instructors?.length || 0) > 3 && (
                                        <Avatar className="bg-muted border-background size-7 border-2">
                                          <AvatarFallback className="text-xs">
                                            +
                                            {(item.instructors?.length || 0) -
                                              3}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {item.weekdays_available.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-muted-foreground text-xs font-medium">
                                Jadwal
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {item.weekdays_available?.map(
                                  (weekday, weekdayIndex) => (
                                    <Badge
                                      key={weekdayIndex}
                                      variant="outline"
                                      className="flex flex-col items-start gap-1 rounded-md px-3 py-1.5"
                                      style={{
                                        backgroundColor:
                                          item.background_color || "",
                                        color: item.color || "",
                                        borderColor: item.color || "",
                                      }}
                                    >
                                      <span className="text-xs font-semibold capitalize">
                                        {
                                          WeekdayOptions.find(
                                            (opt) => opt.value === weekday.day
                                          )?.label
                                        }
                                      </span>
                                      <span className="text-xs">
                                        {item.start_time}
                                        {item.end_time
                                          ? ` - ${item.end_time}`
                                          : ""}
                                      </span>
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {item.description && (
                            <div className="space-y-2">
                              <div className="text-muted-foreground text-xs font-medium">
                                Deskripsi
                              </div>
                              <p className="bg-accent text-muted-foreground line-clamp-2 rounded-md p-2 text-sm">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </CardContent>
                        {/* <CardFooter className="flex items-center justify-between border-t pt-2!">
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
                              formProps.setValue(
                                "start_date",
                                item.start_date
                                  ? dayjs(item.start_date).format("YYYY-MM-DD")
                                  : ""
                              )
                              formProps.setValue(
                                "end_date",
                                item.end_date
                                  ? dayjs(item.end_date).format("YYYY-MM-DD")
                                  : null
                              )
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
                                item?.background_color as string
                              )
                              formProps.setValue("color", item?.color as string)
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
                              formProps.setValue(
                                "instructors",
                                item.instructors
                              )
                              formProps.setValue(
                                "weekdays_available",
                                item.weekdays_available?.map((weekday) => ({
                                  day: weekday.day,
                                })) || []
                              )
                              formProps.setValue(
                                "class_photos",
                                item.class_photos || []
                              )
                            }}
                          >
                            Edit class
                            <ArrowRight size={16} />
                          </Button>
                        </CardFooter> */}
                      </Card>
                    )
                  })}

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
              )}
            </div>
          </div>
        </Loading>

        <FormClassPage
          open={showForm}
          type={formType}
          formProps={formProps}
          onClose={() => setShowForm(false)}
        />

        <DialogClassDetail
          open={showDetail}
          onOpenChange={setShowDetail}
          item={selectedClass}
          onEdit={() => {
            if (selectedClass) {
              formProps.reset({
                id: selectedClass.id,
                name: selectedClass.name,
                capacity: selectedClass.capacity,
                level: selectedClass.level ?? undefined,
                burn_calories: selectedClass.burn_calories ?? undefined,
                description: selectedClass.description ?? undefined,
                allow_all_instructor: selectedClass.allow_all_instructor,
                enabled: selectedClass.enabled,
                start_date: selectedClass.start_date,
                end_date: selectedClass.end_date ?? undefined,
                is_forever: selectedClass.is_forever,
                is_publish: selectedClass.is_publish,
                available_for: selectedClass.available_for,
                visible_for: selectedClass.visible_for,
                class_type: selectedClass.class_type,
                embed_video: selectedClass.embed_video ?? undefined,
                background_color: selectedClass.background_color ?? undefined,
                color: selectedClass.color ?? undefined,
                start_time: selectedClass.start_time,
                duration_time: selectedClass.duration_time,
                duration_time_type: selectedClass.duration_time_type as any,
                category: selectedClass.category ?? undefined,
                instructors: selectedClass.instructors,
                weekdays_available: selectedClass.weekdays_available,
                class_photos: selectedClass.class_photos,
              })
              setFormType("update")
              setShowDetail(false)
              setShowForm(true)
            }
          }}
        />
      </div>
    </LayoutClasses>
  )
}

export default ClassIndex
