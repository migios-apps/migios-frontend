import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import { Filter } from "@/services/api/@types/api"
import { UserClubListData } from "@/services/api/@types/club"
import { apiSetClubData } from "@/services/api/AuthService"
import { apiGetUserClubList } from "@/services/api/ClubService"
import dayjs from "dayjs"
import { Add, SearchNormal1, SearchStatus1 } from "iconsax-reactjs"
import { ChevronsUpDown } from "lucide-react"
import LogoIcon from "@/assets/icons/migios-logo.svg?react"
import { useSessionUser } from "@/stores/auth-store"
import { useThemeConfig } from "@/stores/theme-config-store"
import { useClubStore } from "@/stores/use-club"
import { cn } from "@/lib/utils"
import useDateDifference from "@/utils/hooks/useDateDifference"
import useDebounce from "@/utils/hooks/useDebounce"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/layout/vertical/sidebar"
import { BorderBeam } from "../MagicUI/BorderBeam"
import { Skeleton } from "../ui/skeleton"

type ClubButtonSelectProps = { sideNavCollapse: boolean }

const ClubButtonSelect = ({ sideNavCollapse }: ClubButtonSelectProps) => {
  const { setNewBranchClub } = useClubStore()
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const isInsetLayout = themeConfig.layout === "inset"
  const { authDashboard, setManualDataClub } = useAuth()
  const club = useSessionUser((state) => state.club)
  const expairy = useDateDifference(
    dayjs().format("YYYY-MM-DD"),
    dayjs(club?.subscription_end_date).format("YYYY-MM-DD")
  )
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  function handleDebounceFn(value: string) {
    setSearch(value)
  }

  const debounceFn = useDebounce(handleDebounceFn, 500)

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [QUERY_KEY.clubs, search, authDashboard],
      initialPageParam: 1,
      enabled: authDashboard,
      queryFn: async ({ pageParam }) => {
        const { data, meta } = await apiGetUserClubList({
          page: pageParam,
          per_page: 5,
          search: [
            ...(search !== ""
              ? ([
                  {
                    search_column: "name",
                    search_condition: "like",
                    search_text: search,
                  },
                ] as Filter[])
              : []),
            {
              search_column: "subscription_status",
              search_condition: "=",
              search_text: "active",
            },
          ],
        }).then((data) => data.data)

        return { data, meta }
      },
      getNextPageParam: (lastPage) =>
        lastPage?.meta
          ? lastPage.meta.page !== lastPage.meta.total_page
            ? lastPage.meta.page + 1
            : undefined
          : undefined,
    })

  const dataMemo = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data) : []),
    [data]
  )
  const metaData = data?.pages[0]?.meta
  const hasMore = metaData?.total !== dataMemo.length

  const setClubData = (data: UserClubListData) => {
    apiSetClubData(data.id!).then((resp) => {
      setManualDataClub({ authData: resp, data, isRedirect: false })
      setOpen(false)

      window.location.reload()
      //   const query_key = Object.keys(QUERY_KEY).filter(
      //     (key) => !['clubList', 'userProfile', 'clubDetail'].includes(key)
      //   )
      //   query_key.forEach((key) => {
      //     queryClient.invalidateQueries({ queryKey: [key] })
      //   })
    })
  }

  const filteredClubs = useMemo(() => {
    const otherClubs = [
      // ...new Array(10).fill(0).map((_, index) => ({
      //   id: 43 + index,
      //   company_id: 43 + index,
      //   name: `Gym Cab. Depok ${index + 1}`,
      //   domain: "techcorp.com",
      //   address: "Jl. K.H. Wahid Hasyim, Kb. Sirih",
      //   photo: "https://placehold.co/64x64",
      //   description: "A leading tech company",
      //   phone: "+621234567890",
      //   email: "contact@techcorp.com",
      //   country: "indonesia",
      //   country_code: "ID",
      //   state: "Jawa Barat",
      //   city: "Bekasi",
      //   village: "Sukmajaya",
      //   zip_code: "12345",
      //   lat: "0",
      //   lng: "0",
      //   club_type: "main",
      //   enabled: true,
      //   created_at: "2025-08-23T16:23:48.346Z",
      //   updated_at: "2025-08-23T16:23:48.346Z",
      //   user_type: "owner",
      //   company_name: `Gym Cab. Surabaya ${index + 1}`,
      //   subscription_plan_type: "free",
      //   subscription_end_date: "2025-11-22 00:00:00",
      //   expired_in: "0 day",
      //   subscription_status: "active",
      //   roles: [
      //     {
      //       id: 1,
      //       name: "admin",
      //       display_name: "Administrator",
      //       description: "Full access to all resources",
      //     },
      //   ],
      // })),
      ...dataMemo.filter((item) => item.id !== club.id),
    ]

    if (!search) {
      return [club, ...otherClubs]
    }

    const searchLower = search.toLowerCase()
    const filteredOtherClubs = otherClubs.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.id?.toString().includes(searchLower)
    )

    // Include selected club if it matches search
    const selectedMatchesSearch =
      club.name?.toLowerCase().includes(searchLower) ||
      club.id?.toString().includes(searchLower)

    return selectedMatchesSearch
      ? [club, ...filteredOtherClubs]
      : filteredOtherClubs
  }, [dataMemo, club, search])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-border border-[0.5px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                isInsetLayout &&
                  "border-border-inset bg-card-inset hover:bg-card-inset/80 data-[state=open]:bg-border-inset data-[state=open]:text-card-inset-foreground",
                sideNavCollapse && "rounded-full"
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <div
                  className={cn(
                    "text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg",
                    sideNavCollapse && "rounded-full"
                  )}
                >
                  <Avatar className="size-8 bg-transparent">
                    <AvatarImage src={club.photo} alt={club.name} />
                    <AvatarFallback className="bg-border-inset p-2">
                      <LogoIcon className="h-full w-full text-[#8a8a8a]" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                {!sideNavCollapse && (
                  <div className="grid flex-1 text-start text-sm leading-tight">
                    <span className="truncate font-semibold">{club.name}</span>
                    <span className="truncate text-xs capitalize">
                      [{club.club_type}] Aktif {expairy}
                    </span>
                  </div>
                )}
                {!sideNavCollapse && (
                  <ChevronsUpDown className="ms-auto size-4" />
                )}
              </div>
              <BorderBeam size={40} initialOffset={20} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={cn(
              "border-border bg-card text-card-foreground w-[--radix-dropdown-menu-trigger-width] max-w-80 min-w-80 rounded-lg border",
              isInsetLayout &&
                "border-border-inset bg-card-inset text-card-inset-foreground"
            )}
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <div className="p-2">
              <div className="relative">
                <SearchNormal1
                  className={cn(
                    "text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2",
                    isInsetLayout && "text-card-inset-foreground/60"
                  )}
                  color="currentColor"
                />
                <Input
                  placeholder="Cari club..."
                  value={search}
                  onChange={(e) => debounceFn(e.target.value)}
                  className={cn(
                    "h-8 pl-8",
                    isInsetLayout &&
                      "border-border-inset bg-card-inset text-card-inset-foreground placeholder:text-card-inset-foreground/60"
                  )}
                />
              </div>
            </div>
            <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto px-2">
              {filteredClubs.length === 0 ? (
                <div
                  className={cn(
                    "text-muted-foreground flex h-32 flex-col items-center justify-center gap-3 px-2 py-1.5 text-sm",
                    isInsetLayout && "text-card-inset-foreground/70"
                  )}
                >
                  <SearchStatus1
                    size="64"
                    color="currentColor"
                    variant="Bulk"
                  />
                  <p className="text-center">Tidak ada club ditemukan</p>
                </div>
              ) : (
                filteredClubs.map((item) => {
                  const isSelected = item.id === club.id
                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() =>
                        !isSelected && setClubData(item as UserClubListData)
                      }
                      className={cn(
                        "min-w-0 gap-2 rounded-md border p-2 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                        isInsetLayout &&
                          "bg-sidebar-accent-inset border-border-inset text-card-inset-foreground hover:bg-border-inset focus:bg-border-inset",
                        isSelected && "border-primary border-2",
                        !isSelected && "cursor-pointer"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-sm"
                        )}
                      >
                        <Avatar className="size-8 bg-transparent">
                          <AvatarImage src={item.photo} alt={item.name} />
                          <AvatarFallback className="bg-border-inset p-1">
                            <LogoIcon className="h-full w-full text-[#8a8a8a]" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="min-w-0 flex-1 flex-col">
                        <span
                          className={cn(
                            "block truncate leading-none font-medium",
                            isInsetLayout && "text-card-inset-foreground"
                          )}
                        >
                          {item.name}
                        </span>
                        <span
                          className={cn(
                            "text-muted-foreground text-[10px] leading-none",
                            isInsetLayout && "text-card-inset-foreground/70"
                          )}
                        >
                          Berakhir{" "}
                          {dayjs(item.subscription_end_date).format(
                            "MMM DD, YYYY"
                          )}
                        </span>
                      </div>
                      <Badge
                        className={cn(
                          "border-border ml-auto w-14 shrink-0 justify-center border text-center text-[11px] font-medium tracking-wide uppercase",
                          isInsetLayout &&
                            "border-border-inset text-card-inset-foreground"
                        )}
                      >
                        {item.subscription_plan_type === "enterprise"
                          ? "Entprs"
                          : item.subscription_plan_type}
                      </Badge>
                    </DropdownMenuItem>
                  )
                })
              )}
              {isLoading &&
                Array.from(new Array(10), (_, i) => i + 1).map((_, index) => (
                  <DropdownMenuItem key={index} className="p-0">
                    <Skeleton
                      className={cn(
                        "h-10 w-full",
                        isInsetLayout && "bg-border-inset"
                      )}
                    />
                  </DropdownMenuItem>
                ))}
              {hasMore && (
                <>
                  <DropdownMenuSeparator
                    className={cn("mt-3", isInsetLayout && "bg-border-inset")}
                  />
                  <div className="py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isLoading || isFetchingNextPage}
                      className={cn(
                        "h-6 w-full text-xs font-normal",
                        isInsetLayout &&
                          "bg-sidebar-accent-inset hover:bg-border-inset hover:text-card-inset-foreground"
                      )}
                      onClick={() => fetchNextPage()}
                    >
                      {isLoading || isFetchingNextPage
                        ? "Memuat..."
                        : "Muat Lebih Banyak"}
                    </Button>
                  </div>
                </>
              )}
            </div>
            <DropdownMenuSeparator
              className={cn(isInsetLayout && "bg-border-inset")}
            />
            <DropdownMenuItem
              className={cn(
                "cursor-pointer gap-2 p-2",
                isInsetLayout &&
                  "bg-card-inset hover:bg-border-inset! hover:text-card-inset-foreground cursor-pointer"
              )}
              onClick={() => setNewBranchClub(true)}
            >
              <div
                className={cn(
                  "bg-border flex size-6 items-center justify-center rounded-md",
                  isInsetLayout &&
                    "bg-border-inset border-border-inset text-card-inset-foreground"
                )}
              >
                <Add size={16} color="currentColor" variant="Outline" />
              </div>
              <div
                className={cn(
                  "font-medium",
                  isInsetLayout && "text-card-inset-foreground"
                )}
              >
                Tambah club
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default ClubButtonSelect
