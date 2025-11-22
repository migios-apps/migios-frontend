import React, { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { SalesType } from "@/services/api/@types/sales"
import { apiGetSalesList } from "@/services/api/SalesService"
import dayjs from "dayjs"
import { Add } from "iconsax-reactjs"
import { Circle, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusPaymentColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const Sales = () => {
  const navigate = useNavigate()
  const [tabName, setTabName] = React.useState("all")
  const club = useSessionUser((state) => state.club)
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.sales, tableData, club.id, tabName],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetSalesList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "id",
              sort_type: "desc",
            }),
        search: [
          ...(tabName === "all"
            ? [{}]
            : ([
                {
                  search_column: "status",
                  search_condition: "=",
                  search_text: tabName,
                },
              ] as Filter[])),
          ...(tableData.query === ""
            ? [{}]
            : ([
                {
                  search_operator: "and",
                  search_column: "code",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ] as Filter[])),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listData = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = useMemo<DataTableColumnDef<SalesType>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Faktur",
        size: 50,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 50,
        enableColumnActions: false,
        cell: ({ row }) => {
          const status = row.original
          return (
            <div className="flex items-center">
              <Badge
                className={
                  statusPaymentColor[status.status] || statusPaymentColor.unpaid
                }
              >
                <span className="capitalize">
                  {status.fstatus?.split("_").join(" ")}
                </span>
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "due_date",
        header: "Tanggal",
        cell: ({ row }) => {
          return dayjs(row.original.due_date).format("DD-MM-YYYY")
        },
      },
      {
        accessorKey: "amount",
        header: "Total",
        cell: ({ row }) => {
          return row.original.ftotal_amount
        },
      },
      {
        header: "Total Bayar",
        cell: ({ row }) => {
          return row.original.ftotal_payments
        },
      },
      {
        id: "actions",
        header: "Aksi",
        size: 10,
        enableColumnActions: false,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="cursor-pointer text-xl font-semibold select-none"
                    role="button"
                    onClick={() => {
                      navigate(`/sales/${row.original.code}`)
                    }}
                  >
                    <Eye className="h-5 w-5" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View</p>
                </TooltipContent>
              </Tooltip>
              {/* <Tooltip title="Edit">
                <div
                  className={`text-xl cursor-pointer select-none font-semibold`}
                  role="button"
                  onClick={() => {
                    navigate(`/sales/${row.original.code}/edit`)
                  }}
                >
                  <Edit color="currentColor" size={24} />
                </div>
              </Tooltip> */}
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3>Penjualan</h3>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <InputDebounce
          placeholder="Quick search..."
          handleOnchange={(value) => {
            setTableData({
              ...tableData,
              query: value,
              pageIndex: 1,
            })
          }}
        />
        <Button variant="default" onClick={() => navigate("/sales/order")}>
          <Add color="currentColor" size={20} />
          Add new
        </Button>
      </div>
      <Tabs value={tabName} onValueChange={setTabName}>
        <TabsList>
          <TabsTrigger value="all">
            <Circle className="text-primary h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="paid">
            <Circle className="h-4 w-4 text-emerald-700" />
            Paid
          </TabsTrigger>
          <TabsTrigger value="unpaid">
            <Circle className="h-4 w-4 text-gray-700" />
            Unpaid
          </TabsTrigger>
          <TabsTrigger value="part_paid">
            <Circle className="h-4 w-4 text-amber-700" />
            Part-paid
          </TabsTrigger>
          <TabsTrigger value="void">
            <Circle className="h-4 w-4 text-red-700" />
            Cancelled
          </TabsTrigger>
        </TabsList>
        <TabsContent value={tabName} className="py-4">
          <DataTable
            columns={columns}
            data={listData}
            noData={!isLoading && listData.length === 0}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Sales
