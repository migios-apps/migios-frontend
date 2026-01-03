import { useState, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Filter } from "@/services/api/@types/api"
import {
  TrainerDetail,
  TrainerMember,
  TrainerPackage,
} from "@/services/api/@types/trainer"
import { apiGetCuttingSessionLists } from "@/services/api/CuttingSessionService"
import { apiGetEventListOriginal } from "@/services/api/EventService"
import {
  Calendar2,
  Clock,
  User,
  Book1 as BookOpen,
  ArrowSwapHorizontal as ArrowRightLeft,
  Add as Plus,
  Edit2 as Pencil,
} from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/animate-ui/components/animate/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/animate-ui/components/radix/sheet"
import { dayOfWeekOptions } from "@/components/form/event/events"
import DialogCreatePTSchedule, {
  DialogCreatePTScheduleProps,
} from "./CreatePTSchedule"
import {
  initTrainerEventValue,
  useEventTrainerValidation,
} from "./CreatePTSchedule/validation"
import TransferMemberDialog from "./TransferMemberDialog"

interface MemberDetailSheetProps {
  member: TrainerMember | null
  trainer: TrainerDetail | null
  pkg: TrainerPackage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MemberDetailSheet = ({
  member,
  trainer,
  pkg,
  open,
  onOpenChange,
}: MemberDetailSheetProps) => {
  const [activeTab, setActiveTab] = useState("package")
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [openDialogSchedule, setOpenDialogSchedule] = useState(false)
  const [scheduleType, setScheduleType] =
    useState<DialogCreatePTScheduleProps["type"]>("create")
  const formEventTrainer = useEventTrainerValidation()

  const { data, isFetchingNextPage, isLoading, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [
        QUERY_KEY.originalEvents,
        member?.id,
        pkg?.package_id,
        pkg?.member_package_id,
        member,
      ],
      enabled: !!member && open,
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        if (!member) return null
        const res = await apiGetEventListOriginal({
          page: pageParam,
          per_page: 10,
          sort_column: "id",
          sort_type: "desc",
          search: [
            {
              search_column: "member_id",
              search_condition: "=",
              search_text: member.id.toString(),
            },
            ...(pkg?.package_id
              ? [
                  {
                    search_operator: "and",
                    search_column: "package_id",
                    search_condition: "=",
                    search_text: pkg.package_id.toString(),
                  },
                ]
              : []),
            ...(pkg?.member_package_id
              ? [
                  {
                    search_operator: "and",
                    search_column: "member_package_id",
                    search_condition: "=",
                    search_text: pkg.member_package_id.toString(),
                  },
                ]
              : []),
          ] as Filter[],
        })
        return res
      },
      getNextPageParam: (lastPage) => {
        const meta = lastPage?.data?.meta
        if (!meta) return undefined
        return meta.page !== meta.total_page ? meta.page + 1 : undefined
      },
    })

  const {
    data: historyData,
    isFetchingNextPage: isFetchingMoreHistory,
    isLoading: isLoadingHistory,
    hasNextPage: hasNextPageHistory,
    fetchNextPage: fetchNextHistory,
  } = useInfiniteQuery({
    queryKey: [
      QUERY_KEY.cuttingSessions,
      member?.id,
      pkg?.member_package_id,
      member,
    ],
    enabled: !!member && open,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!member) return null
      const res = await apiGetCuttingSessionLists({
        page: pageParam,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        search: [
          // {
          //   search_column: "type",
          //   search_condition: "=",
          //   search_text: "pt_program",
          // },
          ...(pkg?.member_package_id
            ? [
                {
                  search_operator: "and",
                  search_column: "member_package_id",
                  search_condition: "=",
                  search_text: pkg.member_package_id.toString(),
                },
              ]
            : []),
        ] as Filter[],
      })
      return res
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.data?.meta
      if (!meta) return undefined
      return meta.page !== meta.total_page ? meta.page + 1 : undefined
    },
  })

  const listData = useMemo(
    () => (data ? data.pages.flatMap((page) => page?.data.data || []) : []),
    [data]
  )

  const listHistory = useMemo(
    () =>
      historyData
        ? historyData.pages.flatMap((page) => page?.data.data || [])
        : [],
    [historyData]
  )

  const handleCreateSchedule = (type: DialogCreatePTScheduleProps["type"]) => {
    formEventTrainer.setValue("events", [
      {
        ...initTrainerEventValue,
        frequency: type === "create_daily" ? "daily" : "weekly",
        title: pkg?.package_name || "",
        start_date: dayjs(pkg?.start_date).format("YYYY-MM-DD"),
        end_date: dayjs(pkg?.end_date).format("YYYY-MM-DD"),
        start_time: dayjs().format("HH:mm"),
        end_time: dayjs().add(1, "hour").format("HH:mm"),
        selected_weekdays: [
          ...(type === "create"
            ? [
                {
                  day_of_week: dayjs()
                    .locale("en")
                    .format("dddd")
                    .toLowerCase(),
                  start_time: dayjs().format("HH:mm"),
                  end_time: dayjs().add(1, "hour").format("HH:mm"),
                },
              ]
            : []),
        ],
      },
    ])
    setOpenDialogSchedule(true)
    setScheduleType(type)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          floating
          className="flex flex-col gap-0 sm:max-w-md"
        >
          <SheetHeader className="p-4 pb-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <SheetTitle className="text-base font-semibold tracking-tight">
                  Detail Paket Member
                </SheetTitle>
              </div>
            </div>
            <SheetDescription className="hidden" />
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-3 p-4 pt-1">
                {/* Single Card Integrated Profile */}
                <div className="flex flex-col items-center">
                  {/* Trainer Section (Inside Card) - Vertical Layout */}
                  {trainer && (
                    <div className="flex w-full flex-col items-center pt-2">
                      <Avatar className="h-10 w-10 border shadow-xs">
                        <AvatarImage src={trainer.photo || ""} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
                          {trainer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-2 flex flex-col items-center text-center">
                        <p className="mb-1 text-sm leading-none font-semibold tracking-tight">
                          {trainer.name}
                        </p>
                        <span className="text-muted-foreground text-xs">
                          {trainer.code}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20 mt-1 h-4 border-none text-[10px] font-semibold shadow-none"
                        >
                          Trainer
                        </Badge>
                      </div>

                      {/* Precise Connecting Line */}
                      <div className="mt-1 flex h-8 w-0.5 flex-col items-center">
                        <div className="border-primary h-full w-full border-l-2 border-dashed opacity-40" />
                      </div>
                    </div>
                  )}

                  {/* Member Section (Inside Card) */}
                  <div
                    className={cn(
                      "flex w-full flex-col items-center",
                      trainer ? "pt-1" : "pt-4"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-16 w-16 border shadow-md">
                        <AvatarImage src={member?.photo || ""} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <Badge
                        className={cn(
                          "border-background absolute -bottom-1 left-1/2 z-30 h-3.5 -translate-x-1/2 border-2 px-1.5 text-[9px] font-semibold whitespace-nowrap shadow-sm transition-all",
                          statusColor[
                            member?.membership_status as keyof typeof statusColor
                          ]
                        )}
                      >
                        {member?.membership_status}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-col items-center text-center">
                      <h2 className="text-base font-semibold tracking-tight">
                        {member?.name}
                      </h2>
                      <div className="text-muted-foreground text-xs">
                        {member?.code}
                      </div>
                    </div>
                  </div>
                </div>
                <Card className="relative mt-4 overflow-hidden border-none bg-transparent p-0 shadow-none">
                  <CardContent className="border-none p-0">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-primary/10 text-primary rounded-lg p-2">
                          <BookOpen className="h-4 w-4" variant="Broken" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs font-medium">
                            Nama Paket
                          </span>
                          <span className="text-xs font-bold">
                            {pkg?.package_name}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/5 text-primary h-5 px-1.5 text-[10px] uppercase"
                      >
                        {pkg?.package_type?.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg border p-2 text-center">
                        <p className="text-muted-foreground mb-1 text-xs">
                          Total Sesi
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold">
                            {pkg?.total_available_session}
                          </span>
                          <span className="text-muted-foreground text-xs font-semibold">
                            Sesi
                          </span>
                        </div>
                      </div>
                      <div className="bg-muted/50 flex flex-col items-center justify-center rounded-lg border p-2 text-center">
                        <p className="text-muted-foreground mb-1 text-xs">
                          Durasi
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold">
                            {pkg?.duration}
                          </span>
                          <span className="text-muted-foreground text-xs font-semibold capitalize">
                            {pkg?.duration_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 flex items-center justify-between rounded-lg border border-dashed p-2 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-muted-foreground text-xs">Mulai</p>
                        <div className="flex items-center gap-1 font-semibold">
                          <Calendar2
                            variant="Bulk"
                            className="text-primary h-4 w-4"
                          />
                          {dayjs(pkg?.start_date).format("DD MMM YYYY")}
                        </div>
                      </div>
                      <div className="bg-border h-8 w-px" />
                      <div className="flex flex-col gap-0.5 text-right">
                        <p className="text-muted-foreground text-xs">
                          Berakhir
                        </p>
                        <div className="flex items-center justify-end gap-1 font-semibold">
                          <span className="text-red-500">
                            {dayjs(pkg?.end_date).format("DD MMM YYYY")}
                          </span>
                          <Calendar2
                            variant="Bulk"
                            className="h-4 w-4 text-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs Section - Simplified Styling */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mt-4 w-full"
                >
                  <TabsList className="h-auto w-full justify-start gap-1">
                    <TabsTrigger value="package">
                      <Calendar2 className="h-3 w-3" variant="Bulk" />
                      Jadwal Sesi
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <Clock className="h-3 w-3" variant="Bulk" />
                      Riwayat Sesi
                    </TabsTrigger>
                  </TabsList>

                  <TabsContents>
                    <TabsContent value="package" className="space-y-2 pt-1">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold tracking-tight">
                            {/* Jadwal Latihan */}
                          </h3>

                          {listData.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-dashed"
                              onClick={() => {
                                handleCreateSchedule("create_daily")
                              }}
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Tambah Hari
                            </Button>
                          )}
                        </div>

                        {isLoading ? (
                          <div className="space-y-2">
                            {[1, 2].map((i) => (
                              <Card key={i} className="p-3">
                                <div className="flex flex-col gap-2">
                                  <Skeleton className="h-4 w-3/4" />
                                  <Skeleton className="h-3 w-1/2" />
                                  <div className="flex gap-1">
                                    <Skeleton className="h-5 w-12 rounded-md" />
                                    <Skeleton className="h-5 w-12 rounded-md" />
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : listData.length === 0 ? (
                          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                            <div className="bg-primary/10 text-primary rounded-full p-3">
                              <Calendar2 className="h-6 w-6" variant="Bulk" />
                            </div>
                            <h3 className="mt-3 text-sm font-semibold">
                              Jadwal Latihan Belum Diatur
                            </h3>
                            <p className="text-muted-foreground mt-1 text-xs">
                              Belum ada jadwal latihan yang dibuat untuk paket
                              ini. Tambahkan jadwal untuk memulai.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-4"
                              onClick={() => {
                                handleCreateSchedule("create")
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Tambah Jadwal
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {listData.map((item) => (
                              <Card
                                key={item.id}
                                className="overflow-hidden border p-0 shadow-none"
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex flex-col gap-0.5">
                                      <h4 className="text-sm leading-tight font-bold">
                                        {item.title}
                                      </h4>
                                      <p className="text-muted-foreground line-clamp-1 text-xs">
                                        {item.description ||
                                          "Tidak ada deskripsi"}
                                      </p>
                                      <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs font-medium">
                                        {item.frequency === "daily" ? (
                                          <span className="flex items-center gap-1">
                                            <div className="h-1 w-1 rounded-full bg-orange-400" />
                                            Jadwal Harian
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1">
                                            <div className="h-1 w-1 rounded-full bg-blue-400" />
                                            Diulang setiap minggu s/d{" "}
                                            {dayjs(item.end_date).format(
                                              "DD MMM YYYY"
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="secondary"
                                      size="icon"
                                      className="text-primary hover:text-primary/80 h-8 w-8"
                                      onClick={() => {
                                        formEventTrainer.setValue("events", [
                                          {
                                            ...item,
                                            selected_weekdays:
                                              item.selected_weekdays,
                                            is_specific_time:
                                              item.frequency === "daily"
                                                ? false
                                                : true,
                                          },
                                        ])
                                        setScheduleType(
                                          item.frequency === "daily"
                                            ? "update_daily"
                                            : "update_weekly"
                                        )
                                        setOpenDialogSchedule(true)
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                                    {item.frequency === "daily" ? (
                                      <Badge
                                        variant="outline"
                                        className="flex flex-col items-start gap-0.5 rounded-md px-2 py-1"
                                        style={{
                                          backgroundColor:
                                            item.background_color || "",
                                          color: item.color || "",
                                          borderColor:
                                            item.color || "transparent",
                                        }}
                                      >
                                        <span className="text-xs font-bold capitalize">
                                          {dayjs(item.start_date).format(
                                            "DD MMM YYYY"
                                          )}
                                        </span>
                                        <span className="text-xs">
                                          {item.start_time} - {item.end_time}
                                        </span>
                                      </Badge>
                                    ) : (
                                      item.selected_weekdays?.map((sw, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="flex flex-col items-start gap-0.5 rounded-md px-2 py-1"
                                          style={{
                                            backgroundColor:
                                              item.background_color || "",
                                            color: item.color || "",
                                            borderColor:
                                              item.color || "transparent",
                                          }}
                                        >
                                          <span className="text-xs font-bold capitalize">
                                            {
                                              dayOfWeekOptions.find(
                                                (opt) =>
                                                  opt.value === sw.day_of_week
                                              )?.label
                                            }
                                          </span>
                                          <span className="text-xs">
                                            {sw.start_time} - {sw.end_time}
                                          </span>
                                        </Badge>
                                      ))
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}

                            {hasNextPage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                              >
                                {isFetchingNextPage
                                  ? "Loading..."
                                  : "Muat Lebih Banyak"}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-0 pt-3">
                      {isLoadingHistory ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-3">
                              <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-10 w-full rounded-md" />
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : listHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                          <div className="bg-primary/10 text-primary rounded-full p-3">
                            <Clock className="h-6 w-6" variant="Bulk" />
                          </div>
                          <h3 className="mt-3 text-sm font-semibold">
                            Belum Ada Riwayat Sesi
                          </h3>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Member ini belum pernah melakukan sesi latihan untuk
                            paket ini.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="relative space-y-0 pl-1">
                            <div className="bg-border absolute top-1.5 left-[5.5px] h-[calc(100%-12px)] w-px" />

                            {listHistory.map((item, i) => (
                              <div
                                key={item.id}
                                className="group relative flex items-start gap-3 pb-4 last:pb-1"
                              >
                                <div className="border-background bg-primary relative z-10 flex h-3 w-3 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110">
                                  <div className="h-1 w-1 rounded-full bg-white" />
                                </div>

                                <div className="bg-muted/50 hover:bg-muted flex-1 rounded-lg p-2.5 shadow-none transition-all">
                                  <div className="mb-1.5 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Calendar2
                                        variant="Bulk"
                                        className="h-4 w-4"
                                      />
                                      <p className="text-xs font-semibold tracking-wide">
                                        {dayjs(item.start_date).format(
                                          "DD MMM YYYY • HH:mm"
                                        )}{" "}
                                        - {dayjs(item.end_date).format("HH:mm")}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="h-3.5 px-1 text-[10px] font-semibold"
                                    >
                                      Sesi #{listHistory.length - i}
                                    </Badge>
                                  </div>
                                  <p className="text-sm leading-tight font-semibold">
                                    Latihan Personal bersama{" "}
                                    {item.trainer?.name}
                                  </p>
                                  {item.description && (
                                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed font-medium">
                                      {item.description}
                                    </p>
                                  )}

                                  {item.exercises &&
                                    item.exercises.length > 0 && (
                                      <div className="mt-2 space-y-1.5">
                                        <div className="bg-border/50 h-px w-full" />
                                        <div className="grid grid-cols-1 gap-1.5">
                                          {item.exercises.map((ex: any) => (
                                            <div
                                              key={ex.id}
                                              className="flex flex-col gap-0.5"
                                            >
                                              <p className="text-[11px] font-bold">
                                                {ex.name}
                                              </p>
                                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <Badge
                                                  variant="outline"
                                                  className="bg-primary/5 h-4 px-1 text-[9px] font-medium"
                                                >
                                                  {ex.sets} Sets × {ex.reps}{" "}
                                                  Reps
                                                </Badge>
                                                {ex.weight_kg > 0 && (
                                                  <Badge
                                                    variant="outline"
                                                    className="h-4 bg-orange-500/5 px-1 text-[9px] font-medium text-orange-600"
                                                  >
                                                    {ex.weight_kg} Kg
                                                  </Badge>
                                                )}
                                                <Badge
                                                  variant="outline"
                                                  className="h-4 bg-blue-500/5 px-1 text-[9px] font-medium text-blue-600"
                                                >
                                                  RPE {ex.rpe}
                                                </Badge>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {hasNextPageHistory && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 w-full text-xs"
                              onClick={() => fetchNextHistory()}
                              disabled={isFetchingMoreHistory}
                            >
                              {isFetchingMoreHistory
                                ? "Memuat..."
                                : "Muat Lebih Banyak"}
                            </Button>
                          )}

                          <div className="mt-4 flex items-center justify-center">
                            <div className="bg-border h-px flex-1" />
                            <p className="text-muted-foreground px-3 text-xs font-semibold">
                              Timeline Riwayat
                            </p>
                            <div className="bg-border h-px flex-1" />
                          </div>
                        </>
                      )}
                    </TabsContent>
                  </TabsContents>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
          <SheetFooter className="px-4 py-2">
            <div className="flex items-center justify-between">
              <Button
                variant="default"
                size="sm"
                className="w-full"
                disabled={isLoading}
                onClick={() => setIsTransferDialogOpen(true)}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Ganti Trainer
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <TransferMemberDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        onSuccess={() => {
          setIsTransferDialogOpen(false)
          onOpenChange(false)
        }}
        member={member}
        trainer={trainer}
        pkg={pkg}
        hasEvent={listData.length > 0}
      />

      <DialogCreatePTSchedule
        formInstance={formEventTrainer}
        open={openDialogSchedule}
        type={scheduleType}
        onOpenChange={setOpenDialogSchedule}
        member={member}
        trainer={trainer}
        pkg={pkg}
      />
    </>
  )
}

export default MemberDetailSheet
