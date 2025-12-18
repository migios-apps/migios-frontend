import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { PackageDetail } from "@/services/api/@types/package"
import { apiGetPackageList } from "@/services/api/PackageService"
import { Add, Edit, Gift } from "iconsax-reactjs"
import { PackageType } from "@/constants/packages"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { type DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import FormMembership from "@/components/form/package/FormMembership"
import {
  resetPackageMembershipForm,
  usePackageMembershipForm,
} from "@/components/form/package/package"
import LayoutPackages from "./Layout"

const Membership = () => {
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const [showForm, setShowForm] = React.useState<boolean>(false)
  const [formType, setFormType] = React.useState<"create" | "update">("create")

  const formProps = usePackageMembershipForm()

  const { data, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.packageMembership, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetPackageList({
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
          {
            search_column: "type",
            search_condition: "=",
            search_text: PackageType.MEMBERSHIP,
          },
          ...((tableData.query === ""
            ? []
            : [
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ]) as Filter[]),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listData = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total

  const columns = React.useMemo<DataTableColumnDef<PackageDetail>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        minSize: 220,
      },
      {
        accessorKey: "fprice",
        header: "Price",
      },
      {
        header: "Discount",
        cell: ({ row }) => {
          const data = row.original
          if (!data.is_promo) return null

          return <>{data.fdiscount}</>
        },
      },
      {
        accessorKey: "fsell_price",
        header: "Sell Price",
        minSize: 180,
      },
      {
        accessorKey: "duration",
        header: "Duration",
        size: 10,
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.fduration}</div>
        },
      },
      {
        accessorKey: "loyalty_point_value",
        header: "Earn Point",
        cell: ({ row }) => {
          const data = row.original

          return (
            <>
              <div className="flex items-center gap-2">
                <Gift className="text-primary size-5" />
                <div>
                  <div className="text-foreground text-sm font-medium">
                    {data.loyalty_point_value} Points
                  </div>
                  {!data.loyalty_point_value ? null : (
                    <div className="text-muted-foreground text-xs">
                      {data.loyalty_point?.expired_type === "forever"
                        ? "Forever"
                        : `For ${data.loyalty_point?.expired_value ?? 0} ${data.loyalty_point?.expired_type}${(data.loyalty_point?.expired_value ?? 0) > 1 ? "s" : ""}`}
                    </div>
                  )}
                </div>
              </div>
            </>
          )
        },
      },
      {
        accessorKey: "enabled",
        header: "Status",
        size: 10,
        cell: ({ row }) => {
          const status = row.original.enabled ? "active" : "inactive"
          return (
            <Badge
              className={`border ${statusColor[status]} px-2 py-1 text-xs font-semibold uppercase`}
            >
              {status}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 50,
        enableColumnActions: false,
        cell: ({ row }) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  setShowForm(true)
                  setFormType("update")
                  formProps.setValue("id", row.original.id)
                  formProps.setValue("name", row.original.name)
                  formProps.setValue("price", row.original.price)
                  formProps.setValue("photo", row.original.photo)
                  formProps.setValue("is_promo", row.original.is_promo)
                  formProps.setValue(
                    "discount_type",
                    row.original.discount_type
                  )
                  formProps.setValue("discount", row.original.discount)
                  formProps.setValue(
                    "loyalty_point",
                    row.original.loyalty_point
                  )
                  formProps.setValue("description", row.original.description)
                  formProps.setValue("duration", row.original.duration)
                  formProps.setValue(
                    "duration_type",
                    row.original.duration_type
                  )
                  formProps.setValue(
                    "session_duration",
                    row.original.session_duration
                  )
                  formProps.setValue("enabled", row.original.enabled)
                  formProps.setValue(
                    "allow_all_trainer",
                    row.original.allow_all_trainer
                  )
                  formProps.setValue(
                    "enable_commission",
                    row.original.enable_commission
                  )
                }}
              >
                <Edit color="currentColor" size={20} />
                <span className="sr-only">Edit package</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit</p>
            </TooltipContent>
          </Tooltip>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <LayoutPackages>
      <TooltipProvider>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 pt-4 md:flex-row md:items-center md:justify-between">
            <InputDebounce
              placeholder="Cari paket membership..."
              handleOnchange={(value) => {
                setTableData({
                  ...tableData,
                  query: value,
                  pageIndex: 1,
                })
              }}
            />
            <Button
              onClick={() => {
                resetPackageMembershipForm(formProps)
                setShowForm(true)
                setFormType("create")
              }}
            >
              <Add color="currentColor" className="mr-2 size-4" />
              Add new
            </Button>
          </div>

          <div className="border-border bg-card mt-1 rounded-lg border p-1 shadow-sm">
            <DataTable
              columns={columns}
              data={listData}
              noData={!isLoading && listData.length === 0}
              loading={isFetchingNextPage || isLoading}
              pagingData={{
                total: total as number,
                pageIndex: tableData.pageIndex as number,
                pageSize: tableData.pageSize as number,
              }}
              pinnedColumns={{
                right: ["actions"],
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

          <FormMembership
            open={showForm}
            type={formType}
            formProps={formProps}
            onClose={() => setShowForm(false)}
          />
        </div>
      </TooltipProvider>
    </LayoutPackages>
  )
}

export default Membership
