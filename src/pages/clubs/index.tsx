import React, { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import dashboardDark from "@/pages/auth/sign-in/assets/event-dark.png"
import dashboardLight from "@/pages/auth/sign-in/assets/event-light.png"
import { Filter } from "@/services/api/@types/api"
import { apiGetUserClubList } from "@/services/api/ClubService"
import { Add, LogoutCurve, SearchStatus1 } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import InputDebounce from "@/components/ui/input-debounce"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import AlertDialogExpiredSubscription from "@/components/AlertDialogExpiredSubscription"
import Logo from "@/components/layout/Logo"
import { ThemeSwitch } from "@/components/theme-switch"

const Clubs = () => {
  const { setClubData, signOut } = useAuth()
  const [search, setSearch] = React.useState("")
  const [openRenewSubscription, setOpenRenewSubscription] =
    React.useState(false)
  const [clubId, setClubId] = React.useState<number | undefined>(undefined)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const { data, fetchNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [QUERY_KEY.clubs, search],
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const data = await apiGetUserClubList({
          page: pageParam,
          per_page: 10,
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
          ],
        })

        // if (data.data.data.length === 0) {
        //   navigatorRef('/club-setup')
        // }

        return data
      },
      getNextPageParam: (lastPage) =>
        lastPage.data.meta.page !== lastPage.data.meta.total_page
          ? lastPage.data.meta.page + 1
          : undefined,
    })

  const dataMemo = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const metaData = data?.pages[0]?.data.meta

  return (
    <>
      <div className="relative container grid h-svh flex-col lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="absolute top-4 left-4 z-10">
          <ThemeSwitch />
        </div>
        <div
          className={cn(
            "bg-muted relative h-full overflow-hidden max-lg:hidden",
            "[&>img]:absolute [&>img]:top-[8%] [&>img]:left-1 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none"
          )}
        >
          <img
            src={dashboardLight}
            className="dark:hidden"
            width={1024}
            height={1151}
            alt="Migios-Admin"
          />
          <img
            src={dashboardDark}
            className="hidden dark:block"
            width={1024}
            height={1138}
            alt="Migios-Admin"
          />
        </div>

        <div className="lg:p-8">
          <div className="flex w-full flex-col space-y-2">
            <div className="mb-4 flex items-center justify-between">
              <Logo
                className="me-2"
                type="full"
                svgProps={{ className: "h-12 w-auto" }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => {
                  signOut()
                }}
              >
                Sign Out
                <LogoutCurve
                  color="currentColor"
                  size="20"
                  variant="Bulk"
                  className="rotate-180"
                />
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-col space-y-4">
            <div className="flex flex-col text-start">
              <h2 className="text-lg font-semibold tracking-tight">
                Selamat Datang!
              </h2>
              <p className="text-muted-foreground text-sm">
                Silakan pilih club untuk melanjutkan
              </p>
            </div>

            <div className="flex w-full items-center gap-2">
              <InputDebounce
                placeholder="Search clubs..."
                wait={1000}
                onChange={handleSearch}
                className="flex-1"
              />
              <Button variant="outline" size="icon" className="shrink-0">
                <Add className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-15rem)] w-full md:h-[calc(100vh-16rem)]">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 pr-4 pb-4">
                {dataMemo.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center gap-4 py-8">
                    <SearchStatus1
                      size="90"
                      color="currentColor"
                      variant="Bulk"
                    />
                    <p className="text-muted-foreground text-sm">
                      Tidak ada club ditemukan
                    </p>
                  </div>
                ) : (
                  dataMemo.map((clubData, index) => (
                    <Card
                      key={index}
                      className={cn(
                        "relative overflow-hidden p-0 shadow-none transition-all hover:shadow-md",
                        {
                          "cursor-pointer": ["active"].includes(
                            clubData.subscription_status!
                          ),
                          "cursor-not-allowed opacity-50": !["active"].includes(
                            clubData.subscription_status!
                          ),
                        }
                      )}
                      onClick={async () => {
                        if (
                          ["active"].includes(clubData.subscription_status!)
                        ) {
                          await setClubData(clubData)
                        }
                      }}
                    >
                      {!["active"].includes(clubData.subscription_status!) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenRenewSubscription(true)
                            setClubId(clubData.id)
                          }}
                        >
                          Renew
                        </Button>
                      )}
                      <div className="p-6">
                        <h5 className="mb-2 text-lg leading-5 font-semibold">
                          {clubData.name}
                        </h5>
                        <p className="text-muted-foreground mb-3 text-sm">
                          {clubData.address}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {clubData.roles?.map((role, roleIndex) => (
                            <Badge
                              key={roleIndex}
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100"
                            >
                              <span className="capitalize">{role.name}</span>
                            </Badge>
                          ))}
                          {!["active"].includes(
                            clubData.subscription_status!
                          ) ? (
                            <Badge
                              variant="destructive"
                              className="bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100"
                            >
                              <span className="capitalize">
                                Subscription {clubData.subscription_status}
                              </span>
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Expires on{" "}
                              {dayjs(clubData.subscription_end_date).format(
                                "DD MMM YYYY"
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}

                {isLoading &&
                  Array.from(new Array(10), (_, i) => i + 1).map((_, index) => (
                    <Card
                      key={index}
                      className="relative overflow-hidden p-0 shadow-none"
                    >
                      <div className="space-y-3 p-6">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </Card>
                  ))}
                {dataMemo.length !== metaData?.total && (
                  <div className="col-span-full mt-4 text-center">
                    <Button
                      variant="outline"
                      disabled={isLoading || isFetchingNextPage}
                      onClick={() => fetchNextPage()}
                    >
                      {isLoading || isFetchingNextPage ? (
                        <>
                          <span className="mr-2">Loading...</span>
                        </>
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
      <AlertDialogExpiredSubscription
        showCloseButton
        open={openRenewSubscription}
        clubId={clubId}
        onOpenChange={() => setOpenRenewSubscription(false)}
      />
    </>
  )
}

export default Clubs
