import { useQuery } from "@tanstack/react-query"
import { apiGetRekeningList } from "@/services/api/FinancialService"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Label } from "@/components/ui/label"

type Props = {
  fee: number
  feeExplanation: string
  rekeningId?: number | null
  onChangeRekening: (id: number, name: string) => void
}

const rupiah = (value: number) =>
  `Rp ${Math.round(value).toLocaleString("id-ID")}`

const FreezePaymentPicker = ({
  fee,
  feeExplanation,
  rekeningId,
  onChangeRekening,
}: Props) => {
  const isPriced = fee > 0

  const { data: rekeningList } = useQuery({
    queryKey: [QUERY_KEY.rekening, "freeze"],
    queryFn: () => apiGetRekeningList({ page: 1, per_page: 50 }),
    select: (res) => res.data.data,
    enabled: isPriced,
  })

  if (!isPriced) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
        {feeExplanation} Tidak perlu memilih metode pembayaran.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Biaya Freeze</Label>
        <div className="bg-primary/10 text-primary flex h-20 items-center justify-center rounded-md text-2xl font-bold tabular-nums">
          {rupiah(fee)}
        </div>
        <p className="text-muted-foreground text-xs">{feeExplanation}</p>
      </div>

      <div className="space-y-2">
        <Label>
          Rekening Penerimaan Biaya <span className="text-destructive">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {(rekeningList ?? []).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeRekening(item.id!, item.name!)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-colors",
                rekeningId === item.id
                  ? "border-primary bg-primary/5 font-medium"
                  : "hover:bg-accent/40"
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
        <p className="text-muted-foreground text-xs">
          Freeze wajib lunas — tidak bisa dibayar sebagian.
        </p>
      </div>
    </div>
  )
}

export default FreezePaymentPicker
