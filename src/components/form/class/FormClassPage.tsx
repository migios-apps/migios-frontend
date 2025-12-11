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
import { Trash2, User } from "lucide-react"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import FormClassEvent from "./FormClassEvent"
import {
  ClassPageFormSchema,
  LevelClassOptions,
  ReturnClassPageFormSchema,
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
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [eventModal, setEventModal] = React.useState(false)

  // console.log("watchData", watchData)
  // console.log("errors", JSON.stringify(errors))

  const {
    data: instructors,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY.trainers, watchData.id],
    queryFn: () => apiGetAllInstructorByClass(watchData.id as number),
    select: (res) => res.data,
    enabled: !!watchData.id,
  })

  React.useEffect(() => {
    if (type === "update" && !error) {
      formProps.setValue("instructors", instructors)
    }
  }, [error, formProps, instructors, type, watchData.allow_all_instructor])

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

  const handleClose = () => {
    formProps.reset({})
    onClose()
  }

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
      apiUpdateClass(watchData.id as number, data),
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
    if (type === "update") {
      update.mutate({
        club_id: club?.id as number,
        photo: data.photo,
        burn_calories: data.burn_calories,
        name: data.name,
        enabled: data.enabled,
        allow_all_instructor: data.allow_all_instructor,
        phone: data.phone,
        capacity: data.capacity,
        level: data.level,
        category_id: data?.category?.id || null,
        description: data.description,
        instructors: data.allow_all_instructor
          ? []
          : (data.instructors as CreateClassPage["instructors"]),
        events: data.events.map((event) => ({
          ...event,
          start: dayjs(event.start).format("YYYY-MM-DD HH:mm"),
          end: dayjs(event.end).format("YYYY-MM-DD HH:mm"),
        })) as CreateClassPage["events"],
      })
      return
    }
    if (type === "create") {
      create.mutate({
        club_id: club?.id as number,
        photo: data.photo,
        burn_calories: data.burn_calories,
        name: data.name,
        enabled: data.enabled,
        allow_all_instructor: data.allow_all_instructor,
        phone: data.phone,
        capacity: data.capacity,
        level: data.level,
        category_id: data?.category?.id || null,
        description: data.description,
        instructors: data.allow_all_instructor
          ? []
          : (data.instructors as CreateClassPage["instructors"]),
        events: data.events.map((event) => ({
          ...event,
          start: dayjs(event.start).format("YYYY-MM-DD HH:mm"),
          end: dayjs(event.end).format("YYYY-MM-DD HH:mm"),
        })) as CreateClassPage["events"],
      })
      return
    }
  }

  const handleDelete = () => {
    deleteItem.mutate(watchData.id as number)
    setConfirmDelete(false)
    handleClose()
  }

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
                      <div className="flex items-center justify-between">
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
                      </div>
                      <FormFieldItem
                        control={control}
                        name="instructors"
                        invalid={Boolean(errors.instructors)}
                        errorMessage={errors.instructors?.message}
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
                            cacheUniqs={[watchData.instructors]}
                            isOptionDisabled={() =>
                              ((watchData.instructors as any[]) ?? []).length >=
                              5
                            }
                            getOptionLabel={(option) => option.name!}
                            getOptionValue={(option) => option.code.toString()}
                            debounceTimeout={500}
                            isDisabled={watchData.allow_all_instructor}
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
                          cacheUniqs={[watchData.category]}
                          error={!!fieldState.error}
                          getOptionLabel={(option) => option.name!}
                          getOptionValue={(option) => option.id.toString()}
                          debounceTimeout={500}
                          onChange={(option) => field.onChange(option)}
                        />
                      )}
                    />
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      <FormFieldItem
                        control={control}
                        name="phone"
                        label={
                          <FormLabel>
                            Phone Number{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                        }
                        invalid={Boolean(errors.phone)}
                        errorMessage={errors.phone?.message}
                        render={({ field }) => (
                          <Input
                            type="string"
                            autoComplete="off"
                            placeholder="Phone Number"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value
                              // Hanya izinkan angka dan satu karakter +
                              const formattedValue = value
                                .replace(/[^\d+]/g, "") // Hapus semua karakter kecuali angka dan +
                                .replace(/\+/g, (_match, offset, string) =>
                                  string.indexOf("+") === offset ? "+" : ""
                                ) // Pastikan hanya ada satu tanda +
                              field.onChange(formattedValue)
                            }}
                          />
                        )}
                      />
                      <div className="w-full">
                        <FormFieldItem
                          control={control}
                          name="burn_calories"
                          label={
                            <FormLabel>
                              Calorie Burn{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(errors.burn_calories)}
                          errorMessage={errors.burn_calories?.message}
                          render={({ field }) => (
                            <Input
                              type="number"
                              autoComplete="off"
                              placeholder="Calorie Burn"
                              {...field}
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
                          label={
                            <FormLabel>
                              Level <span className="text-destructive">*</span>
                            </FormLabel>
                          }
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
                                field.onChange(option?.value)
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
                    <div className="flex w-full flex-col">
                      <h5 className="mb-2 text-lg font-semibold">
                        Events Schedule
                      </h5>
                      {watchData.events?.map((item, index) => (
                        <div
                          key={index}
                          className="mb-4 flex flex-col rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex flex-col">
                            <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                              <div className="flex w-full items-center justify-between">
                                <span className="flex items-center gap-1 font-bold">
                                  Frequency
                                </span>
                                <span className="text-sm">:</span>
                              </div>
                              <div className="flex justify-start capitalize">
                                {item.frequency}
                              </div>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                              <div className="flex w-full items-center justify-between">
                                <span className="flex items-center gap-1 font-bold">
                                  Start End
                                </span>
                                <span className="text-sm">:</span>
                              </div>
                              <div className="flex justify-start">
                                {dayjs(item.start).format("DD MMMM YYYY")}{" "}
                                {item.end_type === "on" &&
                                  `- ${dayjs(item.end).format("DD MMMM YYYY")}`}
                              </div>
                            </div>

                            {item.frequency === "hourly" ||
                            item.frequency === "daily" ? (
                              <>
                                <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                                  <div className="flex w-full items-center justify-between">
                                    <span className="flex items-center gap-1 font-bold">
                                      Start Time
                                    </span>
                                    <span className="text-sm">:</span>
                                  </div>
                                  <div className="flex justify-start">
                                    {dayjs(item.start).format("HH:mm")}
                                  </div>
                                </div>

                                <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                                  <div className="flex w-full items-center justify-between">
                                    <span className="flex items-center gap-1 font-bold">
                                      End Time
                                    </span>
                                    <span className="text-sm">:</span>
                                  </div>
                                  <div className="flex justify-start">
                                    {dayjs(item.end).format("HH:mm")}
                                  </div>
                                </div>
                              </>
                            ) : null}

                            <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                              <div className="flex w-full items-center justify-between">
                                <span className="flex items-center gap-1 font-bold">
                                  Color
                                </span>
                                <span className="text-sm">:</span>
                              </div>
                              <div className="flex items-center justify-start gap-1">
                                <div
                                  className="h-4 w-4"
                                  style={{ background: `${item.color}` }}
                                ></div>
                                {item.color}
                              </div>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                              <div className="flex w-full items-center justify-between">
                                <span className="flex items-center gap-1 font-bold">
                                  Background Color
                                </span>
                                <span className="text-sm">:</span>
                              </div>
                              <div className="flex items-center justify-start gap-1">
                                <div
                                  className="h-4 w-4"
                                  style={{
                                    background: `${item.background_color}`,
                                  }}
                                ></div>
                                {item.background_color}
                              </div>
                            </div>

                            <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                              <div className="flex w-full items-center justify-between">
                                <span className="flex items-center gap-1 font-bold">
                                  End Type
                                </span>
                                <span className="text-sm">:</span>
                              </div>
                              <div className="flex justify-start">
                                {item.end_type}
                              </div>
                            </div>

                            {item.frequency === "monthly" ? (
                              <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                                <div className="flex w-full items-center justify-between">
                                  <span className="flex items-center gap-1 font-bold">
                                    Weeks
                                  </span>
                                  <span className="text-sm">:</span>
                                </div>
                                <div className="flex justify-start">
                                  <div className="flex flex-wrap gap-2">
                                    {item.week_number?.map((week) => (
                                      <span
                                        key={week}
                                        className="rounded-md border border-gray-200 px-1 capitalize"
                                      >
                                        {week === -1
                                          ? "Last Week"
                                          : `Week ${week}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : null}

                            {item.frequency === "yearly" ? (
                              <div className="grid grid-cols-[140px_1fr] items-start space-x-2">
                                <div className="flex w-full items-center justify-between">
                                  <span className="flex items-center gap-1 font-bold">
                                    Selected Months
                                  </span>
                                  <span className="text-sm">:</span>
                                </div>
                                <div className="flex justify-start">
                                  <div className="flex flex-wrap gap-2">
                                    {item.selected_months?.map((month) => (
                                      <span
                                        key={month}
                                        className="rounded-md border border-gray-200 px-1 capitalize"
                                      >
                                        {dayjs(new Date(0, month!)).format(
                                          "MMMM"
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : null}

                            {item.frequency === "weekly" ||
                            item.frequency === "monthly" ||
                            item.frequency === "yearly" ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex w-[200px] items-center justify-between">
                                  <span className="flex items-center gap-1 font-bold">
                                    Weekdays
                                  </span>
                                  <span className="text-sm">:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {item.selected_weekdays?.map(
                                    (item, index) => (
                                      <div
                                        key={index}
                                        className="flex flex-col rounded-xl border border-gray-200 p-2"
                                      >
                                        <span className="font-semibold capitalize">
                                          {item.day_of_week}
                                        </span>
                                        <span className="text-xs">
                                          {item.start_time} - {item.end_time}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                      <FormFieldItem
                        control={control}
                        name="events"
                        label={<FormLabel></FormLabel>}
                        invalid={Boolean(errors.events)}
                        errorMessage={errors.events?.message}
                        render={() => (
                          <Button
                            variant="default"
                            type="button"
                            className="w-full"
                            onClick={() => setEventModal(true)}
                          >
                            {watchData.events?.length > 0
                              ? "Edit Schedule"
                              : "Add Schedule"}
                          </Button>
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

      <FormClassEvent
        open={eventModal}
        formProps={formProps}
        onClose={() => setEventModal(false)}
      />

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
