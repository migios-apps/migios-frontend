import { useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Filter } from "@/services/api/@types/api"
import { TrainerDetail, TrainerMember } from "@/services/api/@types/trainer"
import { apiGetTrainerActiveMembers } from "@/services/api/TrainerService"
import { Calendar2, Profile2User } from "iconsax-reactjs"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Venus,
  Mars,
  Users,
  BookOpen,
  MapPin,
  Clock,
  IdCard,
  ArrowDownUp,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter"
import InputDebounce from "@/components/ui/input-debounce"
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
} from "@/components/animate-ui/components/radix/sheet"
import MemberDetailSheet from "./MemberDetailSheet"

interface TrainerDetailSheetProps {
  trainer: TrainerDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TrainerDetailSheet = ({
  trainer,
  open,
  onOpenChange,
}: TrainerDetailSheetProps) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortValue, setSortValue] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  const [selectedMember, setSelectedMember] = useState<TrainerMember | null>(
    null
  )
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false)

  const hasActiveFilters =
    searchQuery !== "" || sortValue !== "" || statusFilter.length > 0

  const initialPageParam = hasActiveFilters ? 1 : 2

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [
        "trainer-members-detail",
        trainer?.id,
        searchQuery,
        sortValue,
        statusFilter,
        initialPageParam,
      ],
      queryFn: ({ pageParam = initialPageParam }) => {
        return apiGetTrainerActiveMembers(trainer!.id, {
          page: pageParam as number,
          per_page: 10,
          search: [
            ...(searchQuery !== ""
              ? [
                  {
                    search_column: "name",
                    search_text: searchQuery,
                    search_condition: "like",
                    search_operator: "and",
                  },
                  {
                    search_column: "code",
                    search_text: searchQuery,
                    search_condition: "like",
                    search_operator: "or",
                  },
                ]
              : []),
            ...(statusFilter.length > 0
              ? [
                  {
                    search_operator: "and",
                    search_column: "membership_status_code",
                    search_text: statusFilter.join(","),
                    search_condition: "in",
                  } as any,
                ]
              : []),
          ] as Filter[],
          sort: sortValue
            ? [
                {
                  sort_column: sortValue.split("-")[0],
                  sort_type: sortValue.split("-")[1] as "asc" | "desc",
                },
              ]
            : undefined,
        })
      },
      initialPageParam: initialPageParam,
      getNextPageParam: (lastPage) => {
        const meta = lastPage.data.meta
        return meta.page < meta.total_page ? meta.page + 1 : undefined
      },
      enabled:
        !!trainer &&
        open &&
        (hasActiveFilters ? true : trainer.total_active_members > 10),
    })

  const allMembers = [
    ...(!hasActiveFilters && trainer ? trainer.members || [] : []),
    ...(data?.pages.flatMap((page) => page.data.data) || []),
  ]

  const handleResetFilters = () => {
    setSearchQuery("")
    setSortValue("")
    setStatusFilter([])
  }

  if (!trainer) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex flex-col gap-0 sm:max-w-xl"
          floating
        >
          <SheetHeader>
            <SheetTitle>Detail Trainer</SheetTitle>
            <SheetDescription />
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-4 px-4">
                {/* Profile Overview Card */}
                <Card
                  className="group from-background to-accent/10 hover:bg-accent/20 cursor-pointer bg-linear-to-br py-0 shadow-none transition-colors"
                  onClick={() => navigate(`/employee/detail/${trainer.code}`)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="border-primary/20 ring-primary/5 h-16 w-16 border-2 shadow-sm ring-2">
                      <AvatarImage
                        src={trainer.photo || ""}
                        alt={trainer.name}
                      />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="group-hover:text-primary text-xl font-semibold">
                          {trainer.name}
                        </h2>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="flex items-center gap-1.5 text-xs font-semibold">
                          <IdCard className="h-3.5 w-3.5" />
                          {trainer.code}
                        </span>
                        <span className="bg-border h-3 w-px" />
                        <span className="flex items-center gap-1.5 text-xs font-semibold">
                          <Users className="h-3.5 w-3.5" />
                          {trainer.total_active_members} Member
                        </span>
                        <span className="bg-border h-3 w-px" />
                        <span className="flex items-center gap-1.5 text-xs font-semibold">
                          <BookOpen className="h-3.5 w-3.5" />
                          {trainer.total_active_package} Paket
                        </span>
                      </div>

                      {/* Specializations */}
                      {trainer.specializations?.length > 0 && (
                        <p className="text-muted-foreground text-xs">
                          {trainer.specializations
                            .map((spec) => spec.name_id)
                            .join(" • ")}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="from-background to-accent/20 bg-linear-to-br py-0 shadow-none">
                    <CardContent className="p-3">
                      <h4 className="text-muted-foreground mb-2 text-xs font-semibold">
                        Kontak
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <Mail className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-muted-foreground text-xs">
                              Email
                            </p>
                            <p className="truncate text-xs font-semibold">
                              {trainer.email || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                            <Phone className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-muted-foreground text-xs">
                              Telepon
                            </p>
                            <p className="text-xs font-semibold">
                              {trainer.phone || "-"}
                            </p>
                          </div>
                        </div>
                        {trainer.address && (
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-muted-foreground text-xs">
                                Alamat
                              </p>
                              <p className="text-xs font-semibold">
                                {trainer.address}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="from-background to-accent/20 bg-linear-to-br py-0 shadow-none">
                    <CardContent className="p-3">
                      <h4 className="text-muted-foreground mb-2 text-xs font-semibold">
                        Kepegawaian
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-muted-foreground text-xs">
                              Bergabung
                            </p>
                            <p className="text-xs font-semibold">
                              {trainer.join_date
                                ? new Date(
                                    trainer.join_date
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                            {trainer.gender === "f" ? (
                              <Venus className="h-3.5 w-3.5" />
                            ) : (
                              <Mars className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-muted-foreground text-xs">
                              Kelamin
                            </p>
                            <p className="text-xs font-semibold">
                              {trainer.gender === "f"
                                ? "Perempuan"
                                : "Laki-laki"}
                            </p>
                          </div>
                        </div>
                        {trainer.birth_date && (
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                              <Calendar className="h-3.5 w-3.5 opacity-70" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-muted-foreground text-xs">
                                Ultah
                              </p>
                              <p className="text-xs font-semibold">
                                {new Date(
                                  trainer.birth_date
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="members" className="w-full">
                  <TabsList className="h-auto w-full justify-start gap-1">
                    <TabsTrigger value="members">
                      <Users className="h-4 w-4" />
                      Daftar Member ({trainer.total_active_members})
                    </TabsTrigger>
                    <TabsTrigger value="schedule">
                      <Clock className="h-4 w-4" />
                      Jadwal
                    </TabsTrigger>
                  </TabsList>

                  <TabsContents>
                    <TabsContent value="members" className="space-y-4">
                      <div className="flex flex-col gap-2 px-1 pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <InputDebounce
                            placeholder="Cari Member (Nama, Code)..."
                            className="h-8 w-full text-xs"
                            handleOnchange={setSearchQuery}
                          />
                          <DataTableFacetedFilter
                            title="Urutkan"
                            isMulti={false}
                            icon={ArrowDownUp}
                            options={[
                              {
                                label: "Sisa Sesi Terbanyak",
                                value: "total_available_sessions-desc",
                              },
                              {
                                label: "Sisa Sesi Terendah",
                                value: "total_available_sessions-asc",
                              },
                              { label: "Nama (A-Z)", value: "name-asc" },
                              { label: "Nama (Z-A)", value: "name-desc" },
                            ]}
                            value={sortValue ? [sortValue] : []}
                            onChange={(val) => {
                              setSortValue(val[0] || "")
                            }}
                          />
                          <DataTableFacetedFilter
                            title="Status"
                            isMulti={true}
                            options={[
                              { label: "Aktif", value: "1" },
                              { label: "Freeze", value: "2" },
                            ]}
                            value={statusFilter}
                            onChange={setStatusFilter}
                          />
                          {hasActiveFilters && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleResetFilters}
                              className="h-8 px-2 text-xs"
                            >
                              Reset
                              <X className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 px-1 py-2">
                        {isLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton
                              key={i}
                              className="bg-secondary-foreground/10 h-24 w-full rounded-xl"
                            />
                          ))
                        ) : (
                          <>
                            {allMembers.length > 0 ? (
                              <>
                                {allMembers.map((member, idx) => (
                                  <Card
                                    key={`${member.id}-${idx}`}
                                    onClick={() => {
                                      setSelectedMember(member)
                                      setIsMemberSheetOpen(true)
                                    }}
                                    className={cn(
                                      "group cursor-pointer gap-0 overflow-hidden p-0 shadow-sm transition-all hover:shadow-md",
                                      member.membership_status === "freeze"
                                        ? cn(
                                            "border-l-4",
                                            statusColor[
                                              member.membership_status
                                            ]
                                          )
                                        : "border-muted-foreground/10"
                                    )}
                                  >
                                    <CardContent className="bg-card p-3">
                                      <div className="mb-2 flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border">
                                          <AvatarImage
                                            src={member.photo || ""}
                                            alt={member.name}
                                          />
                                          <AvatarFallback>
                                            <User className="h-4 w-4" />
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                          <div className="mb-1 flex items-center justify-between gap-2">
                                            <p className="group-hover:text-primary truncate text-sm leading-none font-semibold transition-all">
                                              {member.name}
                                            </p>
                                            {member.membership_status && (
                                              <Badge
                                                className={cn(
                                                  "h-4 px-1 text-[9px] font-medium transition-all",
                                                  statusColor[
                                                    member.membership_status
                                                  ]
                                                )}
                                              >
                                                <span className="capitalize">
                                                  {member.membership_status}
                                                </span>
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="group-hover:text-primary text-muted-foreground truncate text-xs tracking-wider uppercase">
                                            {member.code}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="space-y-1.5">
                                        {member.packages?.map((pkg) => (
                                          <div
                                            key={pkg.id}
                                            className="bg-accent/50 border-accent rounded-md border p-1.5 text-xs"
                                          >
                                            <div className="text-accent-foreground mb-0.5 flex items-center gap-1.5 font-medium">
                                              <BookOpen className="h-3.5 w-3.5 shrink-0" />
                                              <span className="truncate">
                                                {pkg.package_name}
                                              </span>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-1 pl-5 text-xs">
                                              <div className="flex items-center gap-1.5 opacity-80">
                                                <span className="text-primary font-bold">
                                                  {pkg.total_available_session}{" "}
                                                  Sesi
                                                </span>
                                                <span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
                                                <span className="text-muted-foreground">
                                                  Berakhir:{" "}
                                                  {new Date(
                                                    pkg.end_date
                                                  ).toLocaleDateString("id-ID")}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        {member.total_active_packages > 2 && (
                                          <p className="text-muted-foreground pt-0.5 text-center text-xs font-bold tracking-widest uppercase">
                                            + {member.total_active_packages - 2}{" "}
                                            Paket Lainnya
                                          </p>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}

                                {hasNextPage && (
                                  <div className="mt-2">
                                    {isFetchingNextPage ? (
                                      <div className="space-y-3">
                                        {Array.from({ length: 3 }).map(
                                          (_, i) => (
                                            <Skeleton
                                              key={i}
                                              className="bg-secondary-foreground/10 h-24 w-full rounded-xl"
                                            />
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => fetchNextPage()}
                                        className="group bg-primary/5 hover:bg-primary/10 border-primary/10 hover:border-primary/20 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-all active:scale-[0.98]"
                                      >
                                        <span className="text-primary/70 group-hover:text-primary text-xs font-bold tracking-widest uppercase">
                                          Muat Member Lainnya
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="bg-accent/20 col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                                <Profile2User
                                  size="48"
                                  variant="Bulk"
                                  className="text-muted-foreground/50"
                                />
                                <p className="text-muted-foreground mt-2 text-xs tracking-wide">
                                  Tidak Ada Member Aktif
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="schedule">
                      <div className="bg-accent/20 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                        <Calendar2
                          size="48"
                          variant="Bulk"
                          className="text-muted-foreground/50"
                        />
                        <p className="text-muted-foreground mt-2 text-xs tracking-wide">
                          Jadwal Belum Tersedia
                        </p>
                      </div>
                    </TabsContent>
                  </TabsContents>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <MemberDetailSheet
        member={selectedMember}
        trainer={trainer}
        open={isMemberSheetOpen}
        onOpenChange={setIsMemberSheetOpen}
      />
    </>
  )
}

export default TrainerDetailSheet
