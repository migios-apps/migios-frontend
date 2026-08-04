import { useQuery } from "@tanstack/react-query"
import type { EmployeeCommissionDetailRow } from "@/services/api/@types/report-employee"
import { apiGetEmployeeCommission } from "@/services/api/ReportService"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { toKpiCards } from "../../utils/kpiCards"

const columns: DataTableColumnDef<EmployeeCommissionDetailRow>[] = [
  {
    header: "Tanggal",
    accessorKey: "due_date",
    cell: ({ row }) => dayjs(row.original.due_date).format("DD MMM YYYY"),
  },
  {
    header: "Karyawan",
    accessorKey: "employee_name",
    size: 180,
    cell: ({ row }) => row.original.employee_name ?? "-",
  },
  {
    header: "Tipe",
    accessorKey: "type",
    cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
  },
  {
    header: "Item",
    accessorKey: "item_name",
    size: 200,
    cell: ({ row }) => row.original.item_name ?? "-",
  },
  {
    header: "Faktur",
    accessorKey: "transaction_code",
    cell: ({ row }) => row.original.transaction_code ?? "-",
  },
  {
    header: "Base Amount",
    accessorKey: "base_amount",
    cell: ({ row }) => currencyFormat(row.original.base_amount),
  },
  {
    header: "Dasar Komisi",
    accessorKey: "commission_base_amount",
    cell: ({ row }) => currencyFormat(row.original.commission_base_amount),
  },
  {
    header: "Rate",
    accessorKey: "rate",
    cell: ({ row }) =>
      row.original.rate_type === "percent"
        ? `${row.original.rate}%`
        : currencyFormat(row.original.rate),
  },
  {
    header: "Diskon Proporsional",
    accessorKey: "proportional_discount",
    cell: ({ row }) => currencyFormat(row.original.proportional_discount),
  },
  {
    header: "Komisi",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.amount)}</span>
    ),
  },
]

const CommissionSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportEmployee, "commission", params],
    queryFn: () => apiGetEmployeeCommission(params),
    select: (res) => res.data,
  })

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <ReportTableCard
        title="Rincian Komisi"
        columns={columns}
        data={data?.rows ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default CommissionSection
