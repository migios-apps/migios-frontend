import React from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import {
  LoyaltyPointType,
  LoyaltyPointRedeem,
  MemberDetail,
} from "@/services/api/@types/member"
import {
  apiGetMemberLoyaltyBalance,
  apiGetMemberLoyaltyList,
  apiGetMemberLoyaltyRedeem,
} from "@/services/api/MembeService"
import dayjs from "dayjs"
import { MedalStar } from "iconsax-reactjs"
import { Edit } from "lucide-react"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DialogAdjustLoyaltyPoint from "./DialogAdjustLoyaltyPoint"

interface LoyaltyPointProps {
  member: MemberDetail
}

const LoyaltyPoint: React.FC<LoyaltyPointProps> = ({ member }) => {
  const [openAdjustDialog, setOpenAdjustDialog] = React.useState(false)
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
      const res = await apiGetMemberLoyaltyList(member.code, {
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

  const earnedColumns = React.useMemo<DataTableColumnDef<LoyaltyPointType>[]>(
    () => [
      {
        accessorKey: "points",
        header: "Poin",
        cell: (props) => {
          const data = props.row.original
          const colorClass =
            data.type === "earn"
              ? "text-green-700"
              : data.type === "expired"
                ? "text-red-700"
                : "text-orange-700"
          return (
            <div className={`text-sm font-medium ${colorClass}`}>
              {data.type === "earn" ? "+" : ""}
              {data.points}
            </div>
          )
        },
      },
      {
        accessorKey: "type",
        header: "Tipe",
        cell: (props) => {
          const type = props.row.original.type
          const colorClass =
            type === "earn"
              ? statusColor.active
              : type === "expired"
                ? statusColor.expired
                : statusColor.rejected
          const typeLabel =
            type === "earn"
              ? "Diperoleh"
              : type === "expired"
                ? "Kadaluarsa"
                : "Redeem"
          return <Badge className={colorClass}>{typeLabel}</Badge>
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
      {
        accessorKey: "transaction_code",
        header: "Ref",
        size: 50,
        cell: (props) => {
          return (
            <div className="text-sm">
              {props.row.original.transaction_code || "-"}
            </div>
          )
        },
      },
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
      <Card className="border-orange-300 bg-orange-100 py-0 text-orange-700 shadow-none dark:bg-orange-500/30 dark:text-orange-300">
        <CardContent className="flex items-center justify-between gap-2 p-2">
          <div className="flex items-center gap-2">
            <MedalStar size="80" variant="Bulk" />
            <div className="flex flex-col items-start gap-1">
              <div className="text-foreground text-2xl font-bold">
                {balanceData?.balance || 0}
              </div>
              <div className="text-muted-foreground text-xs">
                Total Poin Loyalty
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenAdjustDialog(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Adjust Poin
          </Button>
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

      <DialogAdjustLoyaltyPoint
        open={openAdjustDialog}
        onClose={() => setOpenAdjustDialog(false)}
        memberCode={member.code}
      />
    </div>
  )
}

export default LoyaltyPoint
