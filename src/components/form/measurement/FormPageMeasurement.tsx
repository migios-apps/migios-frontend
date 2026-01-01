import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { MemberMeasurementPayload } from "@/services/api/@types/measurement"
import { MemberDetail } from "@/services/api/@types/member"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import {
  apiCreateMemberMeasurement,
  apiDeleteMemberMeasurement,
  apiUpdateMemberMeasurement,
} from "@/services/api/MeasurementService"
import { apiGetMemberList } from "@/services/api/MembeService"
import { ArrowLeft, Trash2, User } from "lucide-react"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BottomStickyBar from "@/components/ui/bottom-sticky-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateTimePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  type ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Textarea } from "@/components/ui/textarea"
import Upload from "@/components/ui/upload"
import {
  MeasurementFormSchema,
  ReturnMeasurementFormSchema,
  resetMeasurementForm,
} from "./validation"

type FormProps = {
  type: "create" | "update"
  formProps: ReturnMeasurementFormSchema
  onSuccess: () => void
}

const FormPageMeasurement: React.FC<FormProps> = ({
  type,
  formProps,
  onSuccess,
}) => {
  const queryClient = useQueryClient()
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = formProps
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [photoFiles, setPhotoFiles] = React.useState<{
    front?: File | null
    back?: File | null
    left?: File | null
    right?: File | null
  }>({})

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

  const handleClose = () => {
    resetMeasurementForm(formProps)
    onSuccess()
  }

  const handlePrefetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.measurements] })
    handleClose()
  }

  const create = useMutation({
    mutationFn: (data: MemberMeasurementPayload) =>
      apiCreateMemberMeasurement(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefetch,
  })

  const update = useMutation({
    mutationFn: (data: MemberMeasurementPayload) =>
      apiUpdateMemberMeasurement(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefetch,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteMemberMeasurement(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefetch,
  })

  const onSubmit: SubmitHandler<MeasurementFormSchema> = (data) => {
    const photos = []
    if (photoFiles.front) {
      photos.push({
        view: "front" as const,
        url: URL.createObjectURL(photoFiles.front),
      })
    }
    if (photoFiles.back) {
      photos.push({
        view: "back" as const,
        url: URL.createObjectURL(photoFiles.back),
      })
    }
    if (photoFiles.left) {
      photos.push({
        view: "left" as const,
        url: URL.createObjectURL(photoFiles.left),
      })
    }
    if (photoFiles.right) {
      photos.push({
        view: "right" as const,
        url: URL.createObjectURL(photoFiles.right),
      })
    }

    const payload: MemberMeasurementPayload = {
      member_id: data.member_id,
      trainer_id: data.trainer_id || undefined,
      measured_at: data.measured_at
        ? dayjs(data.measured_at).format("YYYY-MM-DD HH:mm")
        : undefined,
      weight_kg: data.weight_kg || undefined,
      body_fat_percent: data.body_fat_percent || undefined,
      muscle_mass_kg: data.muscle_mass_kg || undefined,
      bone_mass_kg: data.bone_mass_kg || undefined,
      total_body_water_percent: data.total_body_water_percent || undefined,
      visceral_fat_level: data.visceral_fat_level || undefined,
      metabolic_age_years: data.metabolic_age_years || undefined,
      protein_percent: data.protein_percent || undefined,
      body_age_years: data.body_age_years || undefined,
      physique_rating: data.physique_rating || undefined,
      neck_cm: data.neck_cm || undefined,
      right_arm_cm: data.right_arm_cm || undefined,
      left_arm_cm: data.left_arm_cm || undefined,
      chest_cm: data.chest_cm || undefined,
      abdominal_cm: data.abdominal_cm || undefined,
      hip_cm: data.hip_cm || undefined,
      right_thigh_cm: data.right_thigh_cm || undefined,
      left_thigh_cm: data.left_thigh_cm || undefined,
      right_calf_cm: data.right_calf_cm || undefined,
      left_calf_cm: data.left_calf_cm || undefined,
      result: data.result || undefined,
      notes: data.notes || undefined,
      calorie_target_kcal: data.calorie_target_kcal || undefined,
      adherence_score: data.adherence_score || undefined,
      activity_factor: data.activity_factor || undefined,
      photos: photos.length > 0 ? photos : undefined,
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
  }

  const resultOptions = [
    { label: "Sangat Baik", value: "excellent" },
    { label: "Baik", value: "good" },
    { label: "Rata-rata", value: "average" },
    { label: "Perlu Perbaikan", value: "need_improvement" },
    { label: "Buruk", value: "poor" },
  ]

  return (
    <>
      <Form {...formProps}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleClose}>
                <ArrowLeft className="mr-2 size-4" />
                Kembali
              </Button>
              <h3>
                {type === "create" ? "Buat Pengukuran" : "Ubah Pengukuran"}
              </h3>
            </div>
            {type === "update" && (
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Hapus
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormFieldItem
                    control={control}
                    name="member"
                    label={
                      <FormLabel>
                        Nama Member <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    description="Pilih member yang akan diukur dari daftar member aktif"
                    invalid={Boolean(errors.member_id)}
                    errorMessage={errors.member_id?.message}
                    render={({ field, fieldState }) => (
                      <SelectAsyncPaginate
                        isClearable
                        loadOptions={getMemberList as any}
                        additional={{ page: 1 }}
                        placeholder="Pilih Member"
                        value={field.value}
                        cacheUniqs={[watchData.member]}
                        getOptionLabel={(option) => option.name!}
                        getOptionValue={(option) => `${option.id}`}
                        debounceTimeout={500}
                        error={!!fieldState.error}
                        formatOptionLabel={({ name, photo }) => {
                          return (
                            <div className="flex items-center justify-start gap-2">
                              <Avatar className="size-8">
                                {photo ? (
                                  <AvatarImage src={photo || ""} alt={name} />
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
                        onChange={(option) => {
                          field.onChange(option)
                          setValue("member_id", option?.id || 0)
                        }}
                      />
                    )}
                  />

                  <div>
                    <FormLabel>Jenis Kelamin</FormLabel>
                    <Input
                      disabled
                      type="text"
                      value={
                        watchData.member?.gender === "m"
                          ? "Laki-laki"
                          : watchData.member?.gender === "f"
                            ? "Perempuan"
                            : ""
                      }
                    />
                  </div>

                  <FormFieldItem
                    control={control}
                    name="trainer"
                    label={
                      <FormLabel>
                        Nama Trainer <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    description="Pilih trainer yang melakukan pengukuran (dari login atau dropdown)"
                    invalid={Boolean(errors.trainer_id)}
                    errorMessage={errors.trainer_id?.message}
                    render={({ field, fieldState }) => (
                      <SelectAsyncPaginate
                        isClearable
                        loadOptions={getTrainerList as any}
                        additional={{ page: 1 }}
                        placeholder="Pilih Trainer"
                        value={field.value}
                        cacheUniqs={[watchData.trainer]}
                        getOptionLabel={(option) => option.name!}
                        getOptionValue={(option) => `${option.id}`}
                        debounceTimeout={500}
                        error={!!fieldState.error}
                        formatOptionLabel={({ name, photo }) => {
                          return (
                            <div className="flex items-center justify-start gap-2">
                              <Avatar className="size-8">
                                {photo ? (
                                  <AvatarImage src={photo || ""} alt={name} />
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
                        onChange={(option) => {
                          field.onChange(option)
                          setValue("trainer_id", option?.id || undefined)
                        }}
                      />
                    )}
                  />

                  <div>
                    <FormLabel>Usia</FormLabel>
                    <Input
                      disabled
                      type="text"
                      value={
                        watchData.member?.age
                          ? `${watchData.member.age} tahun`
                          : ""
                      }
                    />
                  </div>

                  <FormFieldItem
                    control={control}
                    name="measured_at"
                    label={
                      <FormLabel>
                        Tanggal Pengukuran{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    description='Tanggal dan waktu pengukuran dilakukan (boleh auto "sekarang", atau ganti jika input mundur)'
                    invalid={Boolean(errors.measured_at)}
                    errorMessage={errors.measured_at?.message}
                    render={({ field, fieldState }) => (
                      <DateTimePicker
                        value={
                          field.value ? dayjs(field.value).toDate() : undefined
                        }
                        onChange={(date) => {
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD HH:mm") : null
                          )
                        }}
                        use12HourFormat={false}
                        clearable
                        error={!!fieldState.error}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Body Composition Measurement */}
            <Card>
              <CardHeader>
                <CardTitle>Pengukuran Komposisi Tubuh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormFieldItem
                    control={control}
                    name="weight_kg"
                    label={<FormLabel>Berat Badan</FormLabel>}
                    description="WAJIB diisi. Salin langsung dari hasil timbangan (dalam Kg)"
                    invalid={Boolean(errors.weight_kg)}
                    errorMessage={errors.weight_kg?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Berat Badan (Kg)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="visceral_fat_level"
                    label={<FormLabel>Lemak Visceral</FormLabel>}
                    description="Salin dari hasil mesin body composition (InBody/Tanita) jika tersedia"
                    invalid={Boolean(errors.visceral_fat_level)}
                    errorMessage={errors.visceral_fat_level?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Tingkat Lemak Visceral"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="body_fat_percent"
                    label={<FormLabel>Persentase Lemak Tubuh</FormLabel>}
                    description="Salin dari hasil mesin body composition (dalam persentase)"
                    invalid={Boolean(errors.body_fat_percent)}
                    errorMessage={errors.body_fat_percent?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Lemak Tubuh (%)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="metabolic_age_years"
                    label={<FormLabel>Usia Metabolik</FormLabel>}
                    description="Salin dari hasil mesin body composition (dalam tahun)"
                    invalid={Boolean(errors.metabolic_age_years)}
                    errorMessage={errors.metabolic_age_years?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Usia Metabolik (Tahun)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="muscle_mass_kg"
                    label={<FormLabel>Massa Otot</FormLabel>}
                    description="Salin dari hasil mesin body composition (dalam Kg)"
                    invalid={Boolean(errors.muscle_mass_kg)}
                    errorMessage={errors.muscle_mass_kg?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Massa Otot (Kg)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <div>
                    <FormLabel>Massa Tubuh Tanpa Lemak (LBM)</FormLabel>
                    <p className="text-muted-foreground mt-1 mb-2 text-xs">
                      Dihitung otomatis oleh sistem dari berat badan dan lemak
                      tubuh
                    </p>
                    <Input disabled type="text" value="Otomatis Dihitung" />
                  </div>

                  <div>
                    <FormLabel>BMI</FormLabel>
                    <p className="text-muted-foreground mt-1 mb-2 text-xs">
                      Dihitung otomatis oleh sistem dari berat badan (kg) dan
                      tinggi badan (cm) member
                    </p>
                    <Input disabled type="text" value="Otomatis Dihitung" />
                  </div>

                  <FormFieldItem
                    control={control}
                    name="protein_percent"
                    label={<FormLabel>Kadar Protein</FormLabel>}
                    description="Salin dari hasil mesin body composition (dalam persentase)"
                    invalid={Boolean(errors.protein_percent)}
                    errorMessage={errors.protein_percent?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Protein (%)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="bone_mass_kg"
                    label={<FormLabel>Massa Tulang</FormLabel>}
                    description="Salin dari hasil mesin body composition (dalam Kg)"
                    invalid={Boolean(errors.bone_mass_kg)}
                    errorMessage={errors.bone_mass_kg?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Massa Tulang (Kg)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="body_age_years"
                    label={<FormLabel>Usia Tubuh</FormLabel>}
                    description="Salin dari hasil mesin body composition (dalam tahun)"
                    invalid={Boolean(errors.body_age_years)}
                    errorMessage={errors.body_age_years?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Usia Tubuh (Tahun)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="total_body_water_percent"
                    label={<FormLabel>Persentase Total Air Tubuh</FormLabel>}
                    description="Salin dari hasil mesin body composition (dalam persentase)"
                    invalid={Boolean(errors.total_body_water_percent)}
                    errorMessage={errors.total_body_water_percent?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Total Air Tubuh (%)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="physique_rating"
                    label={<FormLabel>Rating Bentuk Tubuh</FormLabel>}
                    description="Salin dari hasil mesin body composition (skala 1-9)"
                    invalid={Boolean(errors.physique_rating)}
                    errorMessage={errors.physique_rating?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Rating Bentuk Tubuh (1-9)"
                        min={1}
                        max={9}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Body Size Measurement */}
            <Card>
              <CardHeader>
                <CardTitle>Pengukuran Ukuran Tubuh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormFieldItem
                    control={control}
                    name="neck_cm"
                    label={<FormLabel>Lingkar Leher</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm)"
                    invalid={Boolean(errors.neck_cm)}
                    errorMessage={errors.neck_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Leher (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="hip_cm"
                    label={<FormLabel>Lingkar Pinggul</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm) - minimal diisi untuk tracking"
                    invalid={Boolean(errors.hip_cm)}
                    errorMessage={errors.hip_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Pinggul (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="right_arm_cm"
                    label={<FormLabel>Lingkar Lengan Kanan</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm)"
                    invalid={Boolean(errors.right_arm_cm)}
                    errorMessage={errors.right_arm_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Lengan Kanan (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="right_thigh_cm"
                    label={<FormLabel>Lingkar Paha Kanan</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm) - minimal diisi untuk tracking"
                    invalid={Boolean(errors.right_thigh_cm)}
                    errorMessage={errors.right_thigh_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Paha Kanan (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="left_arm_cm"
                    label={<FormLabel>Lingkar Lengan Kiri</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm)"
                    invalid={Boolean(errors.left_arm_cm)}
                    errorMessage={errors.left_arm_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Lengan Kiri (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="left_thigh_cm"
                    label={<FormLabel>Lingkar Paha Kiri</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm) - minimal diisi untuk tracking"
                    invalid={Boolean(errors.left_thigh_cm)}
                    errorMessage={errors.left_thigh_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Paha Kiri (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="chest_cm"
                    label={<FormLabel>Lingkar Dada</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm) - minimal diisi untuk tracking"
                    invalid={Boolean(errors.chest_cm)}
                    errorMessage={errors.chest_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Dada (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="right_calf_cm"
                    label={<FormLabel>Lingkar Betis Kanan</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm)"
                    invalid={Boolean(errors.right_calf_cm)}
                    errorMessage={errors.right_calf_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Betis Kanan (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="abdominal_cm"
                    label={<FormLabel>Lingkar Perut</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm) - minimal diisi untuk tracking"
                    invalid={Boolean(errors.abdominal_cm)}
                    errorMessage={errors.abdominal_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Perut (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="left_calf_cm"
                    label={<FormLabel>Lingkar Betis Kiri</FormLabel>}
                    description="Ukur dengan meteran (dalam Cm)"
                    invalid={Boolean(errors.left_calf_cm)}
                    errorMessage={errors.left_calf_cm?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Betis Kiri (Cm)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pict of Measurement */}
            <Card>
              <CardHeader>
                <CardTitle>Foto Pengukuran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <FormLabel>Tampak Samping Kanan</FormLabel>
                    <p className="text-muted-foreground mt-1 mb-2 text-xs">
                      Unggah foto pengukuran dari samping kanan
                    </p>
                    <Upload
                      showList={false}
                      uploadLimit={1}
                      onChange={(files: File[]) => {
                        if (files.length > 0) {
                          setPhotoFiles({ ...photoFiles, right: files[0] })
                        }
                      }}
                    >
                      <Button variant="default" type="button">
                        Unggah di sini
                      </Button>
                    </Upload>
                  </div>

                  <div>
                    <FormLabel>Tampak Samping Kiri</FormLabel>
                    <p className="text-muted-foreground mt-1 mb-2 text-xs">
                      Unggah foto pengukuran dari samping kiri
                    </p>
                    <Upload
                      showList={false}
                      uploadLimit={1}
                      onChange={(files: File[]) => {
                        if (files.length > 0) {
                          setPhotoFiles({ ...photoFiles, left: files[0] })
                        }
                      }}
                    >
                      <Button variant="default" type="button">
                        Unggah di sini
                      </Button>
                    </Upload>
                  </div>

                  <div>
                    <FormLabel>Tampak Depan</FormLabel>
                    <p className="text-muted-foreground mt-1 mb-2 text-xs">
                      Unggah foto pengukuran dari depan
                    </p>
                    <Upload
                      showList={false}
                      uploadLimit={1}
                      onChange={(files: File[]) => {
                        if (files.length > 0) {
                          setPhotoFiles({ ...photoFiles, front: files[0] })
                        }
                      }}
                    >
                      <Button variant="default" type="button">
                        Unggah di sini
                      </Button>
                    </Upload>
                  </div>

                  <div>
                    <FormLabel>Tampak Belakang</FormLabel>
                    <p className="text-muted-foreground mt-1 mb-2 text-xs">
                      Unggah foto pengukuran dari belakang
                    </p>
                    <Upload
                      showList={false}
                      uploadLimit={1}
                      onChange={(files: File[]) => {
                        if (files.length > 0) {
                          setPhotoFiles({ ...photoFiles, back: files[0] })
                        }
                      }}
                    >
                      <Button variant="default" type="button">
                        Unggah di sini
                      </Button>
                    </Upload>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Result of Measurement */}
            <Card>
              <CardHeader>
                <CardTitle>Hasil Pengukuran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground">
                    Berdasarkan hasil pengukuran, dapat disimpulkan bahwa hasil
                    latihan member dengan trainer adalah:
                  </p>
                </div>
                <FormFieldItem
                  control={control}
                  name="result"
                  label={<FormLabel>Penilaian</FormLabel>}
                  description="WAJIB diisi. Pilih penilaian hasil latihan member berdasarkan pengukuran"
                  invalid={Boolean(errors.result)}
                  errorMessage={errors.result?.message}
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      {resultOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <label
                            htmlFor={option.value}
                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />

                <FormFieldItem
                  control={control}
                  name="notes"
                  label={<FormLabel>Catatan</FormLabel>}
                  description='WAJIB diisi. Catatan bebas (misal: "kurang tidur", "baru sembuh sakit")'
                  invalid={Boolean(errors.notes)}
                  errorMessage={errors.notes?.message}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Catatan"
                      {...field}
                      value={field.value || ""}
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* Nutrition Target */}
            <Card>
              <CardHeader>
                <CardTitle>Target Nutrisi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormFieldItem
                    control={control}
                    name="calorie_target_kcal"
                    label={<FormLabel>Target Kalori</FormLabel>}
                    description="WAJIB jika main nutrisi. Contoh: Fat loss = berat (kg) × 25-30, Muscle gain = berat (kg) × 30-35 (dalam Kcal)"
                    invalid={Boolean(errors.calorie_target_kcal)}
                    errorMessage={errors.calorie_target_kcal?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Target Kalori (Kcal)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="adherence_score"
                    label={<FormLabel>Skor Kepatuhan</FormLabel>}
                    description='WAJIB jika main nutrisi. Penilaian kepatuhan periode sebelumnya (1-10): 8-10 = patuh, 5-7 = lumayan, 1-4 = sering "ngaco"'
                    invalid={Boolean(errors.adherence_score)}
                    errorMessage={errors.adherence_score?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Skor Kepatuhan (1-10)"
                        min={1}
                        max={10}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="activity_factor"
                    label={<FormLabel>Faktor Aktivitas</FormLabel>}
                    description="Opsional. Lebih baik dihitung otomatis oleh sistem dari history sesi latihan (1.2-1.8)"
                    invalid={Boolean(errors.activity_factor)}
                    errorMessage={errors.activity_factor?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Faktor Aktivitas (1.2-1.8)"
                        min={1.2}
                        max={1.8}
                        step={0.1}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          field.onChange(value)
                        }}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <BottomStickyBar className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleClose}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
              >
                {create.isPending || update.isPending
                  ? "Menyimpan..."
                  : type === "create"
                    ? "Buat"
                    : "Simpan"}
              </Button>
            </div>
          </BottomStickyBar>
        </form>
      </Form>

      <AlertConfirm
        open={confirmDelete}
        title="Hapus Pengukuran"
        description="Apakah Anda yakin ingin menghapus pengukuran ini?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FormPageMeasurement
