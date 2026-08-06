import { useQuery } from "@tanstack/react-query"
import { apiGetMemberPackageTransferChain } from "@/services/api/MemberPackageTransferService"
import { ArrowDown2 } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { formatPackageDate } from "@/utils/formatPackageDate"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type PackageTransferChainProps = {
  memberPackageId: number
  currentMemberId?: number
}

const PackageTransferChain = ({
  memberPackageId,
  currentMemberId,
}: PackageTransferChainProps) => {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.transferChain, memberPackageId],
    queryFn: () => apiGetMemberPackageTransferChain(memberPackageId),
    select: (res) => res.data,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  const nodes = data ?? []

  if (nodes.length < 2) {
    return (
      <p className="text-muted-foreground text-sm">
        Paket ini belum pernah berpindah kepemilikan.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{nodes[0].package_name}</p>
      <div className="space-y-0">
        {nodes.map((node, index) => {
          const isCurrent = node.member_id === currentMemberId
          return (
            <div key={node.id}>
              <div
                className={cn(
                  "flex flex-wrap items-center gap-2 rounded-lg border p-3",
                  isCurrent && "border-primary bg-primary/5"
                )}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {node.member_name}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] capitalize",
                        statusColor[node.status]
                      )}
                    >
                      {node.status === "transferred"
                        ? "Ditransfer"
                        : node.status}
                    </Badge>
                    {isCurrent ? (
                      <span className="text-primary text-xs font-medium">
                        ← sekarang
                      </span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {formatPackageDate(node.start_date)} —{" "}
                    {formatPackageDate(node.end_date)}
                  </p>
                </div>
              </div>

              {index < nodes.length - 1 ? (
                <div className="text-muted-foreground flex items-center gap-1 py-1 pl-4 text-xs">
                  <ArrowDown2 size={14} variant="Bulk" />
                  <span>dipindahkan</span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PackageTransferChain
