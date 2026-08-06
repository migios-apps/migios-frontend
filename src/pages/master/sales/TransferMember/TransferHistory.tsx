import { useMemo, useState } from "react"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { MemberPackageTransfer } from "@/services/api/@types/transfer"
import {
  apiGetMemberPackageTransferList,
  apiVoidMemberPackageTransfer,
} from "@/services/api/MemberPackageTransferService"
import { Add, CloseCircle } from "iconsax-reactjs"
import { toast } from "sonner"
import { formatPackageDate } from "@/utils/formatPackageDate"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { useSettings } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DataTable, { DataTableColumnDef } from "@/components/ui/data-table"
import InputDebounce from "@/components/ui/input-debounce"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"

function voidBlockReason(
  row: MemberPackageTransfer,
  windowHours: number
): string | null {
  if (windowHours <= 0) {
    return "Pembatalan dimatikan di pengaturan cabang"
  }
  if (row.recipient_attendance_count > 0) {
    return "Penerima sudah check-in dengan paket ini — pakai Transfer Balik"
  }
  const elapsed =
    (Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60)
  if (elapsed > windowHours) {
    return `Batas waktu pembatalan (${windowHours} jam) sudah lewat`
  }
  return null
}

type TransferHistoryProps = {
  onCreate: () => void
  canCreate: boolean
}

