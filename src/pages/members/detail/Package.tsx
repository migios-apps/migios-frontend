import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { MemberDetail, MemberPackageTypes } from "@/services/api/@types/member"
import { apiGetMemberPackages } from "@/services/api/MembeService"
import { Eye } from "iconsax-reactjs"
import {
  ArrowDownUp,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Info,
  Layers,
  ListFilter,
  User,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter"
import InputDebounce from "@/components/ui/input-debounce"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import {
  AvailableForOptions,
  ClassTypeOptions,
  IsPublishOptions,
  LevelClassOptions,
  VisibleForOptions,
} from "@/components/form/class/validation"

interface PackageProps {
  member: MemberDetail | null
}

const PackageDetailDialog = ({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: MemberPackageTypes | null
}) => {
  if (!data) return null

  const isPT = data.package?.type === "pt_program"
  const isClass = data.package?.type === "class"
  const hasSessions = data.session_duration > 0 || (data.extra_session || 0) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        {/* Header Section */}
        <div className="bg-primary/5 space-y-4 p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="space-y-1">
              <span className="text-primary text-[10px] font-bold tracking-widest uppercase">
                Detail Paket
              </span>
              <DialogTitle className="text-xl font-black tracking-tight sm:text-2xl">
                {data.package?.name}
              </DialogTitle>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={cn(
                "border-none px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm",
                statusColor[data.duration_status]
              )}
            >
              {data.duration_status}
            </Badge>
          </div>
        </div>

        <div className="space-y-8 p-6 pt-2">
          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-2xl p-3 transition-all sm:gap-4 sm:p-4">
              <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl sm:size-10">
                <Layers className="text-primary size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                  Tipe Paket
                </p>
                <p className="text-xs leading-tight font-black sm:text-sm">
                  {isClass ? "Kelas" : isPT ? "Program PT" : "Membership"}
                </p>
              </div>
            </div>

            <div className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-2xl p-3 transition-all sm:gap-4 sm:p-4">
              <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl sm:size-10">
                <Clock className="text-primary size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                  Durasi
                </p>
                <p className="text-xs leading-tight font-black sm:text-sm">
                  {data.fduration}
                </p>
              </div>
            </div>

            <div className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-2xl p-3 transition-all sm:gap-4 sm:p-4">
              <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 sm:size-10">
                <Info className="size-4 text-blue-500 sm:size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                  ID Transaksi
                </p>
                <p className="text-xs leading-tight font-black sm:text-sm">
                  #{data.transaction_id}
                </p>
              </div>
            </div>

            {hasSessions && (
              <div className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-2xl p-3 transition-all sm:gap-4 sm:p-4">
                <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl sm:size-10">
                  <Dumbbell className="text-primary size-4 sm:size-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                    Total Sesi
                  </p>
                  <p className="text-base leading-none font-black sm:text-lg">
                    {data.session_duration + (data.extra_session || 0)}
                  </p>
                  {(data.extra_session || 0) > 0 && (
                    <p className="text-primary mt-1 text-[8px] font-bold uppercase sm:text-[9px]">
                      + {data.extra_session} Bonus
                    </p>
                  )}
                </div>
              </div>
            )}

            {(data.extra_day || 0) > 0 && (
              <div className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-2xl p-3 transition-all sm:gap-4 sm:p-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-green-500/10 sm:size-10">
                  <Calendar className="size-4 text-green-500 sm:size-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                    Extra Hari
                  </p>
                  <p className="text-base leading-none font-black sm:text-lg">
                    {data.extra_day} Hari
                  </p>
                </div>
              </div>
            )}

            {isPT && data.trainer && (
              <div className="bg-muted/30 hover:bg-muted/50 flex items-center gap-3 rounded-2xl p-3 transition-all sm:gap-4 sm:p-4">
                <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10 sm:size-10">
                  <User className="size-4 text-orange-500 sm:size-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                    Pelatih
                  </p>
                  <p className="line-clamp-1 text-base leading-none font-black sm:text-lg">
                    {data.trainer.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Dates Section */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-black tracking-tight uppercase">
              <Calendar className="text-primary size-4" />
              Masa Berlaku
            </h4>
            <div className="bg-muted/20 grid grid-cols-1 gap-6 rounded-2xl border p-5 sm:grid-cols-2">
              <div className="flex items-center gap-4">
                <div className="bg-background flex size-10 items-center justify-center rounded-full border shadow-sm">
                  <div className="size-2 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                    Tanggal Mulai
                  </p>
                  <p className="text-sm font-bold sm:text-base">
                    {dayjs(data.start_date).format("DD MMMM YYYY")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-background flex size-10 items-center justify-center rounded-full border shadow-sm">
                  <div className="size-2 rounded-full bg-red-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase sm:text-[10px]">
                    Berakhir Pada
                  </p>
                  <p className="text-sm font-bold sm:text-base">
                    {dayjs(data.end_date).format("DD MMMM YYYY")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Classes Section */}
          {data.classes && data.classes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-black tracking-tight uppercase">
                  <Layers className="text-primary size-4" />
                  Kelas Terdaftar
                </h4>
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 text-[10px] font-bold"
                >
                  {data.classes.length} Kelas
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {data.classes.map((cls, i) => {
                  const levelLabel = LevelClassOptions.find(
                    (opt) => opt.value === cls.level
                  )?.label
                  const availableLabel = AvailableForOptions.find(
                    (opt) => opt.value === cls.available_for
                  )?.label
                  const visibleLabel = VisibleForOptions.find(
                    (opt) => opt.value === cls.visible_for
                  )?.label
                  const typeLabel = ClassTypeOptions.find(
                    (opt) => opt.value === cls.class_type
                  )?.label
                  const publishLabel = IsPublishOptions.find(
                    (opt) => opt.value === cls.is_publish
                  )?.label

                  return (
                    <div
                      key={i}
                      className="border-input hover:border-primary/50 group hover:bg-muted/10 relative flex flex-col gap-4 rounded-2xl border p-4 transition-all"
                    >
                      <div className="flex gap-4">
                        <div className="relative shrink-0">
                          {cls.photo ? (
                            <img
                              src={cls.photo}
                              alt={cls.name}
                              className="size-16 rounded-xl object-cover shadow-sm transition-transform active:scale-95"
                            />
                          ) : (
                            <div className="bg-muted flex size-16 items-center justify-center rounded-xl border border-dashed">
                              <Dumbbell className="text-muted-foreground size-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center gap-1.5">
                          <p className="group-hover:text-primary text-sm leading-none font-black transition-colors">
                            {cls.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600">
                              <Flame className="size-3" />
                              {cls.burn_calories} kal
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                              <Clock className="size-3" />
                              {cls.start_time} - {cls.end_time}
                            </div>
                            <div className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                              {cls.duration_time}{" "}
                              {cls.duration_time_type === "minute"
                                ? "Min"
                                : cls.duration_time_type}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {levelLabel && (
                          <div className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-[9px] font-bold uppercase">
                            Level: {levelLabel}
                          </div>
                        )}
                        {typeLabel && (
                          <div className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[9px] font-bold uppercase">
                            {typeLabel}
                          </div>
                        )}
                        {availableLabel && (
                          <div className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[9px] font-bold uppercase">
                            Untuk: {availableLabel}
                          </div>
                        )}
                        {visibleLabel && (
                          <div className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[9px] font-bold uppercase">
                            {visibleLabel}
                          </div>
                        )}
                        {publishLabel && (
                          <div className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[9px] font-bold uppercase">
                            {publishLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {data.notes && (
            <div className="space-y-3 rounded-2xl border border-orange-500/10 bg-orange-500/5 p-5">
              <h4 className="flex items-center gap-2 text-[10px] font-black tracking-widest text-orange-600 uppercase">
                <Info className="size-3.5" />
                Catatan Paket
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                {data.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const Package: React.FC<PackageProps> = ({ member }) => {
  const [selectedPackage, setSelectedPackage] =
    React.useState<MemberPackageTypes | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])
  const [typeFilter, setTypeFilter] = React.useState<string[]>([])
  const [tableData, setTableData] = React.useState<
    TableQueries & { statusSort: "all" | "active" }
  >({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    statusSort: "all",
    sort: {
      order: "",
      key: "",
    },
  })

  const hasActiveFilters =
    tableData.query !== "" || statusFilter.length > 0 || typeFilter.length > 0

  const handleResetFilters = () => {
    setTableData({ ...tableData, query: "", pageIndex: 1 })
    setStatusFilter([])
    setTypeFilter([])
  }

  const { data, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: [
      QUERY_KEY.memberPackages,
      tableData,
      member?.code,
      statusFilter,
      typeFilter,
    ],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberPackages(`${member?.code}`, {
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort: [
                ...(tableData.statusSort === "active"
                  ? [
                      {
                        sort_column: "duration_status_code",
                        sort_type: "desc" as const,
                      },
                    ]
                  : []),
                {
                  sort_column: "id",
                  sort_type: "desc",
                },
              ],
            }),
        search: [
          ...(tableData.query === ""
            ? []
            : [
                {
                  search_column: "package.name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ]),
          ...(statusFilter.length > 0
            ? statusFilter.map((item, index) => ({
                search_operator: index === 0 ? "and" : "or",
                search_column: "duration_status_code",
                search_condition: "=",
                search_text: item,
              }))
            : []),
          ...(typeFilter.length > 0
            ? typeFilter.map((item, index) => ({
                search_operator: index === 0 ? "and" : "or",
                search_column: "package_type",
                search_condition: "=",
                search_text: item,
              }))
            : []),
        ] as Filter[],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const memberPackageList = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = React.useMemo<DataTableColumnDef<MemberPackageTypes>[]>(
    () => [
      {
        header: "Status",
        accessorKey: "status",
        cell: (props) => {
          const row = props.row.original
          return (
            <div className="flex items-center">
              <Badge className={statusColor[row.duration_status]}>
                <span className="capitalize">{row.duration_status}</span>
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "package.name",
        header: "Nama",
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.package?.name}</div>
        },
      },
      {
        // accessorKey: 'sessionDuration',
        header: "Durasi",
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.fduration}</div>
        },
      },
      {
        accessorKey: "session_duration",
        header: "Sesi",
        cell: ({ row }) => {
          const data = row.original
          return (
            <div className="capitalize">
              {data.session_duration + data.extra_session}
            </div>
          )
        },
      },
      {
        accessorKey: "start_date",
        header: "Tgl Mulai",
        size: 200,
        cell: ({ row }) => {
          return (
            <div className="capitalize">
              {dayjs(row.original.start_date).format("YYYY-MM-DD")}
            </div>
          )
        },
      },
      {
        accessorKey: "end_date",
        header: "Tgl Berakhir",
        size: 200,
        cell: ({ row }) => {
          return (
            <div className="capitalize">
              {dayjs(row.original.end_date).format("YYYY-MM-DD")}
            </div>
          )
        },
      },
      {
        accessorKey: "package.type",
        header: "Tipe",
        cell: ({ row }) => {
          const data = row.original
          const value =
            data.package?.type === "class"
              ? "Kelas"
              : data.package?.type === "pt_program"
                ? "Program PT"
                : "Membership"
          return <div className="capitalize">{value}</div>
        },
      },
      {
        accessorKey: "trainer.name",
        header: "Trainer",
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.trainer?.name}</div>
        },
      },
      {
        header: "",
        id: "action",
        size: 50,
        enableColumnActions: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedPackage(row.original)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Detail</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],

    []
  )
  return (
    <>
      <div className="flex flex-col gap-4 p-2">
        <DataTable
          renderViewOptions={() => (
            <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <InputDebounce
                  placeholder="Cari cepat..."
                  handleOnchange={(value) => {
                    setTableData({
                      ...tableData,
                      query: value,
                      pageIndex: 1,
                    })
                  }}
                />
                <DataTableFacetedFilter
                  title="Status"
                  icon={ListFilter}
                  options={[
                    { label: "Aktif", value: "1" },
                    { label: "Tidak Aktif", value: "0" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val)
                    setTableData({ ...tableData, pageIndex: 1 })
                  }}
                />
                <DataTableFacetedFilter
                  title="Tipe"
                  icon={ListFilter}
                  options={[
                    { label: "Membership", value: "membership" },
                    { label: "Program PT", value: "pt_program" },
                    { label: "Kelas", value: "class" },
                  ]}
                  value={typeFilter}
                  onChange={(val) => {
                    setTypeFilter(val)
                    setTableData({ ...tableData, pageIndex: 1 })
                  }}
                />
                <DataTableFacetedFilter
                  title="Urutkan"
                  isMulti={false}
                  icon={ArrowDownUp}
                  options={[
                    { label: "Semua", value: "all" },
                    { label: "Paket Aktif", value: "active" },
                  ]}
                  value={[tableData.statusSort]}
                  onChange={(val) => {
                    setTableData({
                      ...tableData,
                      statusSort: (val[0] as "all" | "active") || "all",
                      pageIndex: 1,
                    })
                  }}
                />
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={handleResetFilters}
                    className="h-8 px-2 lg:px-3"
                  >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
          columns={columns}
          data={memberPackageList}
          noData={(!isLoading && memberPackageList.length === 0) || !!error}
          loading={isLoading || isFetchingNextPage}
          pagingData={{
            total: total as number,
            pageIndex: tableData.pageIndex as number,
            pageSize: tableData.pageSize as number,
          }}
          pinnedColumns={{
            right: ["action"],
          }}
          onPaginationChange={(val) => {
            setTableData({
              ...tableData,
              pageIndex: val,
            })
          }}
          onSelectChange={(val) => {
            setTableData({
              ...tableData,
              pageSize: val,
              pageIndex: 1,
            })
          }}
          onSort={(val) => {
            setTableData({
              ...tableData,
              sort: val,
            })
          }}
        />
      </div>

      <PackageDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        data={selectedPackage}
      />
    </>
  )
}

export default Package
