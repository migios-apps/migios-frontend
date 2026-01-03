import React, { useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Filter } from "@/services/api/@types/api"
import { MemberDetail } from "@/services/api/@types/member"
import {
  TrainerDetail,
  TrainerMember,
  TrainerPackage,
} from "@/services/api/@types/trainer"
import { apiGetMemberList } from "@/services/api/MembeService"
import {
  apiGetTrainerList,
  apiGetTrainerActiveMembers,
} from "@/services/api/TrainerService"
import { motion, AnimatePresence } from "framer-motion"
import {
  People as Users,
  Profile2User,
  User,
  Book1 as BookOpen,
  CloseCircle as X,
  Sort as ArrowDownUp,
  ArrowRight2 as ChevronsRight,
} from "iconsax-reactjs"
import { GroupBase, OptionsOrGroups } from "react-select"
import { cn } from "@/lib/utils"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter"
import InputDebounce from "@/components/ui/input-debounce"
import { SelectAsyncPaginate } from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import MemberDetailSheet from "./components/MemberDetailSheet"
import TrainerDetailSheet from "./components/TrainerDetailSheet"

const MemberCard = ({
  member,
  onClick,
}: {
  member: TrainerMember
  onClick: (pkg: TrainerPackage) => void
}) => {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden p-0 shadow-sm transition-all hover:shadow-md",
        member.membership_status === "freeze"
          ? cn("border-l-4", statusColor[member.membership_status])
          : "border-muted-foreground/10"
      )}
    >
      <CardContent className="bg-card p-3">
        <div className="mb-2 flex items-center gap-3">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={member.photo || ""} alt={member.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="truncate text-sm leading-none font-semibold">
                {member.name}
              </p>
              {member.membership_status && (
                <Badge
                  className={cn(
                    "h-4 px-1 text-xs font-medium transition-all",
                    statusColor[member.membership_status]
                  )}
                >
                  <span className="capitalize">{member.membership_status}</span>
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {member.code}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          {member.packages?.map((pkg, index) => (
            <div
              key={index}
              onClick={() => onClick(pkg)}
              className="bg-accent/50 border-accent hover:border-primary/30 hover:bg-accent cursor-pointer rounded-md border p-1.5 text-xs transition-colors"
            >
              <div className="text-accent-foreground mb-0.5 flex items-center gap-1.5 font-medium">
                <BookOpen variant="Broken" className="h-4 w-4 shrink-0" />
                <span className="truncate">{pkg.package_name}</span>
              </div>
              <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-1 pl-5 text-xs">
                <div className="flex items-center gap-1.5 opacity-80">
                  <span className="text-primary font-bold">
                    {pkg.total_available_session} Sesi
                  </span>
                  <span className="bg-muted-foreground/30 h-1 w-1 rounded-full" />
                  <span className="text-muted-foreground">
                    Berakhir:{" "}
                    {new Date(pkg.end_date).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {member.total_active_packages > 2 && (
            <p className="text-muted-foreground pt-0.5 text-center text-xs font-bold tracking-widest capitalize">
              + {member.total_active_packages - 2} Paket Lainnya
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const TrainerColumn = ({
  trainer,
  index,
  onViewDetail,
  onMemberClick,
}: {
  trainer: TrainerDetail
  index: number
  onViewDetail: (trainer: TrainerDetail) => void
  onMemberClick: (
    member: TrainerMember,
    trainer: TrainerDetail,
    pkg: TrainerPackage
  ) => void
}) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["trainer-members", trainer.id],
      queryFn: ({ pageParam = 2 }) =>
        apiGetTrainerActiveMembers(trainer.id, {
          page: pageParam as number,
          per_page: 10,
        }),
      initialPageParam: 2,
      getNextPageParam: (lastPage) => {
        const meta = lastPage.data.meta
        return meta.page < meta.total_page ? meta.page + 1 : undefined
      },
      enabled: trainer.total_active_members > 10,
    })

  const allMembers = [
    ...(trainer.members || []),
    ...(data?.pages.flatMap((page) => page.data.data) || []),
  ]

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: 150 },
        show: {
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 18,
            delay: index * 0.1,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className="bg-accent border-border flex h-[calc(100vh-180px)] w-[320px] shrink-0 flex-col rounded-xl border text-sm"
    >
      <ScrollArea className="h-full">
        <div className="bg-background/70 sticky top-0 z-1 rounded-t-xl border-b backdrop-blur-sm">
          <div
            className="group flex cursor-pointer flex-col gap-2 p-4 pb-2"
            onClick={() => onViewDetail(trainer)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="border-primary/20 h-10 w-10 border-2 shadow-sm">
                  <AvatarImage src={trainer.photo || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {trainer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="group-hover:text-primary mb-1 max-w-[150px] truncate text-sm leading-none font-bold">
                    {trainer.name}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-primary text-xs font-medium">
                    {trainer.code}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-background h-6 px-2 font-mono text-xs font-bold"
              >
                <Users variant="Bulk" className="mr-1 h-4 w-4" />
                {trainer.total_active_members}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-xs font-normal"
              >
                Paket Aktif: {trainer.total_active_package}
              </Badge>
              <div className="flex-1" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  `bg-secondary-foreground/10 h-24 w-full rounded-xl`
                )}
              />
            ))
          ) : (
            <>
              {allMembers.map((member, idx) => (
                <div key={`${member.id}-${idx}`}>
                  <MemberCard
                    member={member}
                    onClick={(pkg) => onMemberClick(member, trainer, pkg)}
                  />
                </div>
              ))}

              {hasNextPage && (
                <div className="mt-2">
                  {isFetchingNextPage ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className={cn(
                            `bg-secondary-foreground/10 h-24 w-full rounded-xl`
                          )}
                        />
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => fetchNextPage()}
                      className="group bg-primary/5 hover:bg-primary/10 border-primary/10 hover:border-primary/20 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-all active:scale-[0.98]"
                    >
                      {/* <div className="bg-primary/10 text-primary group-hover:bg-primary flex h-8 w-8 items-center justify-center rounded-full transition-all group-hover:text-white">
                        <ChevronsRight className="h-4 w-4 rotate-90" />
                      </div> */}
                      <span className="text-primary/70 group-hover:text-primary text-xs font-bold tracking-widest uppercase">
                        Muat Member Lainnya
                      </span>
                    </button>
                  )}
                </div>
              )}

              {allMembers.length === 0 && (
                <div className="text-muted-foreground flex h-[calc(100vh-365px)] flex-col items-center justify-center opacity-30">
                  <Profile2User size="48" variant="Bulk" />
                  <p className="mt-2 text-xs font-semibold tracking-wide">
                    Tidak Ada Member Aktif
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  )
}

const ColumnSkeleton = () => (
  <div className="bg-accent border-border flex h-fit max-h-full w-[320px] shrink-0 flex-col rounded-xl border p-4">
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-6 w-12" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, j) => (
        <div key={j} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
    </div>
  </div>
)

const KanbanSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="flex h-full gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ColumnSkeleton key={i} />
    ))}
  </div>
)

