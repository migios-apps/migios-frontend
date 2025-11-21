import { EmployeeDetailPage } from "@/services/api/@types/employee"
import { Card, CardContent } from "@/components/ui/card"
import Commission from "./Commission"
import HistorySession from "./HistorySession"

const InformasiDetail = ({
  employee,
}: {
  employee: EmployeeDetailPage | null
}) => {
  return (
    <div className="flex w-full flex-col gap-4">
      <Card className="p-0 shadow-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Gaji pokok</span>
              <span className="text-foreground text-sm font-medium">
                {employee?.earnings?.fbase_salary || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                Komisi Penjualan
              </span>
              <span className="text-foreground text-sm font-medium">
                {employee?.earnings?.fsales || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                Komisi Per Sesi
              </span>
              <span className="text-foreground text-sm font-medium">
                {employee?.earnings?.fsession || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">
                Komisi Per Class
              </span>
              <span className="text-foreground text-sm font-medium">
                {employee?.earnings?.fclass || "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Commission employee={employee} />

      {employee?.type === "trainer" && <HistorySession employee={employee} />}
    </div>
  )
}

export default InformasiDetail
