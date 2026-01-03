import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSessionUser } from "@/auth"
import {
  CreateEventRequest,
  UpdateEventRequest,
} from "@/services/api/@types/event"
import {
  TrainerDetail,
  TrainerMember,
  TrainerPackage,
} from "@/services/api/@types/trainer"
import {
  apiBulkCreateEvent,
  apiDeleteOriginalEvent,
  apiUpdateOriginalEvent,
} from "@/services/api/EventService"
import { TickCircle, Trash } from "iconsax-reactjs"
import { toast } from "sonner"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import { ColorPalettePicker } from "@/components/ui/color-palette-picker"
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/animate-ui/components/animate/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/animate-ui/components/radix/dialog"
import DailySchedule from "./DailySchedule"
import GeneratedEventsTab from "./GeneratedEventsTab"
import WeeklySchedule from "./WeeklySchedule"
import {
  EventTrainerFormValues,
  initTrainerEventValue,
  ReturnEventTrainerSchemaType,
} from "./validation"

export interface DialogCreatePTScheduleProps {
  formInstance: ReturnEventTrainerSchemaType
  open: boolean
  type: "create" | "update" | "create_daily" | "update_daily" | "update_weekly"
  onOpenChange: (open: boolean) => void
  member: TrainerMember | null
  trainer: TrainerDetail | null
  pkg: TrainerPackage | null
}

