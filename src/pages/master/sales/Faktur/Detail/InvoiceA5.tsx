import { SalesDetailType } from "@/services/api/@types/sales"
import dayjs from "dayjs"

interface InvoiceA5Props {
  detail: SalesDetailType
}

const InvoiceA5 = ({ detail }: InvoiceA5Props) => {
  const invoiceStyle = {
    fontSize: "14px",
  }
  return (
    <div className="bg-background min-h-screen p-6" style={invoiceStyle}>
      <div className="border-border bg-card mx-auto mb-24 max-w-4xl overflow-hidden rounded-lg border shadow-lg">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 font-bold" style={invoiceStyle}>
                {detail?.club.name}
              </h1>
              <div className="text-primary-foreground/80 space-y-1">
                <p>{detail?.club.address}</p>
                <p>
                  {detail?.club.city}, {detail?.club.state},{" "}
                  {detail?.club.country}
                </p>
                <p>
                  {detail?.club.phone} • {detail?.club.email}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="mb-2 font-bold" style={invoiceStyle}>
                FAKTUR
              </h2>
              <div className="bg-primary-foreground/10 rounded-lg p-3">
                <p className="font-bold" style={invoiceStyle}>
                  #{detail?.code}
                </p>
                <p className="text-primary-foreground/80">
                  {dayjs(detail?.due_date).format("DD MMM YYYY")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Customer Info */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border-border bg-muted rounded-lg border p-4">
              <h3
                className="text-foreground mb-3 font-bold"
                style={invoiceStyle}
              >
                Tagihan Ke:
              </h3>
              <div className="text-muted-foreground space-y-1">
                <p className="text-foreground font-semibold">
                  {detail?.member?.name}
                </p>
                <p>{detail?.member?.address}</p>
                <p>{detail?.member?.email}</p>
                <p>{detail?.member?.phone}</p>
              </div>
            </div>
            {detail?.employee ? (
              <div className="border-border bg-muted rounded-lg border p-4">
                <h3
                  className="text-foreground mb-3 font-bold"
                  style={invoiceStyle}
                >
                  Penjualan Dari:
                </h3>
                <div className="text-muted-foreground space-y-1">
                  <p className="text-foreground font-semibold">
                    {detail?.employee?.name}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Items Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse" style={invoiceStyle}>
              <thead>
                <tr className="bg-muted">
                  <th className="border-border text-foreground border px-1 py-3 text-left align-top font-semibold">
                    Item
                  </th>
                  <th className="border-border text-foreground border px-1 py-3 text-center align-top font-semibold">
                    Qty
                  </th>
                  <th className="border-border text-foreground border px-1 py-3 text-right align-top font-semibold">
                    Harga
                  </th>
                  <th className="border-border text-foreground border px-1 py-3 text-right align-top font-semibold">
                    Diskon
                  </th>
                  <th className="border-border text-foreground border px-1 py-3 text-right align-top font-semibold">
                    Tarif pajak
                  </th>
                  <th className="border-border text-foreground border px-1 py-3 text-right align-top font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail?.items.map((item, index) => {
                  const formatDuration = `${item.duration} ${item.duration_type}`
                  const dateRange =
                    item.start_date && item.end_date
                      ? `${dayjs(item.start_date).format("DD MMM YYYY")} - ${dayjs(item.end_date).format("DD MMM YYYY")}`
                      : null

                  return (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="border-border border px-1 py-2 align-top">
                        <div>
                          <span className="text-foreground font-semibold">
                            {item.name}
                          </span>
                          {item.item_type === "package" ? (
                            <div className="mt-2 space-y-1">
                              <div className="text-muted-foreground">
                                Durasi: {formatDuration}
                                {item.session_duration > 0
                                  ? ` • Sessions: ${item.session_duration}`
                                  : null}
                              </div>
                              {dateRange ? (
                                <div className="text-muted-foreground">
                                  Periode: {dateRange}
                                </div>
                              ) : null}
                              {item.package?.type === "pt_program" &&
                              item.trainer ? (
                                <div
                                  className="text-foreground font-semibold"
                                  style={invoiceStyle}
                                >
                                  Trainer: {item.trainer.name}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="border-border border px-1 py-2 text-center align-top">
                        {item.quantity}
                      </td>
                      <td className="border-border border px-1 py-2 text-right align-top">
                        {item.fprice}
                      </td>
                      <td className="border-border border px-1 py-2 text-right align-top">
                        {item.fdiscount_amount}
                      </td>
                      <td className="border-border border px-1 py-2 text-right align-top">
                        <ul>
                          {item.taxes.map((tax) => (
                            <li key={tax.id}>
                              {`${tax.name} ${tax.rate}%: ${tax.famount}`}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="border-border text-foreground border px-1 py-2 text-right align-top font-semibold">
                        {item.fnet_amount}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Payment Info */}
            <div className="lg:col-span-1">
              <div className="border-border bg-primary/5 rounded-lg border p-4">
                <h6
                  className="text-foreground mb-3 font-bold"
                  style={invoiceStyle}
                >
                  Pembayaran
                </h6>
                {detail?.payments && detail.payments.length > 0 ? (
                  <div className="space-y-2">
                    {detail.payments.map((payment, index) => (
                      <div
                        key={index}
                        className="flex justify-between"
                        style={invoiceStyle}
                      >
                        <span className="text-muted-foreground">
                          {payment.rekening_name}:
                        </span>
                        <span className="text-foreground font-medium">
                          {payment.famount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground" style={invoiceStyle}>
                    Tidak ada pembayaran
                  </p>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div className="lg:col-span-1"></div>

            {/* Totals */}
            <div className="lg:col-span-1">
              <div className="border-border bg-muted rounded-lg border p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-foreground font-medium">
                      {detail?.fsubtotal_net_amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diskon:</span>
                    <span className="text-foreground font-medium">
                      -{detail?.ftotal_discount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pajak:</span>
                    <span className="text-foreground font-medium">
                      {detail?.ftotal_tax}
                    </span>
                  </div>
                  <div className="border-border border-t pt-3">
                    <div
                      className="text-foreground flex justify-between font-bold"
                      style={invoiceStyle}
                    >
                      <span>Total:</span>
                      <span className="text-primary">
                        {detail?.ftotal_amount}
                      </span>
                    </div>
                  </div>
                  {detail?.ballance_amount && detail.ballance_amount > 0 ? (
                    <div className="text-destructive flex justify-between">
                      <span>Sisa Pembayaran:</span>
                      <span className="font-medium">
                        {detail.fballance_amount}
                      </span>
                    </div>
                  ) : null}
                  {detail?.point_earned && detail.point_earned > 0 ? (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Point Diperoleh:</span>
                      <span className="font-medium">
                        +{detail.point_earned} Pts
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="mt-12 grid grid-cols-3 gap-8">
            <div className="text-center">
              <p
                className="text-foreground mb-24 font-semibold"
                style={invoiceStyle}
              >
                Admin
              </p>
              <div className="border-border border-b"></div>
            </div>
            <div className="text-center">
              <p
                className="text-foreground mb-24 font-semibold"
                style={invoiceStyle}
              >
                Tenaga Penjualan
              </p>
              <div className="border-border border-b"></div>
              <p
                className="text-muted-foreground mt-2 font-semibold capitalize"
                style={invoiceStyle}
              >
                {detail?.employee?.name || ""}
              </p>
            </div>
            <div className="text-center">
              <p
                className="text-foreground mb-24 font-semibold"
                style={invoiceStyle}
              >
                Member
              </p>
              <div className="border-border border-b"></div>
              <p
                className="text-muted-foreground mt-2 font-semibold capitalize"
                style={invoiceStyle}
              >
                {detail?.member?.name || ""}
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="border-border bg-warning/10 border-warning/20 mt-8 rounded-lg border p-4">
            <h3 className="text-foreground mb-3 font-bold" style={invoiceStyle}>
              Syarat & Ketentuan:
            </h3>
            <ol
              className="text-muted-foreground ml-5 list-decimal space-y-1"
              style={invoiceStyle}
            >
              <li>
                Keanggotaan tidak dapat dipindahtangankan dan tidak dapat
                dikembalikan.
              </li>
              <li>
                Paket dan sesi tidak dapat dikembalikan atau dipindahtangankan.
              </li>
              <li>
                Member harus mematuhi aturan gym dan menghormati staf serta
                anggota lainnya.
              </li>
              <li>
                {detail?.club.name} tidak bertanggung jawab atas cedera atau
                kecelakaan di tempat.
              </li>
            </ol>
          </div>

          {/* Footer */}
          <div className="border-border mt-8 border-t py-4 text-center">
            <p className="text-muted-foreground" style={invoiceStyle}>
              Terima kasih atas kunjungan Anda! Semoga harimu menyenangkan!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceA5
