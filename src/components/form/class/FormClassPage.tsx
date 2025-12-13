import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ClassCategoryDetail,
  CreateClassPage,
} from "@/services/api/@types/class"
import { EmployeeDetail } from "@/services/api/@types/employee"
import {
  apiCreateClass,
  apiGetAllInstructorByClass,
  apiGetClassCategory,
  apiUpdateClass,
} from "@/services/api/ClassService"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import { apiDeletePackage } from "@/services/api/PackageService"
import dayjs from "dayjs"
import { Trash2, Plus, User } from "lucide-react"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-picker"
import { SimpleTimePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ReturnAsyncSelect } from "@/components/ui/react-select"
import { Select, SelectAsyncPaginate } from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
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
  ClassPageFormSchema,
  LevelClassOptions,
  ReturnClassPageFormSchema,
  AvailableForOptions,
  VisibleForOptions,
  ClassTypeOptions,
  IsPublishOptions,
  DurationTimeTypeOptions,
  WeekdayOptions,
} from "./validation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnClassPageFormSchema
  onClose: () => void
}

const FormClassPage: React.FC<FormProps> = ({
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
    formState: { errors },
  } = formProps
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  // Use specific watch to avoid infinite loops
  const watchId = watch("id")
  const watchAllowAllInstructor = watch("allow_all_instructor")
  const watchInstructors = watch("instructors")
  const watchCategory = watch("category")
  const watchIsForever = watch("is_forever")

  // console.log("watchData", watchData)
  // console.log("errors", JSON.stringify(errors))

  const {
    data: instructors,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY.trainers, watchId],
    queryFn: () => apiGetAllInstructorByClass(watchId as number),
    select: (res) => res.data,
    enabled: !!watchId,
  })

  React.useEffect(() => {
    if (type === "update" && !error && instructors) {
      formProps.setValue("instructors", instructors)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, instructors, type])

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

  const getClassCategoryList = async (
    inputValue: string,
    _: OptionsOrGroups<ClassCategoryDetail, GroupBase<ClassCategoryDetail>>,
    additional?: { page: number }
  ) => {
    const response = await apiGetClassCategory({
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
  }

  const handleClose = React.useCallback(() => {
    formProps.reset({})
    onClose()
  }, [formProps, onClose])

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.classes] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.events] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateClassPage) => apiCreateClass(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateClassPage) =>
      apiUpdateClass(watchId as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeletePackage(id),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<ClassPageFormSchema> = (data) => {
    const payload: CreateClassPage = {
      club_id: club?.id as number,
      photo: data.photo,
      name: data.name,
      capacity: data.capacity,
      level: data.level ?? null,
      burn_calories: data.burn_calories ?? null,
      description: data.description ?? null,
      allow_all_instructor: data.allow_all_instructor ?? false,
      enabled: data.enabled ?? true,
      start_date: dayjs(data.start_date).format("YYYY-MM-DD"),
      end_date: dayjs(data.end_date).format("YYYY-MM-DD"),
      is_forever: data.is_forever ?? false,
      is_publish: data.is_publish,
      available_for: data.available_for,
      visible_for: data.visible_for,
      class_type: data.class_type,
      embed_video: data.embed_video ?? null,
      background_color: data.background_color ?? null,
      color: data.color ?? null,
      start_time: data.start_time,
      duration_time: data.duration_time,
      duration_time_type: data.duration_time_type,
      category_id: data?.category?.id || null,
      instructors: data.allow_all_instructor
        ? []
        : (data.instructors?.map((inst) => ({
            id: inst.id,
            trainer_code: inst.code,
            name: inst.name,
          })) ?? []),
      weekdays_available: data.weekdays_available ?? [],
      class_photos: (data.class_photos ?? []) as string[],
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
    deleteItem.mutate(watchId as number)
    setConfirmDelete(false)
    handleClose()
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleClose()
          }
        }}
      >
        <SheetContent floating className="gap-0 sm:max-w-xl">
          <Form {...formProps}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex h-full flex-col"
            >
              <SheetHeader>
                <SheetTitle>
                  {type === "create" ? "Create Class" : "Update Class"}
                </SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <div className="flex-1 overflow-hidden px-2 pr-1">
                <ScrollArea className="h-full px-2 pr-3">
                  <div className="space-y-6 px-1 pb-4">
                    <FormFieldItem
                      control={control}
                      name="name"
                      label={
                        <FormLabel>
                          Name <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.name)}
                      errorMessage={errors.name?.message}
                      render={({ field }) => (
                        <Input
                          type="text"
                          autoComplete="off"
                          placeholder="Name"
                          {...field}
                        />
                      )}
                    />
                    <div className="space-y-2">
                      {/* <div className="flex items-center justify-between">
                        <FormLabel>
                          Instructors{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormFieldItem
                          control={control}
                          name="allow_all_instructor"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                Assign All Instructors
                              </span>
                              <Switch
                                checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div> */}
                      <FormFieldItem
                        control={control}
                        name="instructors"
                        invalid={Boolean(errors.instructors)}
                        errorMessage={errors.instructors?.message}
                        label={
                          <FormLabel>
                            Instructor{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                        }
                        render={({ field, fieldState }) => (
                          <SelectAsyncPaginate
                            isClearable
                            isMulti
                            isLoading={isLoading}
                            loadOptions={getTrainerList as any}
                            additional={{ page: 1 }}
                            placeholder="Select Instructor"
                            value={field.value}
                            error={!!fieldState.error}
                            cacheUniqs={[watchInstructors]}
                            isOptionDisabled={() =>
                              ((watchInstructors as any[]) ?? []).length >= 5
                            }
                            getOptionLabel={(option) => option.name!}
                            getOptionValue={(option) => option.code.toString()}
                            debounceTimeout={500}
                            isDisabled={watchAllowAllInstructor}
                            formatOptionLabel={({ name, photo }) => {
                              return (
                                <div className="flex items-center justify-start gap-2">
                                  <Avatar className="size-8">
                                    {photo ? (
                                      <AvatarImage
                                        src={photo || ""}
                                        alt={name}
                                      />
                                    ) : (
                                      <AvatarFallback>
                                        <User className="size-4" />
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <span className="text-sm">{name}</span>
                                </div>
                              )
                            }}
                            onChange={(option) => field.onChange(option)}
                          />
                        )}
                      />
                    </div>
                    <FormFieldItem
                      control={control}
                      name="category"
                      label={<FormLabel>Category (Optional)</FormLabel>}
                      invalid={Boolean(errors.category)}
                      errorMessage={errors.category?.message}
                      render={({ field, fieldState }) => (
                        <SelectAsyncPaginate
                          isClearable
                          isLoading={isLoading}
                          loadOptions={getClassCategoryList as any}
                          additional={{ page: 1 }}
                          placeholder="Select Category"
                          value={field.value}
                          cacheUniqs={[watchCategory]}
                          error={!!fieldState.error}
                          getOptionLabel={(option) => option.name!}
                          getOptionValue={(option) => option.id.toString()}
                          debounceTimeout={500}
                          onChange={(option) => field.onChange(option)}
                        />
                      )}
                    />
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="burn_calories"
                          label={<FormLabel>Calorie Burn</FormLabel>}
                          invalid={Boolean(errors.burn_calories)}
                          errorMessage={errors.burn_calories?.message}
                          render={({ field }) => (
                            <Input
                              type="number"
                              autoComplete="off"
                              placeholder="Calorie Burn"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="capacity"
                          label={
                            <FormLabel>
                              Capacity{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.capacity)}
                          errorMessage={errors.capacity?.message}
                          render={({ field }) => (
                            <Input
                              type="number"
                              autoComplete="off"
                              placeholder="Capacity"
                              {...field}
                            />
                          )}
                        />
                      </div>
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="level"
                          label={<FormLabel>Level</FormLabel>}
                          invalid={Boolean(errors.level)}
                          errorMessage={errors.level?.message}
                          render={({ field, fieldState }) => (
                            <Select
                              isSearchable={false}
                              placeholder="Select Level"
                              value={LevelClassOptions.filter(
                                (option) => option.value === field.value
                              )}
                              options={LevelClassOptions}
                              error={!!fieldState.error}
                              onChange={(option) =>
                                field.onChange(option?.value ?? null)
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                    <FormFieldItem
                      control={control}
                      name="description"
                      label={<FormLabel>Description</FormLabel>}
                      invalid={Boolean(errors.description)}
                      errorMessage={errors.description?.message}
                      render={({ field }) => (
                        <Textarea
                          placeholder="description"
                          {...field}
                          value={field.value ?? ""}
                        />
                      )}
                    />
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="start_date"
                          label={
                            <FormLabel className="mb-1.5">
                              Start Date{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.start_date)}
                          errorMessage={errors.start_date?.message}
                          render={({ field, fieldState }) => (
                            <DateTimePicker
                              value={
                                field.value
                                  ? dayjs(field.value).toDate()
                                  : undefined
                              }
                              onChange={(date) => {
                                field.onChange(
                                  date ? dayjs(date).format("YYYY-MM-DD") : null
                                )
                              }}
                              error={!!fieldState.error}
                              hideTime={true}
                              clearable
                            />
                          )}
                        />
                      </div>
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="end_date"
                          label={
                            <div className="flex items-center justify-between">
                              <FormLabel>
                                End Date{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormFieldItem
                                control={control}
                                name="is_forever"
                                render={({ field }) => (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">Forever</span>
                                    <Switch
                                      checked={field.value ?? false}
                                      onCheckedChange={field.onChange}
                                    />
                                  </div>
                                )}
                              />
                            </div>
                          }
                          invalid={Boolean(errors.end_date)}
                          errorMessage={errors.end_date?.message}
                          render={({ field, fieldState }) => (
                            <DateTimePicker
                              value={
                                field.value
                                  ? dayjs(field.value).toDate()
                                  : undefined
                              }
                              onChange={(date) => {
                                field.onChange(
                                  date ? dayjs(date).format("YYYY-MM-DD") : null
                                )
                              }}
                              error={!!fieldState.error}
                              hideTime={true}
                              clearable
                              disabled={watchIsForever}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="start_time"
                          label={
                            <FormLabel>
                              Start Time{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.start_time)}
                          errorMessage={errors.start_time?.message}
                          render={({ field, fieldState }) => {
                            const timeValue = field.value
                              ? (() => {
                                  const [hours, minutes] =
                                    field.value.split(":")
                                  const date = new Date()
                                  date.setHours(
                                    parseInt(hours || "0", 10),
                                    parseInt(minutes || "0", 10),
                                    0,
                                    0
                                  )
                                  return date
                                })()
                              : new Date()

                            return (
                              <SimpleTimePicker
                                value={timeValue}
                                onChange={(date) => {
                                  const hours = date
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0")
                                  const minutes = date
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0")
                                  field.onChange(`${hours}:${minutes}`)
                                }}
                                use12HourFormat={false}
                                error={!!fieldState.error}
                              />
                            )
                          }}
                        />
                      </div>
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="duration_time"
                          label={
                            <FormLabel>
                              Duration Time{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.duration_time)}
                          errorMessage={errors.duration_time?.message}
                          render={({ field }) => (
                            <Input
                              type="number"
                              autoComplete="off"
                              placeholder="Duration Time"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                            />
                          )}
                        />
                      </div>
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="duration_time_type"
                          label={
                            <FormLabel>
                              Duration Type{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.duration_time_type)}
                          errorMessage={errors.duration_time_type?.message}
                          render={({ field, fieldState }) => (
                            <Select
                              isSearchable={false}
                              placeholder="Select Duration Type"
                              value={DurationTimeTypeOptions.filter(
                                (option) => option.value === field.value
                              )}
                              options={DurationTimeTypeOptions}
                              error={!!fieldState.error}
                              onChange={(option) =>
                                field.onChange(option?.value)
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="is_publish"
                          label={
                            <FormLabel>
                              Publish Status{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.is_publish)}
                          errorMessage={errors.is_publish?.message}
                          render={({ field, fieldState }) => (
                            <Select
                              isSearchable={false}
                              placeholder="Select Publish Status"
                              value={IsPublishOptions.filter(
                                (option) => option.value === field.value
                              )}
                              options={IsPublishOptions}
                              error={!!fieldState.error}
                              onChange={(option) =>
                                field.onChange(option?.value)
                              }
                            />
                          )}
                        />
                      </div>
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="available_for"
                          label={
                            <FormLabel>
                              Available For{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.available_for)}
                          errorMessage={errors.available_for?.message}
                          render={({ field, fieldState }) => (
                            <Select
                              isSearchable={false}
                              placeholder="Select Available For"
                              value={AvailableForOptions.filter(
                                (option) => option.value === field.value
                              )}
                              options={AvailableForOptions}
                              error={!!fieldState.error}
                              onChange={(option) =>
                                field.onChange(option?.value)
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="visible_for"
                          label={
                            <FormLabel>
                              Visible For{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.visible_for)}
                          errorMessage={errors.visible_for?.message}
                          render={({ field, fieldState }) => (
                            <Select
                              isSearchable={false}
                              placeholder="Select Visible For"
                              value={VisibleForOptions.filter(
                                (option) => option.value === field.value
                              )}
                              options={VisibleForOptions}
                              error={!!fieldState.error}
                              onChange={(option) =>
                                field.onChange(option?.value)
                              }
                            />
                          )}
                        />
                      </div>
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="class_type"
                          label={
                            <FormLabel>
                              Class Type{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.class_type)}
                          errorMessage={errors.class_type?.message}
                          render={({ field, fieldState }) => (
                            <Select
                              isSearchable={false}
                              placeholder="Select Class Type"
                              value={ClassTypeOptions.filter(
                                (option) => option.value === field.value
                              )}
                              options={ClassTypeOptions}
                              error={!!fieldState.error}
                              onChange={(option) =>
                                field.onChange(option?.value)
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                    <FormFieldItem
                      control={control}
                      name="embed_video"
                      label={<FormLabel>Embed Video URL</FormLabel>}
                      invalid={Boolean(errors.embed_video)}
                      errorMessage={errors.embed_video?.message}
                      render={({ field }) => (
                        <Input
                          type="text"
                          autoComplete="off"
                          placeholder="Embed Video URL"
                          {...field}
                          value={field.value ?? ""}
                        />
                      )}
                    />
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="background_color"
                          label={<FormLabel>Background Color</FormLabel>}
                          invalid={Boolean(errors.background_color)}
                          errorMessage={errors.background_color?.message}
                          render={({ field }) => (
                            <Input
                              type="color"
                              autoComplete="off"
                              placeholder="Background Color"
                              {...field}
                              value={field.value ?? "#FFFFFF"}
                            />
                          )}
                        />
                      </div>
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="color"
                          label={<FormLabel>Color</FormLabel>}
                          invalid={Boolean(errors.color)}
                          errorMessage={errors.color?.message}
                          render={({ field }) => (
                            <Input
                              type="color"
                              autoComplete="off"
                              placeholder="Color"
                              {...field}
                              value={field.value ?? "#000000"}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex w-full flex-col">
                      <h5 className="mb-2 text-lg font-semibold">
                        Weekdays Available
                      </h5>
                      <FormFieldItem
                        control={control}
                        name="weekdays_available"
                        label={<FormLabel></FormLabel>}
                        invalid={Boolean(errors.weekdays_available)}
                        errorMessage={errors.weekdays_available?.message}
                        render={({ field }) => (
                          <div className="flex flex-wrap gap-2">
                            {WeekdayOptions.map((option) => {
                              const isSelected = field.value?.some(
                                (w) => w.day === option.value
                              )
                              return (
                                <Button
                                  key={option.value}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
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
                                >
                                  {option.label}
                                </Button>
                              )
                            })}
                          </div>
                        )}
                      />
                    </div>
                    <div className="flex w-full flex-col">
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="text-lg font-semibold">Class Photos</h5>
                      </div>
                      <FormFieldItem
                        control={control}
                        name="class_photos"
                        label={<FormLabel></FormLabel>}
                        invalid={Boolean(errors.class_photos)}
                        errorMessage={errors.class_photos?.message}
                        render={({ field }) => (
                          <div className="space-y-2">
                            {field.value?.map((photo, index) => (
                              <div
                                key={`photo-${index}-${photo}`}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  type="text"
                                  autoComplete="off"
                                  placeholder="Photo URL"
                                  value={photo}
                                  onChange={(e) => {
                                    const newPhotos = [...(field.value ?? [])]
                                    newPhotos[index] = e.target.value
                                    field.onChange(newPhotos)
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const newPhotos = [...(field.value ?? [])]
                                    newPhotos.splice(index, 1)
                                    field.onChange(newPhotos)
                                  }}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                field.onChange([...(field.value ?? []), ""])
                              }}
                            >
                              <Plus className="mr-2 size-4" />
                              Add Photo URL
                            </Button>
                          </div>
                        )}
                      />
                    </div>
                    <FormFieldItem
                      control={control}
                      name="enabled"
                      label={<FormLabel></FormLabel>}
                      invalid={Boolean(errors.enabled)}
                      errorMessage={errors.enabled?.message}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel className="font-normal">
                            {field.value ? "Enabled" : "Disabled"}
                          </FormLabel>
                        </div>
                      )}
                    />
                  </div>
                </ScrollArea>
              </div>
              <SheetFooter className="px-4 py-2">
                <div className="flex w-full items-center justify-between">
                  {type === "update" ? (
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : (
                    <div></div>
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
        title="Delete Class Package"
        description="Are you sure want to delete this Class Package?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FormClassPage
