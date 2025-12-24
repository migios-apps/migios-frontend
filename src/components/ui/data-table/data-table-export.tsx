import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"

export type ExportType = "pdf" | "excel" | "csv"

export interface ExportOption {
  title: string
  type: ExportType
}

interface DataTableExportProps {
  title?: string
  options: ExportOption[]
  onExportClick: (type: ExportType) => void
}

const exportIcons = {
  pdf: FileText,
  excel: FileSpreadsheet,
  csv: FileSpreadsheet,
}

export function DataTableExport({
  title = "Export",
  options,
  onExportClick,
}: DataTableExportProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => {
          const Icon = exportIcons[option.type]
          return (
            <DropdownMenuItem
              key={option.type}
              onClick={() => onExportClick(option.type)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {option.title}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
