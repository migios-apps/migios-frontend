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
    <div
      className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900"
      style={invoiceStyle}
    >
      <div className="mx-auto mb-24 max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 font-bold text-white" style={invoiceStyle}>
                {detail?.club.name}
              </h1>
              <div className="space-y-1 text-blue-100">
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
              <h2 className="mb-2 font-bold text-white" style={invoiceStyle}>
                FAKTUR
              </h2>
              <div className="rounded-lg bg-white/20 p-3">
                <p className="font-bold" style={invoiceStyle}>
                  #{detail?.code}
                </p>
                <p className="text-blue-100">
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
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <h3
                className="mb-3 font-bold text-gray-800 dark:text-gray-200"
                style={invoiceStyle}
              >
                Tagihan Ke:
              </h3>
              <div className="space-y-1 text-gray-600 dark:text-gray-300">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {detail?.member?.name}
                </p>
                <p>{detail?.member?.address}</p>
                <p>{detail?.member?.email}</p>
                <p>{detail?.member?.phone}</p>
              </div>
            </div>
            {detail?.employee ? (
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <h3
                  className="mb-3 font-bold text-gray-800 dark:text-gray-200"
                  style={invoiceStyle}
                >
                  Penjualan Dari:
                </h3>
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
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
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-300 px-1 py-3 text-left align-top font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-200">
                    Item
                  </th>
                  <th className="border border-gray-300 px-1 py-3 text-center align-top font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-200">
                    Qty
                  </th>
                  <th className="border border-gray-300 px-1 py-3 text-right align-top font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-200">
                    Harga
                  </th>
                  <th className="border border-gray-300 px-1 py-3 text-right align-top font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-200">
                    Diskon
                  </th>
                  <th className="border border-gray-300 px-1 py-3 text-right align-top font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-200">
                    Tarif pajak
                  </th>
                  <th className="border border-gray-300 px-1 py-3 text-right align-top font-semibold text-gray-800 dark:border-gray-600 dark:text-gray-200">
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
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="border border-gray-300 px-1 py-2 align-top dark:border-gray-600">
                        <div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {item.name}
                          </span>
                          {item.item_type === "package" ? (
                            <div className="mt-2 space-y-1">
                              <div className="text-gray-500 dark:text-gray-400">
                                Durasi: {formatDuration}
                                {item.session_duration > 0
                                  ? ` • Sessions: ${item.session_duration}`
                                  : null}
                              </div>
                              {dateRange ? (
                                <div className="text-gray-500 dark:text-gray-400">
                                  Periode: {dateRange}
                                </div>
                              ) : null}
                              {item.package?.type === "pt_program" &&
                              item.trainer ? (
                                <div
                                  className="font-semibold"
                                  style={invoiceStyle}
                                >
                                  Trainer: {item.trainer.name}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-1 py-2 text-center align-top dark:border-gray-600">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-1 py-2 text-right align-top dark:border-gray-600">
                        {item.fprice}
                      </td>
                      <td className="border border-gray-300 px-1 py-2 text-right align-top dark:border-gray-600">
                        {item.fdiscount_amount}
                      </td>
                      <td className="border border-gray-300 px-1 py-2 text-right align-top dark:border-gray-600">
                        <ul>
                          {item.taxes.map((tax) => (
                            <li key={tax.id}>
                              {`${tax.name} ${tax.rate}%: ${tax.famount}`}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="border border-gray-300 px-1 py-2 text-right align-top font-semibold dark:border-gray-600">
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
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h6
                  className="mb-3 font-bold text-gray-800 dark:text-gray-200"
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
                        <span className="text-gray-600 dark:text-gray-400">
                          {payment.rekening_name}:
                        </span>
                        <span className="font-medium">{payment.famount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-gray-500 dark:text-gray-400"
                    style={invoiceStyle}
                  >
                    Tidak ada pembayaran
                  </p>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div className="lg:col-span-1"></div>

            {/* Totals */}
            <div className="lg:col-span-1">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="font-medium">
                      {detail?.fsubtotal_net_amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Diskon:
                    </span>
                    <span className="font-medium">
                      -{detail?.ftotal_discount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Pajak:
                    </span>
                    <span className="font-medium">{detail?.ftotal_tax}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 dark:border-gray-600">
                    <div
                      className="flex justify-between font-bold"
                      style={invoiceStyle}
                    >
                      <span>Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {detail?.ftotal_amount}
                      </span>
                    </div>
                  </div>
                  {detail?.ballance_amount && detail.ballance_amount > 0 ? (
                    <div className="flex justify-between text-red-600 dark:text-red-400">
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
              <p className="mb-24 font-semibold" style={invoiceStyle}>
                Admin
              </p>
              <div className="border-b border-gray-400"></div>
            </div>
            <div className="text-center">
              <p className="mb-24 font-semibold" style={invoiceStyle}>
                Tenaga Penjualan
              </p>
              <div className="border-b border-gray-400"></div>
              <p
                className="mt-2 font-semibold text-gray-600 capitalize dark:text-gray-400"
                style={invoiceStyle}
              >
                {detail?.employee?.name || ""}
              </p>
            </div>
            <div className="text-center">
              <p className="mb-24 font-semibold" style={invoiceStyle}>
                Member
              </p>
              <div className="border-b border-gray-400"></div>
              <p
                className="mt-2 font-semibold text-gray-600 capitalize dark:text-gray-400"
                style={invoiceStyle}
              >
                {detail?.member?.name || ""}
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h3
              className="mb-3 font-bold text-gray-800 dark:text-gray-200"
              style={invoiceStyle}
            >
              Syarat & Ketentuan:
            </h3>
            <ol
              className="ml-5 list-decimal space-y-1 text-gray-600 dark:text-gray-400"
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
          <div className="mt-8 border-t border-gray-200 py-4 text-center dark:border-gray-600">
            <p
              className="text-gray-500 dark:text-gray-400"
              style={invoiceStyle}
            >
              Terima kasih atas kunjungan Anda! Semoga harimu menyenangkan!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceA5
