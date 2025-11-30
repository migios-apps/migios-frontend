import React from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import {
  LoyaltyPointEarned,
  LoyaltyPointRedeem,
  MemberDetail,
} from "@/services/api/@types/member"
import {
  apiGetMemberLoyaltyBalance,
  apiGetMemberLoyaltyEarned,
  apiGetMemberLoyaltyRedeem,
} from "@/services/api/MembeService"
import dayjs from "dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoyaltyPointProps {
  member: MemberDetail
}

const LoyaltyPoint: React.FC<LoyaltyPointProps> = ({ member }) => {
  const [earnedTableData, setEarnedTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "desc",
      key: "created_at",
    },
  })

  const [redeemTableData, setRedeemTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "desc",
      key: "created_at",
    },
  })

  const { data: balanceData } = useQuery({
    queryKey: [QUERY_KEY.memberLoyaltyBalance, member.code],
    queryFn: () => apiGetMemberLoyaltyBalance(member.code),
    select: (res) => res.data,
    enabled: !!member.code,
  })

  const {
    data: earnedData,
    isFetchingNextPage: isFetchingEarned,
    isLoading: isLoadingEarned,
    error: errorEarned,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberLoyaltyEarned, earnedTableData, member.code],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberLoyaltyEarned(member.code, {
        page: earnedTableData.pageIndex,
        per_page: earnedTableData.pageSize,
        ...(earnedTableData.sort?.key !== ""
          ? {
              sort_column: earnedTableData.sort?.key as string,
              sort_type: earnedTableData.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "created_at",
              sort_type: "desc",
            }),
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const {
    data: redeemData,
    isFetchingNextPage: isFetchingRedeem,
    isLoading: isLoadingRedeem,
    error: errorRedeem,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberLoyaltyRedeem, redeemTableData, member.code],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberLoyaltyRedeem(member.code, {
        page: redeemTableData.pageIndex,
        per_page: redeemTableData.pageSize,
        ...(redeemTableData.sort?.key !== ""
          ? {
              sort_column: redeemTableData.sort?.key as string,
              sort_type: redeemTableData.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "created_at",
              sort_type: "desc",
            }),
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const earnedList = React.useMemo(
    () =>
      earnedData ? earnedData.pages.flatMap((page) => page.data.data) : [],
    [earnedData]
  )
  const earnedTotal = earnedData?.pages[0]?.data.meta.total

  const redeemList = React.useMemo(
    () =>
      redeemData ? redeemData.pages.flatMap((page) => page.data.data) : [],
    [redeemData]
  )
  const redeemTotal = redeemData?.pages[0]?.data.meta.total

  const earnedColumns = React.useMemo<DataTableColumnDef<LoyaltyPointEarned>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "Tanggal",
        cell: (props) => {
          return (
            <div className="text-sm">
              {dayjs(props.row.original.created_at).format("DD MMM YYYY HH:mm")}
            </div>
          )
        },
      },
      {
        accessorKey: "transaction_code",
        header: "Kode Transaksi",
        cell: (props) => {
          return (
            <div className="text-sm">
              {props.row.original.transaction_code || "-"}
            </div>
          )
        },
      },
      {
        accessorKey: "points",
        header: "Poin",
        cell: (props) => {
          return (
            <div className="text-sm font-medium">
              +{props.row.original.points}
            </div>
          )
        },
      },
      {
        accessorKey: "is_forever",
        header: "Status",
        cell: (props) => {
          const isForever = props.row.original.is_forever
          return (
            <Badge variant={isForever ? "default" : "secondary"}>
              {isForever ? "Selamanya" : "Terbatas"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "expired_at",
        header: "Kadaluarsa",
        cell: (props) => {
          const expiredAt = props.row.original.expired_at
          if (props.row.original.is_forever) {
            return <div className="text-muted-foreground text-sm">-</div>
          }
          return (
            <div className="text-sm">
              {expiredAt ? dayjs(expiredAt).format("DD MMM YYYY") : "-"}
            </div>
          )
        },
      },
      {
        accessorKey: "description",
        header: "Deskripsi",
        cell: (props) => {
          return (
            <div className="text-muted-foreground text-sm">
              {props.row.original.description || "-"}
            </div>
          )
        },
      },
    ],
    []
  )

  const redeemColumns = React.useMemo<DataTableColumnDef<LoyaltyPointRedeem>[]>(
    () => [
      {
        accessorKey: "created_at",
        header: "Tanggal",
        cell: (props) => {
          return (
            <div className="text-sm">
              {dayjs(props.row.original.created_at).format("DD MMM YYYY HH:mm")}
            </div>
          )
        },
      },
      {
        accessorKey: "reward.name",
        header: "Reward",
        cell: (props) => {
          return (
            <div className="text-sm font-medium">
              {props.row.original.reward?.name || "-"}
            </div>
          )
        },
      },
      {
        accessorKey: "reward.type",
        header: "Tipe",
        cell: (props) => {
          const type = props.row.original.reward?.type
          return (
            <Badge variant="outline">
              {type === "discount" ? "Diskon" : "Free Item"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "points_used",
        header: "Poin Digunakan",
        cell: (props) => {
          return (
            <div className="text-destructive text-sm font-medium">
              -{props.row.original.points_used}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (props) => {
          const status = props.row.original.status
          const statusMap: Record<string, string> = {
            pending: "Menunggu",
            completed: "Selesai",
            cancelled: "Dibatalkan",
          }
          return (
            <Badge className={statusColor[status]}>
              {statusMap[status] || status}
            </Badge>
          )
        },
      },
      {
        accessorKey: "notes",
        header: "Catatan",
        cell: (props) => {
          return (
            <div className="text-muted-foreground text-sm">
              {props.row.original.notes || "-"}
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-accent py-0 shadow-none">
        <CardContent className="flex items-center justify-center gap-2 p-4">
          <div className="flex flex-col items-center gap-1">
            <div className="text-foreground text-2xl font-bold">
              {balanceData?.balance || 0}
            </div>
            <div className="text-muted-foreground text-xs">
              Total Poin Loyalty
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="earned">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned">Poin Diperoleh</TabsTrigger>
          <TabsTrigger value="redeem">History Redeem</TabsTrigger>
        </TabsList>
        <TabsContent value="earned" className="mt-4">
          <DataTable
            columns={earnedColumns}
            data={earnedList}
            noData={
              (!isLoadingEarned && earnedList.length === 0) || !!errorEarned
            }
            loading={isLoadingEarned || isFetchingEarned}
            pagingData={{
              total: earnedTotal as number,
              pageIndex: earnedTableData.pageIndex as number,
              pageSize: earnedTableData.pageSize as number,
            }}
            onPaginationChange={(val) => {
              setEarnedTableData({
                ...earnedTableData,
                pageIndex: val,
              })
            }}
            onSelectChange={(val) => {
              setEarnedTableData({
                ...earnedTableData,
                pageSize: val,
                pageIndex: 1,
              })
            }}
            onSort={(val) => {
              setEarnedTableData({
                ...earnedTableData,
                sort: val,
              })
            }}
          />
        </TabsContent>
        <TabsContent value="redeem" className="mt-4">
          <DataTable
            columns={redeemColumns}
            data={redeemList}
            noData={
              (!isLoadingRedeem && redeemList.length === 0) || !!errorRedeem
            }
            loading={isLoadingRedeem || isFetchingRedeem}
            pagingData={{
              total: redeemTotal as number,
              pageIndex: redeemTableData.pageIndex as number,
              pageSize: redeemTableData.pageSize as number,
            }}
            onPaginationChange={(val) => {
              setRedeemTableData({
                ...redeemTableData,
                pageIndex: val,
              })
            }}
            onSelectChange={(val) => {
              setRedeemTableData({
                ...redeemTableData,
                pageSize: val,
                pageIndex: 1,
              })
            }}
            onSort={(val) => {
              setRedeemTableData({
                ...redeemTableData,
                sort: val,
              })
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LoyaltyPoint
