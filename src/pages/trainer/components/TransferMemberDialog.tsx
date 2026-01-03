import { useEffect, useCallback, ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSessionUser } from "@/auth"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { CreateEventRequest } from "@/services/api/@types/event"
import {
  TrainerDetail,
  TrainerMember,
  TrainerPackage,
} from "@/services/api/@types/trainer"
import { TransferMemberRequest } from "@/services/api/@types/trainer"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import { apiTransferMember } from "@/services/api/TrainerService"
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
import { toast } from "sonner"
import * as yup from "yup"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColorPalettePicker } from "@/components/ui/color-palette-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SelectAsyncPaginate } from "@/components/ui/react-select"
import { ReturnAsyncSelect } from "@/components/ui/react-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import DailySchedule from "./CreatePTSchedule/DailySchedule"
import WeeklySchedule from "./CreatePTSchedule/WeeklySchedule"
import {
  extendEventSchema,
  initTrainerEventValue,
  ReturnEventTrainerSchemaType,
} from "./CreatePTSchedule/validation"

interface TransferMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  member: TrainerMember | null
  trainer: TrainerDetail | null
  pkg: TrainerPackage | null
  hasEvent?: boolean
}

const getValidationSchema = (hasEvent?: boolean) =>
  yup.object().shape({
    target_trainer: yup
      .object({
        id: yup.number().required(),
      })
      .required("Pilih trainer tujuan"),
    is_create_event: yup.boolean().default(false),
    events: hasEvent
      ? yup
          .array()
          .of(extendEventSchema)
          .min(1, "Minimal satu jadwal harus ada")
          .required("Jadwal wajib diisi")
      : yup
          .array()
          .of(extendEventSchema)
          .when("is_create_event", {
            is: true,
            then: (schema) =>
              schema.min(1, "Minimal satu jadwal harus ada").required(),
            otherwise: (schema) => schema.optional().default([]),
          }),
  })

type TransferFormValues = yup.InferType<ReturnType<typeof getValidationSchema>>