const DialogCreatePTSchedule = ({
  formInstance,
  open,
  type,
  onOpenChange,
  member,
  trainer,
  pkg,
}: DialogCreatePTScheduleProps) => {
  const form = formInstance
  const club = useSessionUser((state) => state.club)
  const [activeTab, setActiveTab] = useState("form")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // useEffect(() => {
  //   if (open && (type === "create" || type === "create_daily")) {
  //     form.setValue("events", [
  //       {
  //         ...initTrainerEventValue,
  //         title: pkg?.package_name || "",
  //         start_date: dayjs(pkg?.start_date).format("YYYY-MM-DD"),
  //         end_date: dayjs(pkg?.end_date).format("YYYY-MM-DD"),
  //         start_time: dayjs().format("HH:mm"),
  //         end_time: dayjs().add(1, "hour").format("HH:mm"),
  //         selected_weekdays: [
  //           ...(type === "create"
  //             ? [
  //                 {
  //                   day_of_week: dayjs().locale("en")
  //                     .format("dddd")
  //                     .toLowerCase(),
  //                   start_time: dayjs().format("HH:mm"),
  //                   end_time: dayjs().add(1, "hour").format("HH:mm"),
  //                 },
  //               ]
  //             : []),
  //         ],
  //       },
  //     ])
  //   }
  // }, [open, pkg, form, type])

  // const {
  //   watch,
  //   formState: { errors },
  // } = form
  // console.log("Watched:", watch("events"))
  // console.log("Errors:", JSON.stringify(errors, null, 2))

  const eventId = form.watch("events.0.id")
  const watchedFrequency = form.watch("events.0.frequency")
  const watchedIsSpecificTime = form.watch("events.0.is_specific_time")
  const watchedBgColor = form.watch("events.0.background_color")
  const watchedTextColor = form.watch("events.0.color")

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

    // Reset events array ke 1 item dengan frequency baru
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
          ...(watchedFrequency === "daily"
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

    // Clear semua error validasi
    form.clearErrors()
  }

  const onCloseDialog = () => {
    form.reset({
      events: [],
    })
    onOpenChange(false)
    setActiveTab("form")
  }

  const queryClient = useQueryClient()

  const refetchQuery = () => {
    ;[
      QUERY_KEY.generateEvents,
      QUERY_KEY.originalEvents,
      QUERY_KEY.cuttingSessions,
      QUERY_KEY.trainerActiveMembers,
      QUERY_KEY.trainers,
    ].forEach((key) => {
      queryClient.resetQueries({ queryKey: [key] })
    })
  }

  // Mutation untuk delete original event
  const deleteOriginalMutation = useMutation({
    mutationFn: (eventId: number) => apiDeleteOriginalEvent(eventId),
    onSuccess: () => {
      toast.success("Jadwal berhasil dihapus")
      refetchQuery()
      setDeleteConfirmOpen(false)
      onCloseDialog()
    },
  })

  const updateEvent = useMutation({
    mutationFn: (data: UpdateEventRequest) => apiUpdateOriginalEvent(data),
    onSuccess: () => {
      toast.success("Jadwal berhasil diperbarui")
      refetchQuery()
      onCloseDialog()
    },
  })

  const bulkCreate = useMutation({
    mutationFn: (data: CreateEventRequest[]) => apiBulkCreateEvent(data),
    onSuccess: () => {
      refetchQuery()
      toast.success("Jadwal Berhasil Disimpan")
      onCloseDialog()
    },
  })

  const onSubmit = (data: EventTrainerFormValues) => {
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
    const basePayload =
      data.events?.map((evt) => ({
        ...evt,
        club_id: club?.id as number,
        employee_id: trainer?.id,
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
          firstEvent?.frequency === "weekly" ? evt.selected_weekdays : [],
      })) || []

    if (type?.includes("update")) {
      const updatePayload = basePayload[0]
      if (updatePayload && eventId) {
        updateEvent.mutate({
          ...updatePayload,
          id: eventId,
        } as unknown as Record<string, unknown> & UpdateEventRequest)
      }
    } else {
      bulkCreate.mutate(
        basePayload as unknown as Record<string, unknown> & CreateEventRequest[]
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCloseDialog}>
      <DialogContent scrollBody className="max-w-2xl pb-2">
        <DialogHeader>
          <DialogTitle>
            {type?.includes("update")
              ? "Ubah Jadwal Latihan"
              : "Buat Jadwal Latihan"}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-2 w-full"
          >
            {type === "update_weekly" ? (
              <TabsList className="h-auto w-full justify-start gap-1">
                <TabsTrigger value="form">Ubah jadwal mingguan</TabsTrigger>
                <TabsTrigger value="generated">
                  Hapus pengulangan hari
                </TabsTrigger>
              </TabsList>
            ) : null}

            <TabsContents>
              <TabsContent value="form" className="px-1">
                <div className="flex w-full flex-col gap-3">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full space-y-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start">
                        <div className="flex-1">
                          <FormFieldItem
                            control={form.control}
                            name="events.0.title"
                            label={
                              <FormLabel>
                                Judul{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                            }
                            invalid={Boolean(
                              form.formState.errors.events?.[0]?.title
                            )}
                            errorMessage={
                              form.formState.errors.events?.[0]?.title?.message
                            }
                            render={({ field }) => (
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="w-full"
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleTitleChange(e.target.value)
                                }}
                              />
                            )}
                          />
                        </div>
                        {type === "create" ? (
                          <div className="w-full md:w-32">
                            <FormFieldItem
                              control={form.control}
                              name="events.0.frequency"
                              label={
                                <FormLabel>
                                  Frekuensi{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                              }
                              invalid={Boolean(
                                form.formState.errors.events?.[0]?.frequency
                              )}
                              errorMessage={
                                form.formState.errors.events?.[0]?.frequency
                                  ?.message
                              }
                              render={({ field }) => (
                                <Select
                                  value={field.value || ""}
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    handleFrequencyChange(value)
                                  }}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="daily">
                                      Harian
                                    </SelectItem>
                                    <SelectItem value="weekly">
                                      Mingguan
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        ) : null}
                      </div>

                      <FormFieldItem
                        control={form.control}
                        name="events.0.description"
                        label={<FormLabel>Deskripsi</FormLabel>}
                        invalid={Boolean(
                          form.formState.errors.events?.[0]?.description
                        )}
                        errorMessage={
                          form.formState.errors.events?.[0]?.description
                            ?.message
                        }
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e)
                              handleDescriptionChange(e.target.value)
                            }}
                          />
                        )}
                      />
                      <FormFieldItem
                        control={form.control}
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
                        invalid={Boolean(
                          form.formState.errors.events?.[0]?.background_color
                        )}
                        errorMessage={
                          form.formState.errors.events?.[0]?.background_color
                            ?.message
                        }
                        render={({ field: bgField }) => (
                          <FormFieldItem
                            control={form.control}
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

                      {watchedFrequency === "daily" && (
                        <DailySchedule
                          form={formInstance}
                          pkg={pkg}
                          showAddDateButton={type === "create"}
                        />
                      )}

                      {watchedFrequency === "weekly" && (
                        <WeeklySchedule
                          form={formInstance}
                          pkg={pkg}
                          isSpecificTime={watchedIsSpecificTime ?? false}
                          watchedBgColor={watchedBgColor ?? undefined}
                          watchedTextColor={watchedTextColor ?? undefined}
                        />
                      )}

                      <DialogFooter className="flex w-full items-center justify-between!">
                        {type.includes("update") ? (
                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => {
                              if (eventId) {
                                setDeleteConfirmOpen(true)
                              } else {
                                toast.error("Jadwal tidak ditemukan")
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            <Trash
                              color="currentColor"
                              size="24"
                              variant="Outline"
                            />
                          </Button>
                        ) : (
                          <div></div>
                        )}
                        <Button type="submit" disabled={bulkCreate.isPending}>
                          {bulkCreate.isPending
                            ? "Menyimpan..."
                            : type?.includes("update")
                              ? "Update Jadwal"
                              : "Simpan Jadwal"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              </TabsContent>
              <TabsContent value="generated" className="px-1">
                <GeneratedEventsTab
                  open={open}
                  type={type}
                  pkg={pkg}
                  form={form}
                />
              </TabsContent>
            </TabsContents>
          </Tabs>
        </div>
      </DialogContent>
      <AlertConfirm
        open={deleteConfirmOpen}
        type="delete"
        title="Hapus Jadwal"
        description="Apakah Anda yakin ingin menghapus jadwal ini? Semua data jadwal akan dihapus secara permanen."
        loading={deleteOriginalMutation.isPending}
        onClose={() => setDeleteConfirmOpen(false)}
        onLeftClick={() => setDeleteConfirmOpen(false)}
        onRightClick={() => {
          if (eventId) {
            deleteOriginalMutation.mutate(eventId)
          }
        }}
      />
    </Dialog>
  )
}

export default DialogCreatePTSchedule