const TransferHistory = ({ onCreate, canCreate }: TransferHistoryProps) => {
  const queryClient = useQueryClient()
  const { settings } = useSettings()
  const voidWindowHours = Number(settings?.transfer_void_window_hours ?? 24)
  const [voidTarget, setVoidTarget] = useState<MemberPackageTransfer | null>(
    null
  )
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: { order: "", key: "" },
  })

  const { data, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.transferList, tableData],
    initialPageParam: 1,
    queryFn: () =>
      apiGetMemberPackageTransferList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.query
          ? {
              search: [
                {
                  search_column: "from_member_name",
                  search_condition: "like",
                  search_text: tableData.query as string,
                  search_operator: "or",
                },
                {
                  search_column: "to_member_name",
                  search_condition: "like",
                  search_text: tableData.query as string,
                  search_operator: "or",
                },
                {
                  search_column: "from_member_code",
                  search_condition: "like",
                  search_text: tableData.query as string,
                  search_operator: "or",
                },
                {
                  search_column: "to_member_code",
                  search_condition: "like",
                  search_text: tableData.query as string,
                  search_operator: "or",
                },
              ],
            }
          : {}),
        ...(tableData.sort?.key
          ? {
              sort_column: tableData.sort.key as string,
              sort_type: tableData.sort.order as "asc" | "desc",
            }
          : { sort_column: "id", sort_type: "desc" }),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const rows = useMemo(
    () => data?.pages.flatMap((page) => page.data.data) ?? [],
    [data]
  )
  const meta = data?.pages[0]?.data.meta

  const { mutate: voidTransfer, isPending } = useMutation({
    mutationFn: () => apiVoidMemberPackageTransfer(voidTarget!.transaction_id!),
    onSuccess: () => {
      toast.success("Transfer dibatalkan, paket dikembalikan ke pemberi")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.transferList] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.transferEligible] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.members] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.memberPackages] })
      setVoidTarget(null)
    },
  })

  const columns: DataTableColumnDef<MemberPackageTransfer>[] = [
    {
      header: "Tanggal",
      accessorKey: "transferred_at",
      size: 130,
      cell: ({ row }) => (
        <span className="text-sm">
          {formatPackageDate(row.original.transferred_at)}
        </span>
      ),
    },
    {
      header: "Dari",
      accessorKey: "from_member_name",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{row.original.from_member_name}</p>
          <p className="text-muted-foreground font-mono text-xs">
            {row.original.from_member_code}
          </p>
        </div>
      ),
    },
    {
      header: "Ke",
      accessorKey: "to_member_name",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{row.original.to_member_name}</p>
          <p className="text-muted-foreground font-mono text-xs">
            {row.original.to_member_code}
          </p>
        </div>
      ),
    },
    {
      header: "Paket",
      accessorKey: "package_count",
      size: 80,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.package_count} paket</span>
      ),
    },
    {
      header: "Biaya",
      accessorKey: "fee_amount",
      size: 130,
      cell: ({ row }) => (
        <span className="text-sm">
          {Number(row.original.fee_amount) > 0
            ? `Rp ${Number(row.original.fee_amount).toLocaleString("id-ID")}`
            : "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      size: 190,
      cell: ({ row }) =>
        row.original.status === "voided" ? (
          <div className="space-y-1">
            <Badge
              variant="outline"
              className="border-destructive/40 text-destructive text-[10px]"
            >
              Dibatalkan
            </Badge>
            {row.original.void_reason ? (
              <p className="text-muted-foreground text-xs">
                {row.original.void_reason}
                {row.original.voided_by_name
                  ? ` · oleh ${row.original.voided_by_name}`
                  : ""}
              </p>
            ) : null}
          </div>
        ) : (
          <Badge variant="secondary" className="text-[10px]">
            Selesai
          </Badge>
        ),
    },
    {
      header: "Staff",
      accessorKey: "created_by_name",
      size: 120,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.created_by_name ?? "—"}
        </span>
      ),
    },
    {
      id: "action",
      header: "",
      size: 130,
      cell: ({ row }) => {
        if (row.original.status !== "completed") return null
        if (!row.original.transaction_id) return null
        const blocked = voidBlockReason(row.original, voidWindowHours)
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={Boolean(blocked)}
            title={blocked ?? undefined}
            onClick={() => setVoidTarget(row.original)}
          >
            <CloseCircle size={16} variant="Bulk" />
            {blocked ? "Tidak bisa" : "Batalkan"}
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Riwayat Transfer</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full max-w-xs">
              <InputDebounce
                name="transfer_history_search"
                placeholder="Cari nama atau kode member"
                handleOnchange={(value) =>
                  setTableData((prev) => ({
                    ...prev,
                    query: value,
                    pageIndex: 1,
                  }))
                }
              />
            </div>
            {canCreate ? (
              <Button onClick={onCreate}>
                <Add color="currentColor" size={20} />
                Transfer Baru
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            pagingData={{
              total: meta?.total ?? 0,
              pageIndex: tableData.pageIndex as number,
              pageSize: tableData.pageSize as number,
            }}
            onPaginationChange={(pageIndex) =>
              setTableData((prev) => ({ ...prev, pageIndex }))
            }
            onSelectChange={(pageSize) =>
              setTableData((prev) => ({ ...prev, pageSize, pageIndex: 1 }))
            }
            noData={!isLoading && rows.length === 0}
          />
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(voidTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setVoidTarget(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Batalkan Transfer</DialogTitle>
          </DialogHeader>

          {voidTarget ? (
            <div className="space-y-4">
              <div className="text-muted-foreground space-y-2 rounded-lg border p-3 text-sm">
                <p>Yang akan dikembalikan:</p>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  <li>
                    {voidTarget.package_count} paket kembali ke{" "}
                    <span className="text-foreground font-medium">
                      {voidTarget.from_member_name}
                    </span>{" "}
                    dengan masa berlaku semula
                  </li>
                  <li>Jadwal PT yang ikut berpindah dipulihkan</li>
                  {Number(voidTarget.fee_amount) > 0 ? (
                    <li>
                      Transaksi biaya Rp{" "}
                      {Number(voidTarget.fee_amount).toLocaleString("id-ID")}{" "}
                      dibatalkan dan keluar dari laporan pendapatan
                    </li>
                  ) : null}
                </ul>
                <p className="text-xs">
                  Hanya bisa dilakukan selama{" "}
                  <span className="text-foreground font-medium">
                    {voidTarget.to_member_name}
                  </span>{" "}
                  belum check-in atau memakai sesi. Setelah itu, gunakan
                  transfer balik.
                </p>
              </div>

              <p className="text-muted-foreground text-xs">
                Pembatalan dilakukan lewat void transaksi penjualan, jadi
                seluruh jejaknya konsisten dengan penjualan lain: transaksi
                ditandai void, pembayaran dibatalkan, dan paket dikembalikan.
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setVoidTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || !voidTarget?.transaction_id}
              onClick={() => voidTransfer()}
            >
              {isPending ? "Membatalkan..." : "Batalkan Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TransferHistory
