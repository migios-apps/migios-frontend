import { useState } from "react"
import { MemberPackageTypes } from "@/services/api/@types/member"
import { ArrowSwapHorizontal } from "iconsax-reactjs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import PackageTransferChain from "./PackageTransferChain"

type PackageTransferBadgeProps = {
  data: Pick<
    MemberPackageTypes,
    | "id"
    | "member_id"
    | "transferred_from_id"
    | "transferred_from_name"
    | "transferred_to_name"
  >
}

const PackageTransferBadge = ({ data }: PackageTransferBadgeProps) => {
  const [open, setOpen] = useState(false)

  const label = data.transferred_to_name
    ? `Ditransfer ke ${data.transferred_to_name}`
    : data.transferred_from_name
      ? `Warisan dari ${data.transferred_from_name}`
      : null

  if (!label) return null

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        <Badge
          variant="outline"
          className="gap-1 border-violet-300 text-[10px] text-violet-700 dark:text-violet-300"
        >
          <ArrowSwapHorizontal size={12} variant="Bulk" />
          {label}
        </Badge>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Riwayat Kepemilikan Paket</DialogTitle>
          </DialogHeader>
          <PackageTransferChain
            memberPackageId={data.id}
            currentMemberId={data.member_id}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PackageTransferBadge