const TrainerPage = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(
    null
  )

  const [selectedTrainerDetail, setSelectedTrainerDetail] =
    useState<TrainerDetail | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const [selectedMemberDetail, setSelectedMemberDetail] =
    useState<TrainerMember | null>(null)
  const [selectedMemberPackage, setSelectedMemberPackage] =
    useState<TrainerPackage | null>(null)
  const [selectedMemberTrainer, setSelectedMemberTrainer] =
    useState<TrainerDetail | null>(null)
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false)

  const handleOpenDetail = (trainer: TrainerDetail) => {
    setSelectedTrainerDetail(trainer)
    setIsSheetOpen(true)
  }
  const [sortValue, setSortValue] = useState<string>("member-desc")

  const hasActiveFilters =
    searchQuery !== "" || sortValue !== "member-desc" || selectedMember !== null

  const handleResetFilters = () => {
    setSearchQuery("")
    setSelectedMember(null)
    setSortValue("member-desc")
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["trainers-kanban", searchQuery, sortValue, selectedMember],
      queryFn: ({ pageParam = 1 }) => {
        const [column, type] = sortValue.split("-")
        const sort_column =
          column === "member" ? "total_active_members" : "total_active_package"

        return apiGetTrainerList({
          page: pageParam as number,
          per_page: 5,
          sort_column,
          sort_type: type as "asc" | "desc",
          search: [
            ...(searchQuery === ""
              ? []
              : [
                  {
                    search_column: "name",
                    search_condition: "like",
                    search_text: searchQuery,
                  },
                  {
                    search_operator: "or",
                    search_column: "code",
                    search_condition: "like",
                    search_text: searchQuery,
                  },
                ]),
            ...(selectedMember
              ? [
                  {
                    search_operator: "and",
                    search_column: "member_id",
                    search_condition: "=",
                    search_text: String(selectedMember.id),
                  },
                ]
              : []),
          ] as Filter[],
        })
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const meta = lastPage.data.meta
        return meta.page < meta.total_page ? meta.page + 1 : undefined
      },
    })

  const allTrainers = data?.pages.flatMap((page) => page.data.data) || []

  const getMemberList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<MemberDetail, GroupBase<MemberDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetMemberList({
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
          {
            search_operator: "and",
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
        ],
      })
      return {
        options: response.data.data,
        hasMore: response.data.data.length >= 1,
        additional: {
          page: additional!.page + 1,
        },
      }
    },
    []
  )

  return (
    <div className="flex h-[calc(100vh-95px)] flex-col overflow-hidden">
      <div className="p-2 px-6">
        <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Trainer</h1>
          <div className="flex items-center gap-2">
            <InputDebounce
              placeholder="Cari Trainer (Nama, Code)"
              className="max-w-[200px]"
              handleOnchange={(value) => {
                setSearchQuery(value)
              }}
            />
            <SelectAsyncPaginate
              isClearable
              loadOptions={getMemberList as any}
              additional={{ page: 1 }}
              placeholder="Pilih Member"
              value={selectedMember}
              cacheUniqs={[selectedMember]}
              getOptionLabel={(option) => option.name!}
              getOptionValue={(option) => `${option.id}`}
              debounceTimeout={500}
              formatOptionLabel={({ name, photo }) => (
                <div className="flex items-center justify-start gap-2">
                  <Avatar className="size-6">
                    {photo ? <AvatarImage src={photo} alt={name} /> : null}
                    <AvatarFallback>
                      <User variant="Bulk" className="size-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs">{name}</span>
                </div>
              )}
              onChange={(option) => setSelectedMember(option)}
              className="w-full"
            />
            <DataTableFacetedFilter
              title="Urutkan"
              isMulti={false}
              icon={ArrowDownUp}
              options={[
                { label: "Member Terbanyak", value: "member-desc" },
                { label: "Member Terendah", value: "member-asc" },
                { label: "Paket Terbanyak", value: "package-desc" },
                { label: "Paket Terendah", value: "package-asc" },
              ]}
              value={[sortValue]}
              onChange={(val) => {
                setSortValue(val[0] || "member-desc")
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
      </div>

      <div className="bg-secondary/40 min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-6 pt-2 pb-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              key="skeleton-initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <KanbanSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={`content-${searchQuery}-${sortValue}`}
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                },
              }}
              className="flex h-full min-w-max gap-6"
            >
              {allTrainers.length > 0 ? (
                allTrainers.map((trainer, index) => (
                  <TrainerColumn
                    key={trainer.id}
                    trainer={trainer}
                    index={index}
                    onViewDetail={handleOpenDetail}
                    onMemberClick={(member, trainer, pkg) => {
                      setSelectedMemberDetail(member)
                      setSelectedMemberPackage(pkg)
                      setSelectedMemberTrainer(trainer)
                      setIsMemberSheetOpen(true)
                    }}
                  />
                ))
              ) : (
                <div className="flex h-full w-full items-center justify-center py-20">
                  <div className="text-muted-foreground flex flex-col items-center gap-3 opacity-50">
                    <Users size="100" variant="Bulk" />
                    <p className="text-lg font-medium">
                      Tidak Ada Trainer Ditemukan
                    </p>
                  </div>
                </div>
              )}

              {hasNextPage && (
                <div className="flex h-full flex-none gap-6">
                  {isFetchingNextPage ? (
                    <KanbanSkeleton count={3} />
                  ) : (
                    <div className="flex h-full w-[320px] shrink-0 items-center justify-center">
                      <button
                        className="group border-primary/20 hover:border-primary hover:bg-primary/2 flex h-full w-full flex-col items-center justify-center gap-8 rounded-4xl border-2 border-dashed transition-all duration-300"
                        onClick={() => fetchNextPage()}
                      >
                        <div className="relative">
                          <div className="bg-primary/10 group-hover:bg-primary absolute -inset-4 scale-75 rounded-full opacity-0 blur-2xl transition-all group-hover:scale-110 group-hover:opacity-40" />
                          <div className="bg-primary/5 group-hover:bg-primary border-primary/10 group-hover:shadow-primary/20 relative flex h-14 w-14 items-center justify-center rounded-full border shadow-sm transition-all group-hover:scale-110 group-hover:shadow-lg">
                            <ChevronsRight
                              variant="Bulk"
                              className="text-primary h-7 w-7 transition-colors group-hover:text-white"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-primary/60 group-hover:text-primary text-[11px] font-black tracking-[0.4em] uppercase transition-colors">
                            MUAT LEBIH BANYAK
                          </span>
                          <div className="bg-primary/20 group-hover:bg-primary h-1 w-12 rounded-full transition-all group-hover:w-24" />
                          <p className="text-muted-foreground mt-2 text-xs font-medium opacity-40 transition-opacity group-hover:opacity-80">
                            Trainer Selanjutnya
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TrainerDetailSheet
        trainer={selectedTrainerDetail}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      <MemberDetailSheet
        member={selectedMemberDetail}
        trainer={selectedMemberTrainer}
        pkg={selectedMemberPackage}
        open={isMemberSheetOpen}
        onOpenChange={setIsMemberSheetOpen}
      />
    </div>
  )
}

export default TrainerPage
