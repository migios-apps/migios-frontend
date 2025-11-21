import React from "react"

interface InvoiceItem {
  description: string
  qty: number
  unitPrice: number
  discount: number
}

interface MinimalistTemplateProps {
  data: {
    companyName: string
    companyAddress: string
    invoiceTo: string
    invoiceToAddress: string
    invoiceNumber: string
    invoiceDate: string
    salesName: string
    termCondition: string
    paymentMethod: string
    paymentAmount: number
    outstanding: number
    items?: InvoiceItem[]
  }
  signatures: {
    sales: string
    admin: string
    member: string
  }
}

const MinimalistTemplate: React.FC<MinimalistTemplateProps> = ({
  data,
  signatures,
}) => {
  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateItemTotal = (
    qty: number,
    price: number,
    discount: number
  ): number => {
    return qty * price - discount
  }

  const calculateSubTotal = (): number => {
    return (
      data.items?.reduce(
        (sum, item) =>
          sum +
          calculateItemTotal(
            item.qty || 0,
            item.unitPrice || 0,
            item.discount || 0
          ),
        0
      ) || 0
    )
  }

  const calculateTax = (): number => {
    return calculateSubTotal() * 0.1 // Assuming 10% tax
  }

  const calculateGrandTotal = (): number => {
    return calculateSubTotal() + calculateTax()
  }

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.companyName}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {data.companyAddress}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-900 dark:text-white">
              Invoice
            </h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              #{data.invoiceNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Client & Invoice Info */}
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h3 className="mb-2 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Tagihan Untuk
          </h3>
          <p className="font-medium text-gray-800 dark:text-white">
            {data.invoiceTo}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {data.invoiceToAddress}
          </p>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Tanggal Invoice
              </h3>
              <p className="font-medium text-gray-800 dark:text-white">
                {data.invoiceDate}
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Sales
              </h3>
              <p className="font-medium text-gray-800 dark:text-white">
                {data.salesName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-3 text-left text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Deskripsi
              </th>
              <th className="py-3 text-center text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Jumlah
              </th>
              <th className="py-3 text-right text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Harga Satuan
              </th>
              <th className="py-3 text-right text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Diskon
              </th>
              <th className="py-3 text-right text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.items?.map((item, index) => (
              <tr key={index}>
                <td className="py-4 text-gray-800 dark:text-white">
                  {item.description}
                </td>
                <td className="py-4 text-center text-gray-800 dark:text-white">
                  {item.qty}
                </td>
                <td className="py-4 text-right text-gray-800 dark:text-white">
                  {formatCurrency(item.unitPrice || 0)}
                </td>
                <td className="py-4 text-right text-gray-800 dark:text-white">
                  {formatCurrency(item.discount || 0)}
                </td>
                <td className="py-4 text-right font-medium text-gray-800 dark:text-white">
                  {formatCurrency(
                    calculateItemTotal(
                      item.qty || 0,
                      item.unitPrice || 0,
                      item.discount || 0
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-8 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {formatCurrency(calculateSubTotal())}
            </span>
          </div>
          <div className="flex justify-between py-2 text-gray-600 dark:text-gray-400">
            <span>Pajak (10%)</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {formatCurrency(calculateTax())}
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-200 py-2 text-lg dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Total
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(calculateGrandTotal())}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="dark:bg-gray-750 mb-8 rounded-lg bg-gray-50 p-6">
        <h3 className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          Informasi Pembayaran
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="mb-1 text-gray-500 dark:text-gray-400">
              Metode Pembayaran
            </p>
            <p className="font-medium text-gray-800 dark:text-white">
              {data.paymentMethod}
            </p>
          </div>
          <div>
            <p className="mb-1 text-gray-500 dark:text-gray-400">
              Jumlah Dibayar
            </p>
            <p className="font-medium text-gray-800 dark:text-white">
              {formatCurrency(data.paymentAmount || 0)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-gray-500 dark:text-gray-400">
              Sisa Pembayaran
            </p>
            <p className="font-medium text-gray-800 dark:text-white">
              {formatCurrency(data.outstanding || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="mb-8 grid grid-cols-3 gap-8">
        <div>
          <h4 className="mb-3 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Tanda Tangan Sales
          </h4>
          {signatures.sales ? (
            <img
              src={signatures.sales}
              alt="Sales signature"
              className="h-16 w-full border-b border-gray-200 object-contain dark:border-gray-700"
            />
          ) : (
            <div className="h-16 border-b border-gray-200 dark:border-gray-700"></div>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {data.salesName}
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Tanda Tangan Admin
          </h4>
          {signatures.admin ? (
            <img
              src={signatures.admin}
              alt="Admin signature"
              className="h-16 w-full border-b border-gray-200 object-contain dark:border-gray-700"
            />
          ) : (
            <div className="h-16 border-b border-gray-200 dark:border-gray-700"></div>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Administrator
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Tanda Tangan Member
          </h4>
          {signatures.member ? (
            <img
              src={signatures.member}
              alt="Member signature"
              className="h-16 w-full border-b border-gray-200 object-contain dark:border-gray-700"
            />
          ) : (
            <div className="h-16 border-b border-gray-200 dark:border-gray-700"></div>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {data.invoiceTo}
          </p>
        </div>
      </div>

      {/* Terms & Conditions */}
      {data.termCondition && (
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="mb-3 text-xs tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Syarat & Ketentuan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.termCondition}
          </p>
        </div>
      )}

      <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
        Dibuat oleh Admin • {new Date().toLocaleDateString("id-ID")}
      </div>
    </div>
  )
}

export default MinimalistTemplate
