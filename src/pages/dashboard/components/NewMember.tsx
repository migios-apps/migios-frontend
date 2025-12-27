import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { apiGetMemberList } from "@/services/api/MembeService"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const NewMember = () => {
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate("/members")
  }

  const handleView = useCallback(
    (code: string) => {
      navigate(`/members/detail/${code}`)
    },
    [navigate]
  )

  const {
    data: members,
    // isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberDashboard],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberList({
        page: 1,
        per_page: 3,
        sort_column: "id",
        sort_type: "desc",
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const memberList = useMemo(
    () => (members ? members.pages.flatMap((page) => page.data.data) : []),
    [members]
  )

  return (
    <Card className="gap-0 p-4">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <CardTitle>Member baru</CardTitle>
            <p className="text-muted-foreground text-xs">
              Dengan status membership.
            </p>
          </div>
          <Button size="sm" onClick={handleViewAll}>
            Lihat semua
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {memberList.map((item) => (
              <div
                key={item.id}
                className="group flex cursor-pointer items-center justify-between py-2 dark:border-gray-600"
                onClick={() => handleView(item.code)}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-12 w-12 border border-gray-300 bg-white dark:border-gray-500">
                    <AvatarImage src={item.photo} alt={item.name} />
                    <AvatarFallback>
                      {item.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold capitalize">
                      {item.name}
                    </span>
                    <p className="text-muted-foreground text-xs">{item.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColor[item.membeship_status]}>
                    <span className="capitalize">{item.membeship_status}</span>
                  </Badge>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default NewMember
