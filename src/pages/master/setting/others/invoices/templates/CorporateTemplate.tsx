import React from "react"
import { InvoiceTemplateProps } from "./index"

const CorporateTemplate: React.FC<InvoiceTemplateProps> = ({
  data,
  signatures,
}) => {
  // Helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Table calculation
  const getTotal = (item: any) => {
    return (item.qty || 0) * (item.unitPrice || 0)
  }

  const subtotal =
    data.items?.reduce((sum, item) => sum + getTotal(item), 0) || 0
  const tax = 20 // Demo, bisa diganti dengan perhitungan
  const discount = 0 // Demo, bisa diganti dengan perhitungan
  const grandTotal = subtotal + tax - discount

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="relative overflow-hidden bg-[#18233a]">
        {/* Logo section - left side */}
        <div className="flex justify-between">
          <div className="relative z-10 w-[60%] p-6 pb-10">
            <div className="text-lg font-bold tracking-widest text-white">
              YOUR LOGO
            </div>
            <div className="mt-1 text-xs text-gray-200">SLOGAN</div>
          </div>

          {/* Invoice section - right side */}
          <div className="relative z-10 w-[40%] p-6 text-right">
            <div className="text-3xl font-bold tracking-wider text-white">
              INVOICE
            </div>
            <div className="mt-1 text-xs text-gray-200">
              ID NO : {data.invoiceNumber || "1234112260666"}
            </div>
          </div>
        </div>

        {/* Diagonal orange accent */}
        <div className="absolute bottom-0 left-0 h-24 w-full">
          <div
            className="absolute bottom-0 left-0 h-24 w-full bg-orange-400"
            style={{
              clipPath: "polygon(0 100%, 100% 100%, 100% 0, 70% 0, 0 100%)",
            }}
          ></div>
          <div
            className="absolute bottom-0 left-0 h-20 w-full bg-[#18233a]"
            style={{
              clipPath: "polygon(0 100%, 100% 100%, 100% 0, 65% 0, 0 100%)",
            }}
          ></div>
          <div
            className="absolute bottom-0 left-0 h-16 w-full bg-orange-400/30"
            style={{
              clipPath: "polygon(0 100%, 100% 100%, 100% 0, 60% 0, 0 100%)",
            }}
          ></div>
        </div>
      </div>

      {/* Info To/From */}
      <div className="flex justify-between gap-4 px-6 pt-8 pb-4">
        <div>
          <div className="mb-1 inline-block rounded bg-[#18233a] px-2 py-1 text-xs font-bold text-white">
            Invoice To :
          </div>
          <div className="text-sm font-bold">{data.invoiceTo}</div>
          <div className="text-xs whitespace-pre-line text-gray-700">
            {data.invoiceToAddress}
          </div>
        </div>
        <div>
          <div className="mb-1 inline-block rounded bg-[#18233a] px-2 py-1 text-xs font-bold text-white">
            Invoice From :
          </div>
          <div className="text-sm font-bold">{data.companyName}</div>
          <div className="text-xs whitespace-pre-line text-gray-700">
            {data.companyAddress}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pt-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-orange-400 text-white">
              <th className="p-2">DISCRIPTION</th>
              <th className="p-2">PRICE</th>
              <th className="p-2">QTY</th>
              <th className="p-2">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-2 font-medium text-gray-700">
                  {item.description}
                </td>
                <td className="p-2">{formatCurrency(item.unitPrice)}</td>
                <td className="p-2 text-center">{item.qty}</td>
                <td className="p-2 font-semibold">
                  {formatCurrency(getTotal(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment, Contact, Total */}
      <div className="flex flex-wrap justify-between gap-4 px-6 pt-6 pb-4">
        <div className="min-w-[180px] flex-1">
          <div className="mb-1 text-xs font-bold">Payment Method :</div>
          <div className="mb-2 rounded bg-gray-100 p-2 text-xs">
            Account No: 333 2156 6534
            <br />
            Account Name: {data.invoiceTo}
            <br />
            Branch: NEW WORK
          </div>
          <div className="mb-1 text-xs font-bold">Contact Info:</div>
          <div className="rounded bg-gray-100 p-2 text-xs">
            Phone: -<br />
            Email: -<br />
            Web: -
          </div>
        </div>
        <div className="min-w-[180px] flex-1">
          <div className="rounded border border-gray-200 bg-gray-50 p-4">
            <div className="mb-1 flex justify-between text-xs">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mb-1 flex justify-between text-xs">
              <span>Tex :</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="mb-1 flex justify-between text-xs">
              <span>Discount :</span>
              <span>{formatCurrency(discount)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-xs font-bold text-orange-500">
              <span>TOTAL</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Signature */}
      <div className="px-6 pb-2">
        <div className="mt-4 mb-1 text-xs font-bold">
          Thanks for your business
        </div>
        <div className="mb-2 text-xs text-gray-500">
          {data.termCondition ||
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div className="text-center">
            <div className="mb-1 text-sm font-bold">Sales</div>
            {signatures.sales ? (
              <img
                src={signatures.sales}
                alt="Sales signature"
                className="h-16 w-full border-b border-gray-300 object-contain"
              />
            ) : (
              <div className="h-16 border-b border-gray-300 dark:border-gray-600"></div>
            )}
          </div>
          <div className="text-center">
            <div className="mb-1 text-sm font-bold">Admin</div>
            {signatures.admin ? (
              <img
                src={signatures.admin}
                alt="Admin signature"
                className="h-16 w-full border-b border-gray-300 object-contain"
              />
            ) : (
              <div className="h-16 border-b border-gray-300 dark:border-gray-600"></div>
            )}
          </div>
          <div className="text-center">
            <div className="mb-1 text-sm font-bold">Member</div>
            {signatures.member ? (
              <img
                src={signatures.member}
                alt="Member signature"
                className="h-16 w-full border-b border-gray-300 object-contain"
              />
            ) : (
              <div className="h-16 border-b border-gray-300 dark:border-gray-600"></div>
            )}
          </div>
        </div>
      </div>
      {/* Bottom Accent */}
      <div className="mt-2 h-2 bg-orange-400"></div>
    </div>
  )
}

export default CorporateTemplate
