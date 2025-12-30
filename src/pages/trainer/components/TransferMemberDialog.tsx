import { useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { EmployeeDetail } from "@/services/api/@types/employee"
import {
  TrainerDetail,
  TrainerMember,
  TrainerPackage,
} from "@/services/api/@types/trainer"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import { yupResolver } from "@hookform/resolvers/yup"
import { motion, AnimatePresence } from "framer-motion"
import {
  Profile2User,
  Calendar,
  Clock,
  TickCircle,
  DirectInbox,
} from "iconsax-reactjs"
import { ArrowRight, UserPlus, Info } from "lucide-react"
import { OptionsOrGroups, GroupBase } from "react-select"
import * as yup from "yup"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColorPalettePicker } from "@/components/ui/color-palette-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { SelectAsyncPaginate } from "@/components/ui/react-select"
import { ReturnAsyncSelect } from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import { WeekdayOptions } from "@/components/form/class/validation"

interface TransferMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TrainerMember
  trainer: TrainerDetail | null
  onSuccess?: () => void
}

const validationSchema = yup.object().shape({
  target_trainer: yup.object().required("Pilih trainer tujuan"),
  background_color: yup.string().required("Pilih warna agenda"),
  color: yup.string().required("Pilih warna teks"),
  weekdays_available: yup
    .array()
    .of(
      yup.object().shape({
        day: yup.number().required(),
      })
    )
    .min(1, "Minimal pilih satu hari tersedia")
    .required("Hari tersedia wajib diisi"),
})

type TransferFormValues = yup.InferType<typeof validationSchema>

