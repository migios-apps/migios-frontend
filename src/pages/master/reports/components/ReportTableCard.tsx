import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import DataTable, {
  type DataTableColumnDef,
  type OnSortParam,
} from "@/components/ui/data-table"

interface ReportTableCardProps<T> {
  title: string
  description?: string
  columns: DataTableColumnDef<T>[]
  data: T[]
  loading?: boolean
  showPagination?: boolean
  pagingData?: { total: number; pageIndex: number; pageSize: number }
  onPaginationChange?: (page: number) => void
  onSelectChange?: (size: number) => void
  onSort?: (sort: OnSortParam) => void
  action?: ReactNode
  footer?: ReactNode
  className?: string
}

const ReportTableCard = <T,>({
  title,
  description,
  columns,
  data,
  loading,
  showPagination = false,
  pagingData,
  onPaginationChange,
  onSelectChange,
  onSort,
  action,
  footer,
  className,
}: ReportTableCardProps<T>) => (
  <Card className={cn("gap-1 shadow-none", className)}>
    <CardHeader className="flex flex-row items-start justify-between gap-2">
      <div className="flex flex-col">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </div>
      {action}
    </CardHeader>
    <CardContent>
      <DataTable<T>
        columns={columns}
        data={data}
        loading={Boolean(loading)}
        showPagination={showPagination}
        pagingData={pagingData}
        onPaginationChange={onPaginationChange}
        onSelectChange={onSelectChange}
        onSort={onSort}
      />
      {footer}
    </CardContent>
  </Card>
)

export default ReportTableCard