const TransferMemberDialog = ({
  open,
  onOpenChange,
  onSuccess,
  member,
  trainer,
  pkg,
  hasEvent,
}: TransferMemberDialogProps) => {
  const schema = getValidationSchema(hasEvent)
  const queryClient = useQueryClient()

  const form = useForm<TransferFormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      target_trainer: null as any,
      is_create_event: false,
      events: [],
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form

  // console.log("errors:", { watch: watch(), errors })

  const club = useSessionUser((state) => state.club)

  const watchTargetTrainer = watch("target_trainer") as
    | EmployeeDetail
    | undefined
  const watchIsCreateEvent = watch("is_create_event")

  const handleClose = useCallback(() => {
    form.reset()
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleTitleChange = (value: string) => {
    const events = form.getValues("events") || []
    events.forEach((_, index) => {
      form.setValue(`events.${index}.title`, value, {
        shouldValidate: false,
      })
    })
  }

  const handleDescriptionChange = (value: string) => {
    const events = form.getValues("events") || []
    events.forEach((_, index) => {
      form.setValue(`events.${index}.description`, value, {
        shouldValidate: false,
      })
    })
  }

  const handleFrequencyChange = (value: string) => {
    const currentFirstEvent = form.getValues("events.0")
    const title = currentFirstEvent?.title || ""
    const description = currentFirstEvent?.description || ""

    form.setValue("events", [
      {
        ...initTrainerEventValue,
        title,
        description,
        frequency: value,
        start_date: dayjs(pkg?.start_date).format("YYYY-MM-DD"),
        end_date: dayjs(pkg?.end_date).format("YYYY-MM-DD"),
        start_time: dayjs().format("HH:mm"),
        end_time: dayjs().add(1, "hour").format("HH:mm"),
        selected_weekdays: [
          ...(value === "weekly"
            ? [
                {
                  day_of_week: dayjs()
                    .locale("en")
                    .format("dddd")
                    .toLowerCase(),
                  start_time: dayjs().format("HH:mm"),
                  end_time: dayjs().add(1, "hour").format("HH:mm"),
                },
              ]
            : []),
        ],
      },
    ])
    form.clearErrors()
  }

  // Reset form when dialog opens

  useEffect(() => {
    if (open && hasEvent) {
      form.setValue("is_create_event", true)
      form.setValue("events", [
        {
          ...initTrainerEventValue,
          title: pkg?.package_name || "",
          start_date: dayjs(pkg?.start_date).format("YYYY-MM-DD"),
          end_date: dayjs(pkg?.end_date).format("YYYY-MM-DD"),
          start_time: dayjs().format("HH:mm"),
          end_time: dayjs().add(1, "hour").format("HH:mm"),
          selected_weekdays: [
            {
              day_of_week: dayjs().locale("en").format("dddd").toLowerCase(),
              start_time: dayjs().format("HH:mm"),
              end_time: dayjs().add(1, "hour").format("HH:mm"),
            },
          ],
        },
      ])
    } else if (open && !hasEvent) {
      form.setValue("events", [])
      form.setValue("is_create_event", false)
    }
  }, [open, pkg, form, hasEvent])

  const refetchQuery = () => {
    ;[
      QUERY_KEY.trainers,
      QUERY_KEY.trainerActiveMembers,
      QUERY_KEY.generateEvents,
      QUERY_KEY.originalEvents,
      QUERY_KEY.cuttingSessions,
    ].forEach((key) => {
      queryClient.resetQueries({ queryKey: [key] })
    })
  }

  const transferMemberMutation = useMutation({
    mutationFn: (data: TransferMemberRequest) => apiTransferMember(data),
    onSuccess: () => {
      toast.success("Member berhasil ditransfer")
      refetchQuery()
      onSuccess()
      handleClose()
    },
  })

  const onSubmit = (data: TransferFormValues) => {
    if (!member || !pkg) return

    const firstEvent = data.events?.[0]

    if (firstEvent?.frequency === "weekly") {
      const hasEmptyDays = data.events?.some(
        (evt) => !evt.selected_weekdays || evt.selected_weekdays.length === 0
      )
      if (hasEmptyDays) {
        toast.error("Silakan pilih minimal satu hari untuk jadwal mingguan")
        return
      }
    }

    const payload: TransferMemberRequest = {
      member_package_id: pkg.member_package_id,
      trainer_id: data.target_trainer.id,
      events: data.is_create_event
        ? (data.events || []).map(
            (evt) =>
              ({
                ...evt,
                club_id: club?.id as number,
                employee_id: data.target_trainer.id,
                member_id: member?.id,
                package_id: pkg?.package_id,
                member_package_id: pkg?.member_package_id,
                title: firstEvent?.title,
                description: firstEvent?.description,
                background_color: firstEvent?.background_color,
                color: firstEvent?.color,
                frequency: firstEvent?.frequency,
                repeat: 0,
                end_type: "on",
                event_type: "pt_program",
                is_publish: 1,
                selected_months: [],
                week_number: [],
                selected_weekdays:
                  firstEvent?.frequency === "weekly"
                    ? evt.selected_weekdays
                    : [],
              }) as CreateEventRequest
          )
        : [],
    }

    transferMemberMutation.mutate(payload)
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

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        scrollBody
        // showCloseButton={false}
        // className="max-w-2xl pb-0"
        // className="fixed! inset-0! top-0! left-0! z-50! h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! gap-0! rounded-none! border-0! p-0!"
        // scrollBody={false}
        className="pb-0 max-sm:fixed max-sm:inset-0 max-sm:z-50 max-sm:flex max-sm:h-screen max-sm:max-w-none max-sm:flex-col max-sm:rounded-none max-sm:border-0 sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Ganti Trainer Member</DialogTitle>
          <DialogDescription>
            Pindahkan paket member ke trainer lain dan atur jadwal barunya.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex h-full flex-col">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-2">
              {/* Animated Transfer Illustration */}
              <div className="bg-muted/30 relative flex items-center justify-between rounded-lg border border-dashed p-4">
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
                    <span className="text-muted-foreground text-[9px] uppercase sm:text-xs">
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
                          <AvatarImage src={watchTargetTrainer.photo || ""} />
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
                      {watchTargetTrainer?.name || "??"}
                    </p>
                    <span className="text-primary text-[9px] uppercase sm:text-xs">
                      Penerima
                    </span>
                  </div>
                </div>
              </div>

              {/* Package Details Info */}
              {pkg && (
                <div className="bg-primary/5 relative overflow-hidden rounded-2xl border border-dashed p-4 sm:p-5">
                  <div className="absolute -top-4 -right-4 size-16 opacity-5 sm:-top-6 sm:-right-6 sm:size-24 sm:opacity-10">
                    <DirectInbox
                      size={64}
                      variant="Bulk"
                      className="text-primary sm:size-24"
                    />
                  </div>
                  <div className="relative flex items-start gap-3 sm:gap-4">
                    <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg shadow-md">
                      <Calendar
                        size={16}
                        variant="Bulk"
                        className="sm:size-5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="truncate text-sm font-semibold">
                          {pkg.package_name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="bg-background w-fit py-0 text-[10px] uppercase sm:text-xs"
                        >
                          {pkg.package_type?.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            size={12}
                            className="text-muted-foreground sm:size-3.5"
                          />
                          <span className="text-muted-foreground text-[10px] sm:text-xs">
                            Sisa {pkg.total_available_session} Sesi
                          </span>
                        </div>
                        <div className="bg-muted-foreground/20 hidden h-3 w-px sm:block" />
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            size={12}
                            className="text-muted-foreground sm:size-3.5"
                          />
                          <span className="text-muted-foreground text-[10px] sm:text-xs">
                            {dayjs(pkg.start_date).format("DD MMM YYYY")} -{" "}
                            {dayjs(pkg.end_date).format("DD MMM YYYY")}
                          </span>
                        </div>
                        <div className="bg-muted-foreground/20 hidden h-3 w-px sm:block" />
                        <div className="flex items-center gap-1.5">
                          <Calendar
                            size={12}
                            className="text-muted-foreground sm:size-3.5"
                          />
                          <span className="text-muted-foreground text-[10px] sm:text-xs">
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
                      <FormLabel>
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
                        getOptionValue={(option: any) => option.id.toString()}
                        cacheUniqs={[open.toString()]}
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
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                        menuPlacement="auto"
                        onChange={(option) => field.onChange(option)}
                      />
                    )}
                  />
                </div>

                <div className="bg-border h-px w-full" />

                {!hasEvent && (
                  <div className="flex items-center justify-between px-1">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold">
                        Tambah Jadwal Baru
                      </FormLabel>
                      <p className="text-muted-foreground text-[10px] sm:text-xs">
                        Aktifkan jika ingin membuat jadwal latihan baru dengan
                        trainer tujuan.
                      </p>
                    </div>
                    <FormFieldItem
                      control={control}
                      name="is_create_event"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (checked) {
                              handleFrequencyChange("daily")
                            } else {
                              form.setValue("events", [])
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                )}

                {(hasEvent || watchIsCreateEvent) && (
                  <div className="space-y-4 px-1">
                    {hasEvent && (
                      <Alert className="border-warning/50 bg-primary/5 text-primary border border-dashed">
                        <Info className="size-4" />
                        <AlertDescription className="text-primary text-xs">
                          Seluruh jadwal member dengan paket saat ini akan
                          dihapus secara otomatis. Silakan buat jadwal baru
                          dengan trainer baru.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="flex-1">
                        <FormFieldItem
                          control={control}
                          name="events.0.title"
                          label={
                            <FormLabel>
                              Judul <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.events?.[0]?.title)}
                          errorMessage={errors.events?.[0]?.title?.message}
                          render={({ field }) => (
                            <Input
                              {...field}
                              value={field.value || ""}
                              className="w-full"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                field.onChange(e)
                                handleTitleChange(e.target.value)
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className="w-full md:w-32">
                        <FormFieldItem
                          control={control}
                          name="events.0.frequency"
                          label={
                            <FormLabel>
                              Frekuensi{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.events?.[0]?.frequency)}
                          errorMessage={errors.events?.[0]?.frequency?.message}
                          render={({ field }) => (
                            <Select
                              value={field.value || ""}
                              onValueChange={(value: string) => {
                                field.onChange(value)
                                handleFrequencyChange(value)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Harian</SelectItem>
                                <SelectItem value="weekly">Mingguan</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <FormFieldItem
                      control={control}
                      name="events.0.description"
                      label={<FormLabel>Deskripsi</FormLabel>}
                      invalid={Boolean(errors.events?.[0]?.description)}
                      errorMessage={errors.events?.[0]?.description?.message}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                            field.onChange(e)
                            handleDescriptionChange(e.target.value)
                          }}
                        />
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="events.0.background_color"
                      label={
                        <FormLabel>
                          <TickCircle
                            size={16}
                            variant="Bulk"
                            className="text-primary"
                          />
                          Warna Agenda{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.events?.[0]?.background_color)}
                      errorMessage={
                        errors.events?.[0]?.background_color?.message
                      }
                      render={({ field: bgField }) => (
                        <FormFieldItem
                          control={control}
                          name="events.0.color"
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

                    {form.watch("events.0.frequency") === "daily" && (
                      <DailySchedule
                        form={form as unknown as ReturnEventTrainerSchemaType}
                        pkg={pkg || null}
                        showAddDateButton={true}
                      />
                    )}

                    {form.watch("events.0.frequency") === "weekly" && (
                      <WeeklySchedule
                        form={form as unknown as ReturnEventTrainerSchemaType}
                        pkg={pkg || null}
                        isSpecificTime={
                          form.watch("events.0.is_specific_time") ?? false
                        }
                        watchedBgColor={
                          form.watch("events.0.background_color") ?? undefined
                        }
                        watchedTextColor={
                          form.watch("events.0.color") ?? undefined
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </form>
          </Form>

          <DialogFooter className="w-full py-4">
            <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
              <div></div>
              <Button
                onClick={handleSubmit(onSubmit)}
                className="w-full sm:w-auto"
                disabled={transferMemberMutation.isPending}
              >
                {transferMemberMutation.isPending
                  ? "Memproses..."
                  : "Ganti Trainer"}
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
