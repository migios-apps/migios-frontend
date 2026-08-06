import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import { MemberDetail } from "@/services/api/@types/member"
import { apiGetRekeningList } from "@/services/api/FinancialService"
import {
  apiExecuteMemberPackageTransfer,
  apiGetTransferEligiblePackages,
  apiPreviewMemberPackageTransfer,
} from "@/services/api/MemberPackageTransferService"
import { InfoCircle } from "iconsax-reactjs"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import FormMember from "@/components/form/member/FormMember"
import { useMemberValidation } from "@/components/form/member/memberValidation"
import SalesLayout from "../Layout"
import FormTransferMember from "./FormTransferMember"
import TransferHistory from "./TransferHistory"

const TransferMember = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { settings, isLoading: isLoadingSettings } = useSettings()
  const { club } = useAuth()
  const transferEnabled = Number(settings?.transfer_enabled ?? 0) === 1

  const [from, setFrom] = useState<MemberDetail | null>(null)
  const [to, setTo] = useState<MemberDetail | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [reason, setReason] = useState("")
  const [notes, setNotes] = useState("")
  const [openRegister, setOpenRegister] = useState(false)
  const [openForm, setOpenForm] = useState(false)
  const [rekeningId, setRekeningId] = useState<number | null>(null)
  const memberFormProps = useMemberValidation()

  const { data: rekeningList } = useQuery({
    queryKey: [QUERY_KEY.rekening, "transfer"],
    queryFn: () => apiGetRekeningList({ page: 1, per_page: 50 }),
    select: (res) => res.data.data,
  })

  const { data: eligible, isFetching: isFetchingPackages } = useQuery({
    queryKey: [QUERY_KEY.transferEligible, from?.id],
    enabled: Boolean(from?.id) && transferEnabled,
    queryFn: () => apiGetTransferEligiblePackages(from!.id),
    select: (res) => res.data,
  })

  const packages = useMemo(() => eligible?.packages ?? [], [eligible])

  const runningFee = useMemo(() => {
    const policy = eligible?.policy
    if (!policy || policy.feeType !== "flat" || policy.feeAmount <= 0) return 0
    if (selected.length === 0) return 0
    return policy.feeBasis === "per_package"
      ? policy.feeAmount * selected.length
      : policy.feeAmount
  }, [eligible?.policy, selected.length])

  const allEligibleSelected = useMemo(() => {
    const eligibleIds = packages
      .filter((item) => item.eligible)
      .map((item) => item.member_package_id)
    return (
      eligibleIds.length > 0 && eligibleIds.every((id) => selected.includes(id))
    )
  }, [packages, selected])

  const previewPayload = useMemo(
    () =>
      from && to && selected.length
        ? {
            from_member_id: from.id,
            to_member_id: to.id,
            member_package_ids: selected,
          }
        : null,
    [from, to, selected]
  )

  const { data: preview, isFetching: isFetchingPreview } = useQuery({
    queryKey: [QUERY_KEY.transferPreview, previewPayload],
    enabled: Boolean(previewPayload),
    queryFn: () => apiPreviewMemberPackageTransfer(previewPayload!),
    select: (res) => res.data,
  })

  const resetForm = () => {
    setOpenForm(false)
    setFrom(null)
    setTo(null)
    setSelected([])
    setReason("")
    setNotes("")
    setRekeningId(null)
  }

  const { mutate: executeTransfer, isPending } = useMutation({
    mutationFn: () =>
      apiExecuteMemberPackageTransfer({
        club_id: club?.id as number,
        fee_amount: preview?.fee_amount ?? 0,
        ...(rekeningId ? { rekening_id: rekeningId } : {}),
        from_member_id: from!.id,
        to_member_id: to!.id,
        member_package_ids: selected,
        reason: reason.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: (res) => {
      toast.success(
        `${res.data.packages} paket berhasil dipindahkan ke ${to?.name}`
      )
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.transferList] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.transferEligible] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.members] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.sales] })
      const transactionId = res.data.transaction_id
      resetForm()
      if (transactionId) navigate(`/sales/${transactionId}`)
    },
  })

  if (isLoadingSettings) return null

  return (
    <SalesLayout>
      <TransferHistory
        onCreate={() => setOpenForm(true)}
        canCreate={transferEnabled}
        notice={
          transferEnabled ? null : (
            <div className="bg-muted/40 flex flex-col gap-3 rounded-lg border border-dashed p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <InfoCircle
                  size={20}
                  variant="Bulk"
                  className="text-muted-foreground mt-0.5 shrink-0"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Transfer paket sedang dimatikan
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Riwayat lama tetap bisa dilihat, tapi transfer baru belum
                    bisa dibuat. Nyalakan beserta biaya dan pembatasnya di
                    Pengaturan → Lainnya → Transfer Paket.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => navigate("/settings/others/transfer")}
              >
                Buka Pengaturan
              </Button>
            </div>
          )
        }
      />

      <FormTransferMember
        open={openForm}
        onClose={resetForm}
        from={from}
        to={to}
        selected={selected}
        reason={reason}
        notes={notes}
        rekeningId={rekeningId}
        packages={packages}
        rekeningList={rekeningList ?? []}
        preview={preview}
        policy={eligible?.policy}
        runningFee={runningFee}
        allEligibleSelected={allEligibleSelected}
        isFetchingPackages={isFetchingPackages}
        isFetchingPreview={isFetchingPreview}
        isPending={isPending}
        onChangeFrom={(member) => {
          setFrom(member)
          setSelected([])
        }}
        onChangeTo={setTo}
        onChangeSelected={setSelected}
        onChangeReason={setReason}
        onChangeNotes={setNotes}
        onChangeRekening={setRekeningId}
        onOpenRegister={() => setOpenRegister(true)}
        onSubmit={() => executeTransfer()}
      />

      <FormMember
        open={openRegister}
        type="create"
        formProps={memberFormProps}
        onClose={() => setOpenRegister(false)}
        onCreated={(member) => setTo(member)}
      />
    </SalesLayout>
  )
}

export default TransferMember