const TransferMemberDialog = ({
  open,
  onOpenChange,
  member,
  trainer,
  onSuccess,
}: TransferMemberDialogProps) => {
  const form = useForm<TransferFormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      weekdays_available: [],
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form

  const watchTargetTrainer = watch("target_trainer") as
    | EmployeeDetail
    | undefined
  const watchBgColor = watch("background_color")
  const watchTextColor = watch("color")

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        weekdays_available: [],
      })
    }
  }, [open, reset])

  const onSubmit = (data: TransferFormValues) => {
    console.log("Transferring package", {
      memberId: member.id,
      packageId: member.packages[0]?.id,
      fromTrainerId: trainer?.id,
      targetTrainerId: (data.target_trainer as any).id,
      backgroundColor: data.background_color,
      color: data.color,
      weekdays: data.weekdays_available,
    })
    onSuccess?.()
    onOpenChange(false)
  }

  const getTrainerList = useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<EmployeeDetail, GroupBase<EmployeeDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetEmployeeList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        role_name: "trainer",
        search: [
          (inputValue || "").length > 0
            ? ({
                search_column: "name",
                search_condition: "like",
                search_text: `${inputValue}`,
              } as any)
            : null,
          {
            search_operator: "and",
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
          trainer
            ? {
                search_operator: "and",
                search_column: "id",
                search_condition: "!=",
                search_text: trainer.id.toString(),
              }
            : null,
        ],
      })
      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: response.data.data,
          hasMore: response.data.data.length >= 1,
          additional: {
            page: additional!.page + 1,
          },
        })
      })
    },
    [trainer]
  )

  const pkg = member.packages[0] as TrainerPackage | undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        scrollBody
        // showCloseButton={false}
        // className="max-w-2xl pb-0"
        // className="fixed! inset-0! top-0! left-0! z-50! h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! gap-0! rounded-none! border-0! p-0!"
        // scrollBody={false}
        className="pb-0 max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:flex max-sm:h-screen max-sm:max-w-none max-sm:flex-col max-sm:rounded-none max-sm:border-0 sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Ganti Trainer Membe</DialogTitle>
          <DialogDescription>
            Pindahkan paket member ke trainer lain dan atur jadwal barunya.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex h-full flex-col gap-4">
          {/* Header Actions */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-2 right-2 z-20 h-10 w-10 border-none p-0 sm:top-4 sm:right-4"
          >
            <XIcon className="size-5" />
            <span className="sr-only">Close</span>
          </Button> */}

          <div className="flex h-full flex-col">
            {/* Title Section */}
            {/* <div className="flex flex-col items-center pt-10 pb-4 text-center sm:pt-14 sm:pb-6">
              <div className="bg-primary/10 mb-3 flex h-10 w-10 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl">
                <ConvertCard
                  size={24}
                  variant="Bulk"
                  className="text-primary sm:size-7"
                />
              </div>
              <h2 className="mb-1 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                Ganti Trainer Member
              </h2>
              <p className="text-muted-foreground max-w-[280px] text-xs sm:max-w-md sm:text-sm">
                Pindahkan paket member ke trainer lain dan atur jadwal barunya.
              </p>
            </div> */}

            <ScrollArea className="h-full max-h-[calc(100vh-200px)] flex-1">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Animated Transfer Illustration */}
                  <div className="bg-muted/30 relative flex items-center justify-between rounded-2xl border border-dashed p-4 sm:rounded-3xl sm:p-6">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <div className="relative">
                        <Avatar className="size-12 border-2 bg-white shadow-lg sm:size-16 sm:shadow-xl">
                          <AvatarImage src={trainer?.photo || ""} />
                          <AvatarFallback className="text-muted-foreground text-[10px] font-bold sm:text-xs">
                            {trainer?.name?.charAt(0) || "T"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-destructive absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] text-white shadow-sm ring-2 ring-white sm:size-6 sm:text-xs sm:ring-4">
                          -
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="max-w-[60px] truncate text-[10px] font-bold sm:max-w-20 sm:text-xs">
                          {trainer?.name || "Trainer"}
                        </p>
                        <span className="text-muted-foreground text-[9px] font-bold uppercase sm:text-xs">
                          Sumber
                        </span>
                      </div>
                    </div>

                    <div className="relative flex flex-1 items-center justify-center px-4 sm:px-10">
                      <div className="border-muted-foreground/20 w-full border-t-2 border-dashed" />

                      <motion.div
                        className="absolute"
                        initial={{ x: -30 }}
                        animate={{ x: 30 }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="relative">
                          <Avatar className="size-10 border-2 bg-white shadow-lg sm:size-12 sm:shadow-xl">
                            <AvatarImage src={member.photo || ""} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold sm:text-xs">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-primary absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full text-[8px] text-white shadow-sm ring-2 ring-white sm:-right-1 sm:-bottom-1 sm:size-5 sm:text-xs">
                            <TickCircle
                              size={8}
                              variant="Bold"
                              className="sm:size-2.5"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <AnimatePresence mode="wait">
                        {watchTargetTrainer ? (
                          <motion.div
                            key="target-active"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative"
                          >
                            <Avatar className="border-primary/50 size-12 border-2 bg-white shadow-lg sm:size-16 sm:shadow-xl">
                              <AvatarImage
                                src={watchTargetTrainer.photo || ""}
                              />
                              <AvatarFallback className="text-primary text-[10px] font-bold sm:text-xs">
                                {watchTargetTrainer.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-primary absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] text-white shadow-sm ring-2 ring-white sm:size-6 sm:text-xs sm:ring-4">
                              +
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="target-empty"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative"
                          >
                            <div className="border-muted-foreground/20 bg-muted/50 flex size-12 items-center justify-center rounded-full border-2 border-dashed shadow-inner sm:size-16">
                              <UserPlus
                                size={20}
                                className="text-muted-foreground/40 sm:size-6"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="text-center">
                        <p className="max-w-[60px] truncate text-[10px] font-bold sm:max-w-20 sm:text-xs">
                          {watchTargetTrainer?.name || "Pilih Trainer"}
                        </p>
                        <span className="text-primary text-[9px] font-bold uppercase sm:text-xs">
                          Penerima
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Package Details Info */}
                  {pkg && (
                    <div className="bg-primary/5 relative overflow-hidden rounded-2xl border border-dashed p-4 sm:rounded-3xl sm:p-5">
                      <div className="absolute -top-4 -right-4 size-16 opacity-5 sm:-top-6 sm:-right-6 sm:size-24 sm:opacity-10">
                        <DirectInbox
                          size={64}
                          variant="Bulk"
                          className="text-primary sm:size-24"
                        />
                      </div>
                      <div className="relative flex items-start gap-3 sm:gap-4">
                        <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-md sm:size-10 sm:rounded-xl sm:shadow-lg">
                          <Calendar
                            size={16}
                            variant="Bulk"
                            className="sm:size-5"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="truncate text-sm font-bold tracking-tight sm:text-base">
                              {pkg.package_name}
                            </h4>
                            <Badge
                              variant="outline"
                              className="bg-background w-fit py-0 text-[10px] uppercase sm:text-xs"
                            >
                              {pkg.package_type?.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-1.5">
                              <Clock
                                size={12}
                                className="text-muted-foreground sm:size-3.5"
                              />
                              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                                Sisa {pkg.total_available_session} Sesi
                              </span>
                            </div>
                            <div className="bg-muted-foreground/20 hidden h-3 w-px sm:block" />
                            <div className="flex items-center gap-1.5">
                              <Calendar
                                size={12}
                                className="text-muted-foreground sm:size-3.5"
                              />
                              <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                                {pkg.duration} {pkg.duration_type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Target Trainer Selector */}
                    <div className="space-y-2 px-1">
                      <FormFieldItem
                        control={control}
                        name="target_trainer"
                        label={
                          <FormLabel className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase sm:text-sm">
                            <Profile2User
                              size={16}
                              variant="Bulk"
                              className="text-primary"
                            />
                            Trainer Tujuan{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                        }
                        invalid={Boolean(errors.target_trainer)}
                        errorMessage={errors.target_trainer?.message as string}
                        render={({ field, fieldState }) => (
                          <SelectAsyncPaginate
                            isClearable
                            loadOptions={getTrainerList as any}
                            additional={{ page: 1 }}
                            placeholder="Cari trainer penerima..."
                            value={field.value}
                            error={!!fieldState.error}
                            getOptionLabel={(option: any) => option.name!}
                            getOptionValue={(option: any) =>
                              option.id.toString()
                            }
                            debounceTimeout={500}
                            formatOptionLabel={({ name, photo }: any) => (
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                  <AvatarImage src={photo || ""} />
                                  <AvatarFallback className="text-[10px] font-bold">
                                    {name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium sm:text-sm">
                                  {name}
                                </span>
                              </div>
                            )}
                            onChange={(option) => field.onChange(option)}
                          />
                        )}
                      />
                    </div>

                    {/* Color Palette Picker */}
                    <div className="space-y-2 px-1">
                      <FormFieldItem
                        control={control}
                        name="background_color"
                        label={
                          <FormLabel className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase sm:text-sm">
                            <TickCircle
                              size={16}
                              variant="Bulk"
                              className="text-primary"
                            />
                            Warna Agenda{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                        }
                        invalid={Boolean(errors.background_color)}
                        errorMessage={errors.background_color?.message}
                        render={({ field: bgField }) => (
                          <FormFieldItem
                            control={control}
                            name="color"
                            render={({ field: colorField }) => (
                              <ColorPalettePicker
                                value={
                                  bgField.value && colorField.value
                                    ? {
                                        background: bgField.value,
                                        color: colorField.value,
                                      }
                                    : undefined
                                }
                                onChange={(val) => {
                                  bgField.onChange(val.background)
                                  colorField.onChange(val.color)
                                }}
                              />
                            )}
                          />
                        )}
                      />
                    </div>

                    {/* Weekday Selection */}
                    <div className="space-y-2 px-1">
                      <FormFieldItem
                        control={control}
                        name="weekdays_available"
                        label={
                          <FormLabel className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase sm:text-sm">
                            <Calendar
                              size={16}
                              variant="Bulk"
                              className="text-primary"
                            />
                            Hari Tersedia{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                        }
                        invalid={Boolean(errors.weekdays_available)}
                        errorMessage={errors.weekdays_available?.message}
                        render={({ field }) => (
                          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                            {WeekdayOptions.map((option) => {
                              const isSelected = field.value?.some(
                                (w) => w.day === option.value
                              )
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    const current = field.value ?? []
                                    if (isSelected) {
                                      field.onChange(
                                        current.filter(
                                          (w) => w.day !== option.value
                                        )
                                      )
                                    } else {
                                      field.onChange([
                                        ...current,
                                        { day: option.value },
                                      ])
                                    }
                                  }}
                                  className={cn(
                                    "flex h-12 flex-col items-center justify-center rounded-xl border-2 transition-all sm:h-14",
                                    isSelected
                                      ? !watchBgColor &&
                                          "border-primary bg-primary/10 text-primary shadow-sm"
                                      : "border-muted bg-background hover:border-primary/30 hover:bg-muted/30"
                                  )}
                                  style={
                                    isSelected && watchBgColor
                                      ? {
                                          backgroundColor: watchBgColor,
                                          borderColor: watchBgColor,
                                          color: watchTextColor || "white",
                                        }
                                      : {}
                                  }
                                >
                                  <span
                                    className={cn(
                                      "text-[8px] font-bold tracking-widest uppercase opacity-60 sm:text-[10px]",
                                      isSelected && watchBgColor && "opacity-80"
                                    )}
                                  >
                                    {option.label.slice(0, 3)}
                                  </span>
                                  <span className="text-xs font-bold sm:text-sm">
                                    {option.label}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </div>

          <DialogFooter className="w-full py-4">
            <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
              <Alert className="bg-primary/5 text-primary border-primary/10 w-full p-2! sm:max-w-md">
                <Info className="size-4" />
                <AlertDescription className="text-primary/80 text-[10px] font-medium sm:text-xs">
                  Sistem akan mencatat riwayat perpindahan ini secara permanen.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleSubmit(onSubmit)}
                className="w-full sm:w-auto"
              >
                Ganti Trainer
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TransferMemberDialog
