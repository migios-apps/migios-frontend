import { MemberDetail } from "@/services/api/@types/member"
import { TransferPreview, WEEKDAY_LABEL } from "@/services/api/@types/transfer"
import { Warning2 } from "iconsax-reactjs"
import { formatPackageDate } from "@/utils/formatPackageDate"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const PACKAGE_TYPE_LABEL: Record<string, string> = {
  membership: "Membership",
  pt_program: "PT Program",
  class: "Kelas",
}

type TransferSummaryProps = {
  preview: TransferPreview | undefined
  isLoading: boolean
  from: MemberDetail
  to: MemberDetail
}

const TransferSummary = ({
  preview,
  isLoading,
  from,
  to,
}: TransferSummaryProps) => {
  if (isLoading || !preview) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3">
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Dari</p>
          <p className="text-sm font-medium">{from.name}</p>
          <p className="text-muted-foreground font-mono text-xs">{from.code}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Ke</p>
          <p className="text-sm font-medium">{to.name}</p>
          <p className="text-muted-foreground font-mono text-xs">{to.code}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-xs">Tanggal</p>
          <p className="text-sm font-medium">
            {formatPackageDate(preview.transferred_at)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {preview.packages.map((item) => (
          <div
            key={item.member_package_id}
            className="space-y-2 rounded-lg border p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">{item.package_name}</span>
              <Badge variant="outline" className="text-[10px]">
                {PACKAGE_TYPE_LABEL[item.package_type] ?? item.package_type}
              </Badge>
            </div>

            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <div className="bg-muted/40 space-y-0.5 rounded-md p-2">
                <p className="text-muted-foreground">{from.name}</p>
                <p className="font-medium">
                  {formatPackageDate(item.from_start_date)} —{" "}
                  {formatPackageDate(item.from_end_date_after)}
                </p>
                <p className="text-muted-foreground">berakhir di sini</p>
              </div>
              <div className="bg-primary/5 border-primary/20 space-y-0.5 rounded-md border p-2">
                <p className="text-muted-foreground">{to.name}</p>
                <p className="font-medium">
                  {item.status === "pending"
                    ? "Mulai saat check-in pertama"
                    : `${formatPackageDate(item.to_start_date)} — ${formatPackageDate(item.to_end_date)}`}
                </p>
                <p className="text-muted-foreground">
                  {item.status === "pending"
                    ? "belum aktif"
                    : `${item.remaining_days} hari`}
                  {item.remaining_sessions > 0
                    ? ` · ${item.remaining_sessions} sesi`
                    : ""}
                </p>
              </div>
            </div>

            {item.package_type === "pt_program" ? (
              <div className="space-y-2 rounded-md border border-dashed p-2">
                {item.pt_schedules.length ? (
                  <>
                    <p className="text-muted-foreground text-xs">
                      Jadwal yang ikut berpindah ke {to.name} mulai{" "}
                      {formatPackageDate(preview.transferred_at)}:
                    </p>
                    <ul className="space-y-1">
                      {item.pt_schedules.map((schedule) => (
                        <li
                          key={schedule.event_id}
                          className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
                        >
                          <span className="font-medium">
                            {schedule.weekdays.length
                              ? schedule.weekdays
                                  .map(
                                    (day) =>
                                      `${WEEKDAY_LABEL[day.day_of_week] ?? day.day_of_week} ${day.start_time}–${day.end_time}`
                                  )
                                  .join(" · ")
                              : `${schedule.start_time ?? "—"}–${schedule.end_time ?? "—"}`}
                          </span>
                          <span className="text-muted-foreground">
                            Trainer{" "}
                            {schedule.trainer_name ?? "belum ditentukan"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    Tidak ada jadwal latihan mendatang pada paket ini.
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  <span className="text-foreground font-medium">
                    Beri tahu trainer
                  </span>{" "}
                  — orang yang datang berbeda, dan slot ini tetap dipakai. Untuk
                  mengubah jamnya, sunting jadwal di halaman Jadwal setelah
                  transfer selesai.
                </p>
              </div>
            ) : null}

            {item.package_type === "class" ? (
              <p className="text-muted-foreground rounded-md border border-dashed p-2 text-xs">
                Jadwal kelas tidak berubah — {to.name} hadir di kelas dan jam
                yang sama.
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <span className="text-sm">
          {preview.packages.length} paket
          {preview.fee_basis === "per_package" && preview.fee_amount > 0
            ? " (biaya per paket)"
            : ""}
        </span>
        <span className="text-lg font-semibold">
          {preview.fee_amount > 0
            ? `Rp ${preview.fee_amount.toLocaleString("id-ID")}`
            : "Gratis"}
        </span>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-100 p-3 text-amber-800 dark:border-amber-300/40 dark:bg-amber-100/10 dark:text-amber-300">
        <Warning2 size={18} variant="Bulk" className="mt-0.5 shrink-0" />
        <p className="text-xs">
          {preview.void_window_hours > 0 ? (
            <>
              Transfer dapat dibatalkan dalam{" "}
              <span className="font-semibold">
                {preview.void_window_hours} jam
              </span>
              , selama {to.name} belum check-in atau memakai sesi. Setelah itu,
              koreksinya hanya lewat transfer balik.
            </>
          ) : (
            <>
              Transfer ini{" "}
              <span className="font-semibold">tidak dapat dibatalkan</span>{" "}
              sesuai pengaturan cabang.
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default TransferSummary
