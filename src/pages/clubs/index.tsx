import React, { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import { Filter } from "@/services/api/@types/api"
import { apiGetUserClubList } from "@/services/api/ClubService"
import { Add, LogoutCurve } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import InputDebounce from "@/components/ui/input-debounce"
import { ScrollArea } from "@/components/ui/scroll-area"
import AlertDialogExpiredSubscription from "@/components/AlertDialogExpiredSubscription"

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
      <div className="flex w-full flex-col items-start gap-4 px-4">
        <div className="relative flex w-full items-center justify-between gap-4">
          <Button
            className="gap-1 px-2"
            onClick={() => {
              signOut()
            }}
          >
            Sign Out
            <LogoutCurve
              color="currentColor"
              size="32"
              variant="Bulk"
              className="rotate-180"
            />
          </Button>
        </div>
        <div className="relative">
          <h2 className="mb-2">Welcome!</h2>
          <p className="heading-text font-semibold">
            Please select a club to continue
          </p>
        </div>
        <div className="flex w-full items-center gap-2">
          <InputDebounce
            placeholder="Search..."
            wait={1000}
            onChange={handleSearch}
          />
          <Button
            className="gap-1 px-3"
            onClick={() => {
              signOut()
            }}
          >
            <Add color="#000" className="h-5 w-5" />
            Add
          </Button>
        </div>
        <ScrollArea className="h-full max-h-[70vh] w-full pr-3 pb-4">
          <div className="grid grid-cols-1 gap-3 md:gap-3 lg:grid-cols-2">
            {data?.pages.map((page) =>
              page.data.data.map((data, index) => (
                <Card
                  key={index}
                  className="relative p-0"
                  // clickable={['active'].includes(data.subscription_status!)}
                  // disabled={!['active'].includes(data.subscription_status!)}
                >
                  {!["active"].includes(data.subscription_status!) ? (
                    <Button
                      className="absolute right-1 bottom-1 z-10 h-8 p-2 py-0"
                      onClick={() => {
                        setOpenRenewSubscription(true)
                        setClubId(data.id)
                      }}
                    >
                      Renew
                    </Button>
                  ) : null}
                  <div
                    className={cn("cursor-pointer p-6", {
                      "cursor-not-allowed rounded-2xl opacity-50": ![
                        "active",
                      ].includes(data.subscription_status!),
                    })}
                    onClick={async () => {
                      if (["active"].includes(data.subscription_status!)) {
                        await setClubData(data)
                      }
                    }}
                  >
                    <h5 className="mb-2 text-lg leading-5 font-semibold text-gray-900 dark:text-gray-200">
                      {data.name}
                    </h5>
                    <p className="text-gray-900 dark:text-gray-200">
                      {data.address}
                    </p>
                    {data.roles?.map((role, index) => (
                      <Badge
                        key={index}
                        className="mt-2 bg-emerald-200 text-gray-900 dark:bg-emerald-200 dark:text-gray-900"
                      >
                        <span className="capitalize">{role.name}</span>
                      </Badge>
                    ))}
                    {!["active"].includes(data.subscription_status!) ? (
                      <Badge className="mt-2 bg-red-200 text-gray-900 dark:bg-red-200 dark:text-gray-900">
                        <span className="capitalize">
                          Subscription {data.subscription_status}
                        </span>
                      </Badge>
                    ) : (
                      <Badge>
                        Expires on{" "}
                        {dayjs(data.subscription_end_date).format(
                          "DD MMM YYYY"
                        )}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
          <div className="mt-4 text-center">
            {dataMemo.length !== metaData?.total ? (
              <Button
                disabled={isLoading || isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {(isLoading || isFetchingNextPage) && (
                  <span className="mr-2">Loading...</span>
                )}
                Load More
              </Button>
            ) : null}
          </div>
        </ScrollArea>
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
