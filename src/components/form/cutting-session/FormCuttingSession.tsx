import React from "react"
import { SubmitHandler, useFieldArray } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreateCuttingSession } from "@/services/api/@types/cutting-session"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { MemberDetail } from "@/services/api/@types/member"
import {
  apiCreateCuttingSession,
  apiDeleteCuttingSession,
  apiUpdateCuttingSession,
} from "@/services/api/CuttingSessionService"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import {
  apiGetMemberList,
  apiGetMemberPackages,
} from "@/services/api/MembeService"
import dayjs from "dayjs"
import { Plus, Trash2, User } from "lucide-react"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  ReturnAsyncSelect,
  Select,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import {
  CuttingSessionFormSchema,
  ReturnCuttingSessionFormSchema,
} from "./validation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnCuttingSessionFormSchema
  onClose: () => void
}

const FormCuttingSession: React.FC<FormProps> = ({
  open,
  type,
  formProps,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const club = useSessionUser((state) => state.club)
  const {
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = formProps
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const {
    fields: exerciseFields,
    append: appendExercise,
    remove: removeExercise,
  } = useFieldArray({
    control,
    name: "exercises",
  })

  const { data: memberPackages } = useQuery({
    queryKey: [QUERY_KEY.memberPackages, watchData.member?.code],
    queryFn: async () => {
      if (!watchData.member?.code) return { data: { data: [] } }
      const res = await apiGetMemberPackages(watchData.member.code, {
        page: 1,
        per_page: 100,
        search: [
          {
            search_column: "duration_status_code",
            search_condition: "=",
            search_text: "1",
          },
        ],
      })
      return res
    },
    enabled: !!watchData.member?.code,
    select: (res) => res.data.data,
  })

  React.useEffect(() => {
    if (!watchData.member?.id) {
      setValue("member_package_id", 0)
      setValue("member_package", null)
    }
  }, [watchData.member?.id, setValue])

  const getMemberList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<MemberDetail, GroupBase<MemberDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetMemberList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
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
    []
  )

  const getTrainerList = React.useCallback(
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
          {
            search_operator: "and",
            search_column: "type",
            search_condition: "=",
            search_text: "trainer",
          },
        ],
      })
      return {
        options: response.data.data,
        hasMore: response.data.data.length >= 1,
        additional: {
          page: additional!.page + 1,
        },
      }
    },
    []
  )

  const handleClose = () => {
    formProps.reset({})
    onClose()
  }

  const handlePrefetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.cuttingSessions] })
    handleClose()
  }

  const create = useMutation({
    mutationFn: (data: CreateCuttingSession) => apiCreateCuttingSession(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefetch,
  })

  const update = useMutation({
    mutationFn: (data: CreateCuttingSession) =>
      apiUpdateCuttingSession(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefetch,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteCuttingSession(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefetch,
  })

  const onSubmit: SubmitHandler<CuttingSessionFormSchema> = (data) => {
    const payload: CreateCuttingSession = {
      club_id: club?.id as number,
      member_id: data.member_id,
      member_package_id: data.member_package_id,
      trainer_id: data.trainer_id,
      type: data.type,
      session_cut: data.session_cut,
      description: data.description || null,
      due_date: dayjs(data.due_date).format("YYYY-MM-DD"),
      start_date: dayjs(data.start_date).format("YYYY-MM-DD HH:mm"),
      end_date: dayjs(data.end_date).format("YYYY-MM-DD HH:mm"),
      exercises: data.exercises || [],
    }

    if (type === "update") {
      update.mutate(payload)
      return
    }
    if (type === "create") {
      create.mutate(payload)
      return
    }
  }

  const handleDelete = () => {
    deleteItem.mutate(watchData.id as number)
    setConfirmDelete(false)
    handleClose()
  }

  const typeOptions = [
    { label: "PT Program", value: "pt_program" },
    { label: "Class", value: "class" },
    { label: "Service", value: "service" },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent floating className="gap-0 sm:max-w-xl">
          <Form {...formProps}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex h-full flex-col"
            >
              <SheetHeader>
                <SheetTitle>
                  {type === "create"
                    ? "Create Cutting Session"
                    : "Update Cutting Session"}
                </SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <div className="flex-1 overflow-hidden px-2 pr-1">
                <ScrollArea className="h-full px-2 pr-3">
                  <div className="space-y-6 px-1 pb-4">
                    <FormFieldItem
                      control={control}
                      name="member"
                      label={
                        <FormLabel>
                          Member <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.member_id)}
                      errorMessage={errors.member_id?.message}
                      render={({ field, fieldState }) => {
                        return (
                          <SelectAsyncPaginate
                            isClearable
                            loadOptions={getMemberList as any}
                            additional={{ page: 1 }}
                            placeholder="Select Member"
                            value={field.value}
                            cacheUniqs={[watchData.member]}
                            getOptionLabel={(option) => option.name!}
                            getOptionValue={(option) => `${option.id}`}
                            debounceTimeout={500}
                            formatOptionLabel={({ name, photo }: any) => {
                              return (
                                <div className="flex items-center justify-start gap-2">
                                  <Avatar className="h-8 w-8">
                                    {photo ? (
                                      <AvatarImage src={photo} alt={name} />
                                    ) : (
                                      <AvatarFallback>
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <span className="text-sm">{name}</span>
                                </div>
                              )
                            }}
                            onChange={(option) => {
                              field.onChange(option)
                              setValue("member_id", option?.id || 0)
                              setValue("member_package_id", 0)
                              setValue("member_package", null)
                            }}
                            error={!!fieldState.error}
                          />
                        )
                      }}
                    />

                    <FormFieldItem
                      control={control}
                      name="member_package"
                      label={
                        <FormLabel>
                          Member Package{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.member_package_id)}
                      errorMessage={errors.member_package_id?.message}
                      render={({ field, fieldState }) => (
                        <Select
                          isSearchable={false}
                          placeholder="Select Member Package"
                          error={!!fieldState.error}
                          value={
                            memberPackages?.find(
                              (pkg) => pkg.id === watchData.member_package_id
                            )
                              ? {
                                  label:
                                    memberPackages.find(
                                      (pkg) =>
                                        pkg.id === watchData.member_package_id
                                    )?.package?.name || "",
                                  value: watchData.member_package_id,
                                }
                              : null
                          }
                          options={memberPackages?.map((pkg) => ({
                            label: `${pkg.package?.name || ""} (${pkg.session_duration} sessions)`,
                            value: pkg.id,
                          }))}
                          isDisabled={!watchData.member_id}
                          onChange={(option) => {
                            field.onChange(option)
                            setValue("member_package_id", option?.value || 0)
                          }}
                        />
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="trainer"
                      label={
                        <FormLabel>
                          Trainer <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.trainer_id)}
                      errorMessage={errors.trainer_id?.message}
                      render={({ field, fieldState }) => (
                        <SelectAsyncPaginate
                          isClearable
                          loadOptions={getTrainerList as any}
                          additional={{ page: 1 }}
                          placeholder="Select Trainer"
                          value={field.value}
                          error={!!fieldState.error}
                          cacheUniqs={[watchData.trainer]}
                          getOptionLabel={(option) => option.name!}
                          getOptionValue={(option) => `${option.id}`}
                          debounceTimeout={500}
                          formatOptionLabel={({ name, photo }) => {
                            return (
                              <div className="flex items-center justify-start gap-2">
                                <Avatar className="h-8 w-8">
                                  {photo ? (
                                    <AvatarImage src={photo} alt={name} />
                                  ) : (
                                    <AvatarFallback>
                                      <User className="h-4 w-4" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <span className="text-sm">{name}</span>
                              </div>
                            )
                          }}
                          onChange={(option) => {
                            field.onChange(option)
                            setValue("trainer_id", option?.id || 0)
                          }}
                        />
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="type"
                      label={
                        <FormLabel>
                          Type <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      render={({ field, fieldState }) => (
                        <Select
                          isSearchable={false}
                          placeholder="Select Type"
                          error={!!fieldState.error}
                          value={typeOptions.find(
                            (opt) => opt.value === field.value
                          )}
                          options={typeOptions}
                          onChange={(option) => field.onChange(option?.value)}
                        />
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="session_cut"
                      label={
                        <FormLabel>
                          Session Cut{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      render={({ field }) => (
                        <Input
                          type="number"
                          autoComplete="off"
                          placeholder="Session Cut"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            field.onChange(value)
                          }}
                        />
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="start_date"
                      label={
                        <FormLabel>
                          Start Date <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      render={({ field, fieldState }) => (
                        <div className="flex w-full gap-2">
                          <DatePicker
                            placeholder="Start Date"
                            error={!!fieldState.error}
                            selected={
                              field.value
                                ? dayjs(field.value).toDate()
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const currentTime = field.value
                                  ? dayjs(field.value).format("HH:mm")
                                  : "09:00"
                                field.onChange(
                                  dayjs(date)
                                    .hour(parseInt(currentTime.split(":")[0]))
                                    .minute(parseInt(currentTime.split(":")[1]))
                                    .toISOString()
                                )
                              } else {
                                field.onChange("")
                              }
                            }}
                          />
                        </div>
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="end_date"
                      label={
                        <FormLabel>
                          End Date <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      render={({ field, fieldState }) => (
                        <div className="flex w-full gap-2">
                          <DatePicker
                            placeholder="End Date"
                            error={!!fieldState.error}
                            selected={
                              field.value
                                ? dayjs(field.value).toDate()
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const currentTime = field.value
                                  ? dayjs(field.value).format("HH:mm")
                                  : "10:00"
                                field.onChange(
                                  dayjs(date)
                                    .hour(parseInt(currentTime.split(":")[0]))
                                    .minute(parseInt(currentTime.split(":")[1]))
                                    .toISOString()
                                )
                              } else {
                                field.onChange("")
                              }
                            }}
                          />
                        </div>
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="due_date"
                      label={
                        <FormLabel>
                          Due Date <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      render={({ field, fieldState }) => (
                        <DatePicker
                          placeholder="Due Date"
                          error={!!fieldState.error}
                          selected={
                            field.value
                              ? dayjs(field.value).toDate()
                              : undefined
                          }
                          onSelect={(date) => {
                            field.onChange(
                              date ? dayjs(date).format("YYYY-MM-DD") : ""
                            )
                          }}
                        />
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="description"
                      label="Description"
                      render={({ field }) => (
                        <Textarea
                          autoComplete="off"
                          placeholder="Description"
                          {...field}
                          value={field.value ?? ""}
                        />
                      )}
                    />

                    {/* Exercises Section */}
                    <div className="mb-2 w-full">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-semibold">
                          Exercises
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            appendExercise({
                              name: "",
                              sets: 1,
                              reps: 1,
                              weight_kg: 0,
                              rpe: 1,
                            })
                          }
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Exercise
                        </Button>
                      </div>
                      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                        Tambahkan daftar latihan yang dilakukan dalam sesi ini.
                        Setiap latihan mencakup nama, jumlah set, repetisi per
                        set, beban (kg), dan tingkat effort (RPE 1-10).
                      </p>
                      {exerciseFields.length === 0 && (
                        <p className="mb-3 text-sm text-gray-500">
                          No exercises added. Click &quot;Add Exercise&quot; to
                          add one.
                        </p>
                      )}
                      {exerciseFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="mb-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h6 className="text-sm font-semibold">
                              Exercise {index + 1}
                            </h6>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => removeExercise(index)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <FormFieldItem
                              control={control}
                              name={`exercises.${index}.name`}
                              label={
                                <FormLabel>
                                  Exercise Name{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                              }
                              render={({ field }) => (
                                <Input
                                  type="text"
                                  autoComplete="off"
                                  placeholder="Exercise Name"
                                  {...field}
                                />
                              )}
                            />
                            <FormFieldItem
                              control={control}
                              name={`exercises.${index}.sets`}
                              label={
                                <FormLabel>
                                  Sets{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                              }
                              description="Jumlah set yang dilakukan (minimal 1)"
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  autoComplete="off"
                                  placeholder="Sets"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0
                                    field.onChange(value)
                                  }}
                                />
                              )}
                            />
                            <FormFieldItem
                              control={control}
                              name={`exercises.${index}.reps`}
                              label={
                                <FormLabel>
                                  Reps{" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                              }
                              description="Jumlah repetisi per set (minimal 1)"
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  autoComplete="off"
                                  placeholder="Reps"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0
                                    field.onChange(value)
                                  }}
                                />
                              )}
                            />
                            <FormFieldItem
                              control={control}
                              name={`exercises.${index}.weight_kg`}
                              label={
                                <FormLabel>
                                  Weight (Kg){" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                              }
                              description="Beban yang digunakan dalam kilogram (minimal 0)"
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  autoComplete="off"
                                  placeholder="Weight (Kg)"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value =
                                      parseFloat(e.target.value) || 0
                                    field.onChange(value)
                                  }}
                                />
                              )}
                            />
                            <FormFieldItem
                              control={control}
                              name={`exercises.${index}.rpe`}
                              label={
                                <FormLabel>
                                  RPE (1-10){" "}
                                  <span className="text-destructive">*</span>
                                </FormLabel>
                              }
                              description="Rating of Perceived Exertion - tingkat effort yang dirasakan (skala 1-10, minimal 1, maksimal 10)"
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  autoComplete="off"
                                  placeholder="RPE (1-10)"
                                  min={1}
                                  max={10}
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1
                                    field.onChange(
                                      value > 10 ? 10 : value < 1 ? 1 : value
                                    )
                                  }}
                                />
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </div>
              <SheetFooter className="px-4 py-2">
                <div className="flex items-center justify-between">
                  {type === "update" && (
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={create.isPending || update.isPending}
                    >
                      {create.isPending || update.isPending
                        ? "Saving..."
                        : "Save"}
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Cutting Session"
        description="Are you sure want to delete this Cutting Session?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FormCuttingSession
