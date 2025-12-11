import React, { useState } from "react"
import { Pen, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import LayoutOtherSetting from "../Layout"
import SignatureCanvas from "./SignatureCanvas"
import {
  TemplateKey,
  getTemplateComponent,
  getTemplateOptions,
} from "./templates"
import { CreateInvoiceFormSchema, useInvoiceForm } from "./validations"

// Signature Modal Component
interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (signature: string) => void
  title: string
  existingSignature?: string
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  existingSignature,
}) => {
  const handleSave = (signature: string) => {
    onSave(signature)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <SignatureCanvas
          existingSignature={existingSignature}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  )
}

const InvoiceDesigner = () => {
  const [jsonOutput, setJsonOutput] = useState<string>("")
  const [showJson, setShowJson] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateKey>("default")
  const [signatures, setSignatures] = useState<{
    sales: string
    admin: string
    member: string
  }>({
    sales: "",
    admin: "",
    member: "",
  })
  const [signatureModal, setSignatureModal] = useState<{
    isOpen: boolean
    type: "sales" | "admin" | "member"
    title: string
  }>({
    isOpen: false,
    type: "sales",
    title: "",
  })

  const defaultValues = {
    companyName: "Company Name",
    companyAddress: "Ruko Royal Plaza, Gn Anyar, Surabaya",
    invoiceTo: "John Doe",
    invoiceToAddress: "814 Howard Street, 120065, India",
    invoiceNumber: "INV2024072501",
    invoiceDate: "Thursday, 23-May-2024",
    salesName: "Ayunda",
    items: [
      {
        description: "Membership Semester",
        qty: 1,
        unitPrice: 3000000,
        discount: 500000,
      },
    ],
    paymentMethod: "BCA",
    paymentAmount: 1775000,
    outstanding: 1000000,
    termCondition: "",
    template: "minimalist" as TemplateKey,
  }

  const invoiceForm = useInvoiceForm(defaultValues)

  const { control, handleSubmit, watch } = invoiceForm

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "items",
  // })

  const watchedValues = watch()

  const onSubmit = (data: CreateInvoiceFormSchema) => {
    // Menghitung subtotal
    const subTotal =
      data.items?.reduce(
        (sum, item) =>
          sum +
          ((item.qty || 0) * (item.unitPrice || 0) - (item.discount || 0)),
        0
      ) || 0

    // Menghitung pajak (11%)
    const tax = subTotal * 0.11

    // Menghitung total keseluruhan
    const grandTotal = subTotal + tax

    const outputData = {
      ...data,
      signatures,
      subTotal,
      tax,
      grandTotal,
    }
    setJsonOutput(JSON.stringify(outputData, null, 2))
    setShowJson(true)
  }

  const openSignatureModal = (type: "sales" | "admin" | "member") => {
    const titles = {
      sales: "Sales Signature",
      admin: "Admin Signature",
      member: "Member Signature",
    }
    setSignatureModal({
      isOpen: true,
      type,
      title: titles[type],
    })
  }

  const closeSignatureModal = () => {
    setSignatureModal((prev) => ({ ...prev, isOpen: false }))
  }

  const saveSignature = (signature: string) => {
    setSignatures((prev) => ({
      ...prev,
      [signatureModal.type]: signature,
    }))
  }

  const toggleView = () => {
    setShowJson(!showJson)
  }

  if (showJson) {
    return (
      <LayoutOtherSetting>
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>JSON Output</CardTitle>
              <Button onClick={toggleView} variant="outline">
                <RefreshCw className="mr-2 size-4" />
                Back to Designer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-auto rounded-lg p-4 text-sm">
              {jsonOutput}
            </pre>
          </CardContent>
        </Card>
      </LayoutOtherSetting>
    )
  }

  return (
    <LayoutOtherSetting>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice Preview */}
        <div className="lg:col-span-2">
          {React.createElement(getTemplateComponent(selectedTemplate), {
            data: watchedValues,
            signatures: signatures,
          })}
        </div>

        {/* Design Controls */}
        <Form {...invoiceForm}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Design Invoice Here</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <FormFieldItem
                    control={control}
                    name="companyName"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel>Company Name</FormLabel>
                        <Input {...field} placeholder="Company Name" />
                      </div>
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="companyAddress"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel>Company Address</FormLabel>
                        <Textarea {...field} placeholder="Company Address" />
                      </div>
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="invoiceTo"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel>Invoice to</FormLabel>
                        <Input {...field} placeholder="Invoice to" />
                      </div>
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel>Invoice No</FormLabel>
                        <Input {...field} placeholder="Invoice No" />
                      </div>
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="invoiceDate"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel>Date</FormLabel>
                        <Input {...field} placeholder="Invoice Date" />
                      </div>
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="salesName"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel>Sales Name</FormLabel>
                        <Input {...field} placeholder="Sales Name" />
                      </div>
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="termCondition"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel>Terms & Condition</FormLabel>
                        <Textarea {...field} />
                      </div>
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="template"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel>Template Invoice</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value)
                            setSelectedTemplate(value as TemplateKey)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            {getTemplateOptions().map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />

                  {/* Signatures */}
                  <div className="flex flex-col gap-2">
                    <FormLabel>Sales Signature</FormLabel>
                    <div className="flex items-center gap-2">
                      <div className="border-border bg-muted flex-1 rounded-md border p-2">
                        {signatures.sales ? (
                          <img
                            src={signatures.sales}
                            alt="Sales signature"
                            className="h-8 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No signature
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openSignatureModal("sales")}
                      >
                        <Pen className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <FormLabel>Admin Signature</FormLabel>
                    <div className="flex items-center gap-2">
                      <div className="border-border bg-muted flex-1 rounded-md border p-2">
                        {signatures.admin ? (
                          <img
                            src={signatures.admin}
                            alt="Admin signature"
                            className="h-8 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No signature
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openSignatureModal("admin")}
                      >
                        <Pen className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <FormLabel>Member Signature</FormLabel>
                    <div className="flex items-center gap-2">
                      <div className="border-border bg-muted flex-1 rounded-md border p-2">
                        {signatures.member ? (
                          <img
                            src={signatures.member}
                            alt="Member signature"
                            className="h-8 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No signature
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openSignatureModal("member")}
                      >
                        <Pen className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>

        {/* Signature Modal */}
        <SignatureModal
          isOpen={signatureModal.isOpen}
          title={signatureModal.title}
          existingSignature={signatures[signatureModal.type]}
          onClose={closeSignatureModal}
          onSave={saveSignature}
        />
      </div>
    </LayoutOtherSetting>
  )
}

export default InvoiceDesigner
