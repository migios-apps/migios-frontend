import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { VoucherDetail } from "@/services/api/@types/voucher"
import { apiGetVoucherList } from "@/services/api/VoucherService"
import { Add, Edit } from "iconsax-reactjs"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import DataTable, { type DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import InputDebounce from "@/components/ui/input-debounce"
import FormVoucher from "@/components/form/voucher/FormVoucher"
import {
  resetVoucherForm,
  useVoucherForm,
} from "@/components/form/voucher/voucherValidation"

const PACKAGE_TYPE_LABEL: Record<string, string> = {
  membership: "Membership",
  pt_program: "Personal Trainer",
  class: "Class",
}

const VoucherPage = () => {
  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: { order: "", key: "" },
  })
  const [showForm, setShowForm] = React.useState(false)
  const [formType, setFormType] = React.useState<"create" | "update">("create")

  const formProps = useVoucherForm()

  const { data, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.vouchers, tableData],
    initialPageParam: 1,
    queryFn: async () =>
      apiGetVoucherList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key
          ? {
              sort_column: tableData.sort.key as string,
              sort_type: tableData.sort.order as "asc" | "desc",
            }
          : { sort_column: "id", sort_type: "desc" }),
        search:
          tableData.query === ""
            ? []
            : [
                {
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                  search_operator: "or",
                },
                {
                  search_column: "code",
                  search_condition: "like",
                  search_text: tableData.query,
                  search_operator: "or",
                },
              ],
      }),
    getNextPageParam: (last) =>
      last.data.meta.page !== last.data.meta.total_page
        ? last.data.meta.page + 1
        : undefined,
  })

  const vouchers = React.useMemo(
    () => data?.pages.flatMap((page) => page.data.data) ?? [],
    [data]
  )
  const meta = data?.pages[0]?.data.meta

  const openCreate = () => {
    resetVoucherForm(formProps)
    setFormType("create")
    setShowForm(true)
  }

  const openEdit = (voucher: VoucherDetail) => {
    formProps.reset({
      id: voucher.id,
      name: voucher.name,
      description: voucher.description ?? "",
      code: voucher.code,
      discount_type: voucher.discount_type,
      discount_value: Number(voucher.discount_value),
      min_purchase: Number(voucher.min_purchase),
      max_discount:
        voucher.max_discount === null || voucher.max_discount === undefined
          ? null
          : Number(voucher.max_discount),
      max_usage: voucher.max_usage,
      max_usage_per_member: voucher.max_usage_per_member,
      target: voucher.target,
      package_types: (voucher.package_types ?? []).map(
        (item) => item.package_type
      ),
      scope: voucher.scope ?? "all",
      scope_package_ids: (voucher.items ?? [])
        .map((item) => item.package_id)
        .filter((id): id is number => Boolean(id)),
      scope_product_ids: (voucher.items ?? [])
        .map((item) => item.product_id)
        .filter((id): id is number => Boolean(id)),
      enabled: voucher.enabled,
      start_date: dayjs(voucher.start_date).format("YYYY-MM-DD"),
      expire_date: dayjs(voucher.expire_date).format("YYYY-MM-DD"),
    })
    setFormType("update")
    setShowForm(true)
  }

  const columns: DataTableColumnDef<VoucherDetail>[] = [
    {
      header: "Kode",
      accessorKey: "code",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.code}</span>
          <span className="text-muted-foreground text-xs">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      header: "Diskon",
      accessorKey: "discount_value",
      cell: ({ row }) =>
        row.original.discount_type === "percent"
          ? `${Number(row.original.discount_value)}%`
          : currencyFormat(Number(row.original.discount_value)),
    },
    {
      header: "Min. Pembelian",
      accessorKey: "min_purchase",
      cell: ({ row }) => currencyFormat(Number(row.original.min_purchase)),
    },
    {
      header: "Kuota",
      accessorKey: "max_usage",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span>
            Total: {row.original.max_usage === 0 ? "∞" : row.original.max_usage}
          </span>
          <span className="text-muted-foreground">
            Per member:{" "}
            {row.original.max_usage_per_member === 0
              ? "∞"
              : row.original.max_usage_per_member}
          </span>
        </div>
      ),
    },
    {
      header: "Berlaku Untuk",
      accessorKey: "target",
      cell: ({ row }) =>
        row.original.target === "public" ? (
          <Badge variant="secondary">Semua pembeli</Badge>
        ) : (
          <div className="flex flex-wrap gap-1">
            {(row.original.package_types ?? []).map((item) => (
              <Badge key={item.package_type} variant="outline">
                {PACKAGE_TYPE_LABEL[item.package_type] ?? item.package_type}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      header: "Periode",
      accessorKey: "start_date",
      cell: ({ row }) => (
        <div className="flex flex-col text-xs">
          <span>{dayjs(row.original.start_date).format("DD MMM YYYY")}</span>
          <span className="text-muted-foreground">
            s/d {dayjs(row.original.expire_date).format("DD MMM YYYY")}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "enabled",
      cell: ({ row }) =>
        row.original.enabled ? (
          <Badge>Aktif</Badge>
        ) : (
          <Badge variant="destructive">Nonaktif</Badge>
        ),
    },
    {
      id: "action",
      header: "",
      size: 60,
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => openEdit(row.original)}
        >
          <Edit size="18" color="currentColor" variant="Bulk" />
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Voucher</h1>
          <p className="text-muted-foreground text-sm">
            Kelola kode voucher diskon yang bisa dipakai saat transaksi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InputDebounce
            placeholder="Cari kode atau nama"
            value={tableData.query}
            onChange={(value) =>
              setTableData((prev) => ({
                ...prev,
                query: String(value),
                pageIndex: 1,
              }))
            }
          />
          <Button onClick={openCreate}>
            <Add size="18" color="currentColor" variant="Bulk" />
            Tambah Voucher
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={vouchers}
        loading={isLoading}
        pagingData={{
          total: meta?.total ?? 0,
          pageIndex: tableData.pageIndex as number,
          pageSize: tableData.pageSize as number,
        }}
        pinnedColumns={{ right: ["action"] }}
        onPaginationChange={(pageIndex) =>
          setTableData((prev) => ({ ...prev, pageIndex }))
        }
        onSelectChange={(pageSize) =>
          setTableData((prev) => ({ ...prev, pageSize, pageIndex: 1 }))
        }
        onSort={(sort) => setTableData((prev) => ({ ...prev, sort }))}
      />

      <FormVoucher
        open={showForm}
        type={formType}
        formProps={formProps}
        onClose={() => setShowForm(false)}
      />
    </div>
  )
}

export default VoucherPage
