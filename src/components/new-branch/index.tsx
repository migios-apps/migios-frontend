import React, { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import appConfig from "@/config/app.config"
import {
  apiBulkCreateBranchClub,
  BulkCreateBranchClubDto,
} from "@/services/api/ClubService"
import handleApiError from "@/services/handleApiError"
import { yupResolver } from "@hookform/resolvers/yup"
import { ArrowLeft, ArrowRight, XIcon } from "lucide-react"
import { useNavigate } from "react-router"
import * as yup from "yup"
import { useClubStore } from "@/stores/use-club"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import PhoneInput from "@/components/ui/phone-input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import { PlanPricing, PricingSection } from "@/components/pricing-section"
import { ThemeSwitch } from "../theme-switch"
import { Badge } from "../ui/badge"
import { currencyFormat } from "../ui/input-currency"

type DialogNewBranchClubProps = {
  open: boolean
  onClose: () => void
}

// Validation schema
const branchClubSchema = yup.object().shape({
  name: yup.string().required("Nama klub diperlukan"),
  photo: yup.string().optional().nullable(),
  phone: yup.string().required("Telepon diperlukan"),
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email diperlukan"),
  address: yup.string().required("Alamat diperlukan"),
  plan_type: yup
    .string()
    .oneOf(
      ["free", "basic", "pro", "growth", "enterprise"],
      "Pilih plan yang valid"
    )
    .required("Plan subscription diperlukan"),
  duration: yup.number().required("Durasi diperlukan"),
  duration_type: yup
    .string()
    .oneOf(
      ["day", "week", "month", "year", "forever"],
      "Tipe durasi tidak valid"
    )
    .required("Tipe durasi diperlukan"),
  amount: yup
    .number()
    .min(0, "Amount tidak boleh negatif")
    .required("Amount diperlukan"),
  payment_method: yup
    .string()
    .oneOf(
      ["credit_card", "bank_transfer", "paypal", "cash"],
      "Metode pembayaran tidak valid"
    )
    .required("Metode pembayaran diperlukan"),
})

type BranchClubFormValues = yup.InferType<typeof branchClubSchema>

const DialogNewBranchClub: React.FC<DialogNewBranchClubProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { club, setClubData } = useAuth()
  const setWelcome = useClubStore((s) => s.setWelcome)
  const [step, setStep] = useState<"pricing" | "form">("pricing")
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [isYearly, setIsYearly] = useState(false)

  const formProps = useForm<BranchClubFormValues>({
    resolver: yupResolver(branchClubSchema) as any,
    mode: "all",
    defaultValues: {
      amount: 0,
      duration: 1,
      duration_type: "month",
      payment_method: "bank_transfer",
    },
  })

  const { handleSubmit, setValue } = formProps
  // const { errors } = formState
  // console.log("errors", errors)

  const createBranchClub = useMutation({
    mutationFn: (data: BulkCreateBranchClubDto) =>
      apiBulkCreateBranchClub(data),
    onError: (error) => {
      const resError = handleApiError(error)
      console.log("error create branch", resError)
    },
    onSuccess: async (data: any) => {
      onClose()
      const result = await setClubData(data.data, false)
      if (result.status === "success") {
        // window.location.reload()
        Object.values(QUERY_KEY).forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] })
        })
        setWelcome(true)
        navigate(appConfig.authenticatedEntryPath, { replace: true })
      }
    },
  })

  const onSubmit: SubmitHandler<BranchClubFormValues> = (data) => {
    if (!club?.company_id) {
      console.error("Company ID not found")
      return
    }

    createBranchClub.mutate({
      company_id: club.company_id,
      name: data.name,
      photo: data.photo || undefined,
      phone: data.phone,
      email: data.email,
      address: data.address,
      plan_type: data.plan_type as BulkCreateBranchClubDto["plan_type"],
      duration: data.duration,
      duration_type:
        data.duration_type as BulkCreateBranchClubDto["duration_type"],
      amount: data.amount,
      payment_method:
        data.payment_method as BulkCreateBranchClubDto["payment_method"],
    })
  }

  const handleSelectPlan = (plan: PlanPricing, isYearly: boolean) => {
    setSelectedPlan(plan)
    setIsYearly(isYearly)
    setValue("plan_type", plan.type as BulkCreateBranchClubDto["plan_type"])
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
    setValue("amount", price)
    setValue("duration", plan.duration)
    setValue(
      "duration_type",
      (isYearly
        ? plan.duration_type_yearly
        : plan.duration_type) as BulkCreateBranchClubDto["duration_type"]
    )

    // Handle free plan payment method
    if (plan.name.toLowerCase() === "free") {
      setValue("payment_method", "cash")
    }

    setStep("form")
  }

  const handleBackToPricing = () => {
    setStep("pricing")
    setSelectedPlan(null)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      formProps.reset()
      setStep("pricing")
      setSelectedPlan(null)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        scrollBody={false}
        showCloseButton={false}
        className="fixed! inset-0! top-0! left-0! z-50! h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! gap-0! rounded-none! border-0! p-0!"
      >
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <div className="relative z-10 flex h-full flex-col">
          <div className="absolute top-4 left-4 z-10">
            <ThemeSwitch />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 border-none p-0"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>
          {/* Content */}
          <ScrollArea className="h-[calc(100vh-5px)]">
            <div className={cn("p-6", step === "form" ? "pb-24" : "")}>
              {step === "pricing" ? (
                <>
                  <div className="mx-auto mb-4 flex max-w-2xl flex-col items-center justify-center text-center">
                    <Badge variant="outline" className="mb-2">
                      Pilihan Paket
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Pilih Paket Terbaik Anda
                    </h2>
                    <p className="text-muted-foreground text-base">
                      Temukan solusi yang tepat untuk mendukung pertumbuhan dan
                      kesuksesan gym Anda ke level berikutnya.
                    </p>
                  </div>

                  <PricingSection onPlanClick={handleSelectPlan} />
                </>
              ) : (
                <>
                  <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center justify-center text-center">
                    <Badge variant="outline" className="mb-2">
                      Informasi Cabang
                    </Badge>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Mulai Ekspansi Bisnis Anda
                    </h2>
                    <p className="text-muted-foreground text-base">
                      Lengkapi detail cabang baru Anda untuk segera memulai
                      operasional dan menjangkau lebih banyak pelanggan.
                    </p>
                  </div>

                  <div className="mx-auto max-w-2xl">
                    <Card className="w-full border-none p-0 shadow-none">
                      <CardContent className="p-6">
                        <Form {...formProps}>
                          <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Selected Plan Info */}
                            {selectedPlan && (
                              <div className="bg-muted/50 mb-6 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">
                                      {selectedPlan.name}
                                    </h4>
                                    <p className="text-muted-foreground text-sm">
                                      {isYearly
                                        ? "Pembayaran Tahunan"
                                        : "Pembayaran Bulanan"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold">
                                      {selectedPlan.name === "Lifetime"
                                        ? currencyFormat(
                                            selectedPlan.monthlyPrice
                                          )
                                        : selectedPlan.name === "Free"
                                          ? currencyFormat(
                                              selectedPlan.monthlyPrice
                                            )
                                          : currencyFormat(
                                              isYearly
                                                ? selectedPlan.yearlyPrice
                                                : selectedPlan.monthlyPrice
                                            )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Form Fields */}
                            <div className="space-y-4">
                              <FormFieldItem
                                control={formProps.control}
                                name="name"
                                label={
                                  <FormLabel>
                                    Nama Cabang Club{" "}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                }
                                invalid={Boolean(
                                  formProps.formState.errors.name
                                )}
                                errorMessage={
                                  formProps.formState.errors.name?.message
                                }
                                render={({ field }) => (
                                  <Input
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Nama Cabang Club"
                                    {...field}
                                  />
                                )}
                              />

                              <FormFieldItem
                                control={formProps.control}
                                name="email"
                                label={
                                  <FormLabel>
                                    Email{" "}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                }
                                invalid={Boolean(
                                  formProps.formState.errors.email
                                )}
                                errorMessage={
                                  formProps.formState.errors.email?.message
                                }
                                render={({ field }) => (
                                  <Input
                                    type="email"
                                    autoComplete="off"
                                    placeholder="Email"
                                    {...field}
                                  />
                                )}
                              />

                              <FormFieldItem
                                control={formProps.control}
                                name="phone"
                                label={
                                  <FormLabel>
                                    Nomor Telepon{" "}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                }
                                invalid={Boolean(
                                  formProps.formState.errors.phone
                                )}
                                errorMessage={
                                  formProps.formState.errors.phone?.message
                                }
                                render={({ field }) => (
                                  <PhoneInput
                                    placeholder="+62 *** *** ***"
                                    {...field}
                                  />
                                )}
                              />

                              <FormFieldItem
                                control={formProps.control}
                                name="address"
                                label={
                                  <FormLabel>
                                    Alamat{" "}
                                    <span className="text-destructive">*</span>
                                  </FormLabel>
                                }
                                invalid={Boolean(
                                  formProps.formState.errors.address
                                )}
                                errorMessage={
                                  formProps.formState.errors.address?.message
                                }
                                render={({ field }) => (
                                  <Textarea
                                    placeholder="Tulis alamat lengkap cabang club"
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                )}
                              />

                              {selectedPlan?.name.toLowerCase() !== "free" && (
                                <FormFieldItem
                                  control={formProps.control}
                                  name="payment_method"
                                  label={
                                    <FormLabel>
                                      Metode Pembayaran{" "}
                                      <span className="text-destructive">
                                        *
                                      </span>
                                    </FormLabel>
                                  }
                                  invalid={Boolean(
                                    formProps.formState.errors.payment_method
                                  )}
                                  errorMessage={
                                    formProps.formState.errors.payment_method
                                      ?.message
                                  }
                                  render={({ field }) => (
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih metode pembayaran" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bank_transfer">
                                          Bank Transfer
                                        </SelectItem>
                                        <SelectItem value="credit_card">
                                          Credit Card
                                        </SelectItem>
                                        <SelectItem value="paypal">
                                          PayPal
                                        </SelectItem>
                                        <SelectItem value="cash">
                                          Cash
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              )}
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          {step === "form" ? (
            <div className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleBackToPricing}
                  disabled={createBranchClub.isPending}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={createBranchClub.isPending}
                >
                  {createBranchClub.isPending ? "Memproses..." : "Buat Cabang"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "absolute top-1/2 left-1/2 z-0 h-screen w-full -translate-x-1/2 -translate-y-1/2",
            "bg-size-[20px_20px]",
            "bg-[radial-gradient(#d4d4d4_1px,transparent_1px)]",
            "dark:bg-[radial-gradient(#404040_1px,transparent_1px)]"
          )}
        />
        <div className="bg-background pointer-events-none absolute top-1/2 left-1/2 z-0 flex h-screen w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </DialogContent>
    </Dialog>
  )
}

export default DialogNewBranchClub
