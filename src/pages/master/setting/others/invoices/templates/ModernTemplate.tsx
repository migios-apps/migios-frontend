import React from "react"

interface InvoiceItem {
  description: string
  qty: number
  unitPrice: number
  discount: number
}

interface ModernTemplateProps {
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

const ModernTemplate: React.FC<ModernTemplateProps> = ({
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
    <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white dark:from-purple-700 dark:to-indigo-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-white">
              {data.companyName}
            </h1>
            <p className="text-sm text-purple-100 dark:text-purple-200">
              {data.companyAddress}
            </p>
          </div>
          <div className="text-right">
            <h2 className="mb-2 text-4xl font-bold text-white">INVOICE</h2>
            <p className="text-purple-100 dark:text-purple-200">
              #{data.invoiceNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="p-8">
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
            <h3 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
              Billed To
            </h3>
            <p className="mb-1 text-lg font-semibold text-gray-800 dark:text-white">
              {data.invoiceTo}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {data.invoiceToAddress}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
            <h3 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-600 dark:text-gray-400">Invoice Date:</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {data.invoiceDate}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Sales Person:</p>
              <p className="font-medium text-gray-800 dark:text-white">
                {data.salesName}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Payment Method:
              </p>
              <p className="font-medium text-gray-800 dark:text-white">
                {data.paymentMethod}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left dark:bg-gray-700">
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                    Description
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-600 dark:text-gray-300">
                    Quantity
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-600 dark:text-gray-300">
                    Unit Price
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-600 dark:text-gray-300">
                    Discount
                  </th>
                  <th className="p-4 text-right font-semibold text-gray-600 dark:text-gray-300">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.items?.map((item, index) => (
                  <tr
                    key={index}
                    className="dark:hover:bg-gray-750 hover:bg-gray-50"
                  >
                    <td className="p-4 text-gray-800 dark:text-white">
                      {item.description}
                    </td>
                    <td className="p-4 text-center text-gray-800 dark:text-white">
                      {item.qty}
                    </td>
                    <td className="p-4 text-center text-gray-800 dark:text-white">
                      {formatCurrency(item.unitPrice || 0)}
                    </td>
                    <td className="p-4 text-center text-gray-800 dark:text-white">
                      {formatCurrency(item.discount || 0)}
                    </td>
                    <td className="p-4 text-right font-medium text-gray-800 dark:text-white">
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
        </div>

        {/* Totals */}
        <div className="mb-8 flex justify-end">
          <div className="w-80 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">
                Subtotal:
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {formatCurrency(calculateSubTotal())}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">
                Tax (10%):
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {formatCurrency(calculateTax())}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-gray-200 py-3 dark:border-gray-600">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Total:
              </span>
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(calculateGrandTotal())}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
          <h3 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Payment Status
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="mb-1 text-gray-600 dark:text-gray-400">
                Amount Paid
              </p>
              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                {formatCurrency(data.paymentAmount || 0)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-gray-600 dark:text-gray-400">
                Outstanding
              </p>
              <p className="text-lg font-medium text-red-600 dark:text-red-400">
                {formatCurrency(data.outstanding || 0)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-gray-600 dark:text-gray-400">Status</p>
              <p
                className={`text-lg font-medium ${data.outstanding > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}
              >
                {data.outstanding > 0 ? "Partially Paid" : "Paid"}
              </p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mb-8 grid grid-cols-3 gap-8 text-center">
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <h4 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
              Sales
            </h4>
            {signatures.sales ? (
              <img
                src={signatures.sales}
                alt="Sales signature"
                className="h-16 w-full object-contain"
              />
            ) : (
              <div className="h-16 border-b border-gray-300 dark:border-gray-600"></div>
            )}
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {data.salesName}
            </p>
          </div>
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <h4 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
              Admin
            </h4>
            {signatures.admin ? (
              <img
                src={signatures.admin}
                alt="Admin signature"
                className="h-16 w-full object-contain"
              />
            ) : (
              <div className="h-16 border-b border-gray-300 dark:border-gray-600"></div>
            )}
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Administrator
            </p>
          </div>
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <h4 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
              Member
            </h4>
            {signatures.member ? (
              <img
                src={signatures.member}
                alt="Member signature"
                className="h-16 w-full object-contain"
              />
            ) : (
              <div className="h-16 border-b border-gray-300 dark:border-gray-600"></div>
            )}
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {data.invoiceTo}
            </p>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="mb-3 text-lg font-semibold text-purple-600 dark:text-purple-400">
            Terms & Conditions
          </h3>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              {data.termCondition || "No terms and conditions specified"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        Created by Admin • {new Date().toLocaleDateString("id-ID")}
      </div>
    </div>
  )
}

export default ModernTemplate
