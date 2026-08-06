import { useQuery } from "@tanstack/react-query"
import { apiGetMemberFreezeQuota } from "@/services/api/MembeService"
import { AlertCircle, Info } from "lucide-react"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  memberCode?: string
  requestedDays?: number
  startDate?: string
}

export const useFreezeQuota = (memberCode?: string, startDate?: string) => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.freezeQuota, memberCode, startDate],
    queryFn: () => apiGetMemberFreezeQuota(memberCode as string, startDate),
    select: (res) => res.data,
    enabled: Boolean(memberCode),
  })

  return { quota: data, isLoadingQuota: isLoading }
}

const FreezeQuotaInfo = ({ memberCode, requestedDays, startDate }: Props) => {
  const { quota, isLoadingQuota } = useFreezeQuota(memberCode, startDate)

  if (isLoadingQuota) {
    return <Skeleton className="h-16 w-full" />
  }

  if (!quota) {
    return null
  }

  if (!quota.enabled) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Freeze membership sedang dinonaktifkan untuk club ini.
        </AlertDescription>
      </Alert>
    )
  }

  const dayPercent =
    quota.max_days_per_month > 0
      ? Math.min(100, (quota.used_days / quota.max_days_per_month) * 100)
      : 0

  const requestExhausted =
    quota.remaining_requests !== null && quota.remaining_requests < 1
  const notEnoughDays =
    quota.remaining_days !== null &&
    typeof requestedDays === "number" &&
    requestedDays > quota.remaining_days

  return (
    <div className="space-y-2">
      <div className="border-border space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Kuota hari</span>
          <span className="text-foreground font-medium">
            {quota.max_days_per_month > 0
              ? `${quota.used_days} dari ${quota.max_days_per_month} hari terpakai`
              : `${quota.used_days} hari terpakai · tanpa batas`}
          </span>
        </div>
        {quota.max_days_per_month > 0 ? <Progress value={dayPercent} /> : null}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Kuota pengajuan</span>
          <span className="text-foreground font-medium">
            {quota.max_request_per_month > 0
              ? `${quota.used_requests} dari ${quota.max_request_per_month} pengajuan`
              : `${quota.used_requests} pengajuan · tanpa batas`}
          </span>
        </div>
        {quota.min_advance_days > 0 ? (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Paling cepat mulai</span>
            <span className="text-foreground font-medium">
              {quota.earliest_start_date} (H-{quota.min_advance_days})
            </span>
          </div>
        ) : null}
        <p className="text-muted-foreground text-xs">
          Kuota bulan berjalan ({quota.period_start} s/d {quota.period_end}) dan
          kembali penuh tanggal 1. Freeze yang dibatalkan tidak dihitung.
        </p>
      </div>

      {requestExhausted ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kuota pengajuan freeze bulan ini sudah habis.
          </AlertDescription>
        </Alert>
      ) : notEnoughDays ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mengajukan {requestedDays} hari, sisa kuota hanya{" "}
            {quota.remaining_days} hari.
          </AlertDescription>
        </Alert>
      ) : null}

      {!quota.extend_end_date ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Masa berlaku paket <span className="font-medium">tidak</span>{" "}
            diperpanjang selama freeze. Pastikan member mengetahui hal ini.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

export default FreezeQuotaInfo
