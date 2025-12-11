import { SalesDetailType } from "@/services/api/@types/sales"
import dayjs from "dayjs"
import { cn } from "@/lib/utils"

interface InvoiceReceiptProps {
  detail: SalesDetailType
}

const InvoiceReceipt = ({ detail }: InvoiceReceiptProps) => {
  return (
    <div className="flex justify-center p-6">
      <div className="mb-24 w-80 border border-gray-100 shadow-xl">
        {/* Receipt Header */}
        <div className="border-b border-gray-300 p-4 text-center">
          <h2 className="text-lg font-bold">{detail?.club.name}</h2>
          <p className="mt-1 text-xs">{detail?.club.address}</p>
          <p className="text-xs">{detail?.club.phone}</p>
          <div className="mt-2 border-t border-gray-300 pt-2">
            <p className="text-sm font-semibold">Faktur {detail?.code}</p>
            <p className="text-xs">
              {dayjs(detail?.due_date).format("DD MMM YYYY")}
            </p>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-4 text-sm">
          {/* Items */}
          <div className="mb-4">
            {detail?.items.map((item, index) => {
              return (
                <div
                  key={index}
                  className={cn("", {
                    "mb-3 border-b border-dashed border-gray-300 pb-2":
                      index < detail.items.length - 1,
                  })}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-medium">
                        {item.quantity} x {item.name}
                      </p>
                      {item.discount_amount > 0 ? (
                        <p className="text-xs text-red-600">
                          Diskon: -{item.fdiscount_amount}
                        </p>
                      ) : null}
                      {item.taxes && item.taxes.length > 0 ? (
                        <div className="mt-1 text-xs text-gray-600">
                          {item.taxes.map((tax) => (
                            <p key={tax.id}>
                              {tax.name} {tax.rate}%
                              {/* {tax.name} {tax.rate}%: {tax.famount} */}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-medium">{item.fprice}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-300 py-3">
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-semibold">Subtotal</span>
              <span>{detail?.fsubtotal_net_amount}</span>
            </div>
            {detail?.total_discount && detail.total_discount !== 0 ? (
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold">Total Diskon</span>
                <span>
                  {detail.total_discount > 0
                    ? `-${detail.ftotal_discount}`
                    : detail.ftotal_discount}
                </span>
              </div>
            ) : null}
            {detail?.total_tax && detail.total_tax !== 0 ? (
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold">Total Pajak</span>
                <span>{detail.ftotal_tax}</span>
              </div>
            ) : null}
            {detail?.rounding_amount !== 0 ? (
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold">Pembulatan</span>
                <span>{detail.frounding_amount}</span>
              </div>
            ) : null}
            <div className="mt-2 border-t border-gray-300 pt-2">
              <div className="flex justify-between font-bold">
                <span className="font-semibold">Total Bayar</span>
                <span>{detail.ftotal_amount}</span>
              </div>
            </div>

            {/* Payment Info */}
            {detail.payments.map((payment, index) => (
              <div key={index} className="flex justify-between text-xs">
                <div className="flex gap-1">
                  <span className="font-semibold">{payment.rekening_name}</span>
                  <span>{dayjs(payment.date).format("DD MMM YYYY")}</span>
                </div>
                <span>{payment.famount}</span>
              </div>
            ))}
            {detail?.ballance_amount && detail.ballance_amount !== 0 ? (
              <div className="mt-1 flex justify-between text-xs text-red-600">
                <span className="font-semibold">Sisa Pembayaran</span>
                <span>{detail.fballance_amount}</span>
              </div>
            ) : null}
          </div>
          <div className="mb-4 border-t border-gray-300"></div>

          {/* Additional Info */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Saldo sebelumnya</span>
              <span>0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Point Diperoleh</span>
              <span>{detail?.point_earned || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Digunakan</span>
              <span>{detail?.point_redeemed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Pengembalian</span>
              <span>{detail.freturn_amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Total point dibatalkan</span>
              <span>{detail?.point_cancelled || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceReceipt
