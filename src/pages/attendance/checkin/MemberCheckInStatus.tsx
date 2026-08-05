import { CheckCode } from "@/services/api/@types/attendance"
import { Building } from "iconsax-reactjs"
import { AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

type Props = {
  member: CheckCode | null
}

const MemberCheckInStatus = ({ member }: Props) => {
  if (!member) {
    return null
  }

  const maxPerDay = member.checkin_max_per_day ?? 0
  const today = member.checkin_today ?? 0
  const showQuota = maxPerDay > 0 || today > 0
  const quotaReached = maxPerDay > 0 && today >= maxPerDay

  return (
    <div className="space-y-2">
      {member.is_cross_club ? (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">
            <Building size={14} className="mr-1" variant="Bulk" />
            Member {member.home_club_name ?? "cabang lain"}
          </Badge>
          <span className="text-muted-foreground text-xs">
            kehadiran dicatat di cabang ini
          </span>
        </div>
      ) : null}

      {member.membership_status === "grace" ? (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Paket <span className="font-medium">{member.name}</span> sudah
            berakhir dan sedang dalam masa tenggang. Tawarkan perpanjangan
            sebelum masa tenggang habis.
          </AlertDescription>
        </Alert>
      ) : null}

      {member.warning === "package_expired" ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Paket <span className="font-medium">{member.name}</span> sudah
            berakhir. Check-in tetap dicatat sesuai pengaturan club — tawarkan
            perpanjangan.
          </AlertDescription>
        </Alert>
      ) : null}

      {showQuota ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Kunjungan hari ini</span>
          <Badge variant={quotaReached ? "destructive" : "secondary"}>
            {maxPerDay > 0 ? `${today} dari ${maxPerDay}` : `${today}`}
          </Badge>
          {maxPerDay === 0 ? (
            <span className="text-xs">tanpa batas</span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default MemberCheckInStatus
