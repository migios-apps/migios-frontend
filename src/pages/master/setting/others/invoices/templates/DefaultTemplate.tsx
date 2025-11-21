import React from "react"

interface InvoiceItem {
  description: string
  qty: number
  unitPrice: number
  discount: number
}

interface DefaultTemplateProps {
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

const DefaultTemplate: React.FC<DefaultTemplateProps> = ({
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
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-lg bg-blue-500 p-6 text-white dark:bg-blue-600">
        <div className="flex items-center gap-3">
          <div className="bg-opacity-20 rounded bg-white p-2">
            <div className="h-6 w-6 rounded bg-green-500"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{data.companyName}</h1>
            <p className="text-sm text-blue-100 dark:text-blue-200">
              {data.companyAddress}
            </p>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white">INVOICE</h2>
      </div>

      {/* Invoice Details */}
      <div className="p-6">
        <div className="mb-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
              Invoice To:
            </h3>
            <p className="font-semibold text-gray-800 dark:text-white">
              {data.invoiceTo}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {data.invoiceToAddress}
            </p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Invoice No:
              </span>
              <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                {data.invoiceNumber}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                {data.invoiceDate}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-500 text-white dark:bg-blue-600">
                <th className="rounded-tl p-3 text-left">Plan Description</th>
                <th className="p-3 text-center">QTY</th>
                <th className="p-3 text-center">Unit Price</th>
                <th className="p-3 text-center">Discount</th>
                <th className="rounded-tr p-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-center">{item.qty}</td>
                  <td className="p-3 text-center">
                    {formatCurrency(item.unitPrice || 0)}
                  </td>
                  <td className="p-3 text-center">
                    {formatCurrency(item.discount || 0)}
                  </td>
                  <td className="p-3 text-center font-semibold">
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

        {/* Sales Name */}
        <div className="mb-6">
          <span className="text-gray-600 dark:text-gray-400">Sales Name:</span>
          <span className="ml-2 font-semibold text-gray-800 dark:text-white">
            {data.salesName}
          </span>
        </div>

        {/* Totals */}
        <div className="mb-6 flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span>Sub Total:</span>
              <span className="font-semibold">
                {formatCurrency(calculateSubTotal())}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>Tax:</span>
              <span className="font-semibold">
                {formatCurrency(calculateTax())}
              </span>
            </div>
            <div className="flex justify-between border-t py-2 text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(calculateGrandTotal())}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-6 rounded bg-gray-100 p-4 dark:bg-gray-700">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="mb-2 font-semibold">Payment Method</span>
              <p className="text-gray-800 dark:text-white">
                {data.paymentMethod}
              </p>
            </div>
            <div>
              <span className="mb-2 font-semibold">Create at</span>
              <p className="text-gray-800 dark:text-white">
                23-May-2024, 20:15
              </p>
            </div>
            <div>
              <span className="mb-2 font-semibold">Amount</span>
              <p className="text-gray-800 dark:text-white">
                {formatCurrency(data.paymentAmount || 0)}
              </p>
            </div>
            <div>
              <span className="mb-2 font-semibold">Outstanding</span>
              <p className="text-gray-800 dark:text-white">
                {formatCurrency(data.outstanding || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Created by Admin
        </div>

        {/* Signatures */}
        <div className="mb-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-white">
              Sales
            </h4>
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
          <div>
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-white">
              Admin
            </h4>
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
          <div>
            <h4 className="mb-4 font-semibold text-gray-800 dark:text-white">
              Member
            </h4>
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

        {/* Terms & Conditions */}
        <div>
          <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
            Term & Condition:
          </h3>
          <div className="min-h-20 rounded bg-gray-50 p-4 dark:bg-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              {data.termCondition || "No terms and conditions specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefaultTemplate
