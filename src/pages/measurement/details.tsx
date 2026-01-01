import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { MemberMeasurement } from "@/services/api/@types/measurement"
import { apiGetMemberMeasurement } from "@/services/api/MeasurementService"
import { ArrowLeft, FileText, LineChart, Pencil } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "@/components/ui/loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnalyticsTab from "./details/AnalyticsTab"

const SectionCard = ({
  title,
  children,
  contentClassName,
}: {
  title: string
  children: ReactNode
  contentClassName?: string
}) => (
  <Card className="shadow-none">
    <CardHeader className="pb-4">
      <CardTitle className="text-foreground text-base font-semibold">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className={cn("space-y-4", contentClassName)}>
      {children}
    </CardContent>
  </Card>
)

const MeasurementDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    data: measurement,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY.measurements, id],
    queryFn: async () => {
      const res = await apiGetMemberMeasurement(Number(id))
      return res.data as MemberMeasurement
    },
    enabled: !!id,
  })

  // Calculate date range for analytics (last 6 months by default)
  // const endDate = dayjs().format('YYYY-MM-DD')
  // const startDate = dayjs().subtract(6, 'months').format('YYYY-MM-DD')
  const startDate = "2024-01-01"
  const endDate = "2024-12-31"

  const resultOptions = {
    excellent: "Sangat Baik",
    good: "Baik",
    average: "Rata-rata",
    need_improvement: "Perlu Perbaikan",
    poor: "Buruk",
  }

  return (
    <Loading loading={isLoading}>
      {measurement && !error && (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => navigate("/measurement")}
              >
                <ArrowLeft className="size-4" />
                Kembali
              </Button>
              <h3 className="text-foreground text-xl font-semibold">
                Detail Pengukuran
              </h3>
            </div>
            <Button
              className="gap-2"
              onClick={() => navigate(`/measurement/edit/${id}`)}
            >
              <Pencil className="size-4" />
              Ubah
            </Button>
          </div>

          {/* Member & Trainer Info */}
          <Card className="shadow-none">
            <div className="flex flex-col gap-6 p-6 md:flex-row">
              <div className="flex flex-1 items-center gap-4">
                <Avatar className="border-background bg-muted size-16 border-4 shadow-sm">
                  <AvatarImage
                    src={measurement.member?.photo || ""}
                    alt={measurement.member?.name}
                  />
                  <AvatarFallback>
                    {measurement.member?.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-sm">Member</span>
                  <span className="text-foreground text-lg font-semibold">
                    {measurement.member?.name}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {measurement.member?.code}
                  </span>
                </div>
              </div>
              {measurement.trainer && (
                <div className="flex flex-1 items-center gap-4">
                  <Avatar className="border-background bg-muted size-16 border-4 shadow-sm">
                    <AvatarImage
                      src={measurement.trainer?.photo || ""}
                      alt={measurement.trainer?.name}
                    />
                    <AvatarFallback>
                      {measurement.trainer?.name?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Trainer
                    </span>
                    <span className="text-foreground text-lg font-semibold">
                      {measurement.trainer?.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {measurement.trainer?.code}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex flex-col justify-center">
                <span className="text-muted-foreground text-sm">
                  Tanggal Pengukuran
                </span>
                <span className="text-foreground text-lg font-semibold">
                  {dayjs(measurement.measured_at).format("DD MMMM YYYY HH:mm")}
                </span>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="detail" className="mt-2">
            <TabsList className="border-border overflow-x-auto rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="detail"
                className="data-[state=active]:border-primary data-[state=active]:text-primary flex min-w-[120px] items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium"
              >
                <FileText className="size-4" />
                Detail
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:border-primary data-[state=active]:text-primary flex min-w-[120px] items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium"
              >
                <LineChart className="size-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detail">
              <div className="mt-6 flex flex-col gap-6">
                <SectionCard
                  title="Informasi Dasar"
                  contentClassName="grid gap-4 md:grid-cols-3"
                >
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Tanggal Pengukuran
                    </span>
                    <span className="text-foreground font-semibold">
                      {dayjs(measurement.measured_at).format(
                        "DD MMMM YYYY HH:mm"
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Dibuat Pada
                    </span>
                    <span className="text-foreground font-semibold">
                      {dayjs(measurement.created_at).format(
                        "DD MMMM YYYY HH:mm"
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Diubah Pada
                    </span>
                    <span className="text-foreground font-semibold">
                      {dayjs(measurement.updated_at).format(
                        "DD MMMM YYYY HH:mm"
                      )}
                    </span>
                  </div>
                </SectionCard>

                {/* Body Composition Measurement */}
                <SectionCard
                  title="Pengukuran Komposisi Tubuh"
                  contentClassName="grid gap-4 md:grid-cols-3"
                >
                  {[
                    {
                      label: "Berat Badan",
                      value: measurement.weight_kg
                        ? `${measurement.weight_kg} Kg`
                        : "-",
                    },
                    {
                      label: "Persentase Lemak Tubuh",
                      value: measurement.body_fat_percent
                        ? `${measurement.body_fat_percent}%`
                        : "-",
                    },
                    {
                      label: "Massa Otot",
                      value: measurement.muscle_mass_kg
                        ? `${measurement.muscle_mass_kg} Kg`
                        : "-",
                    },
                    {
                      label: "BMI",
                      value: measurement.bmi ? measurement.bmi.toFixed(2) : "-",
                    },
                    {
                      label: "Massa Tubuh Tanpa Lemak (LBM)",
                      value: measurement.lean_body_mass_kg
                        ? `${measurement.lean_body_mass_kg} Kg`
                        : "-",
                    },
                    {
                      label: "Massa Tulang",
                      value: measurement.bone_mass_kg
                        ? `${measurement.bone_mass_kg} Kg`
                        : "-",
                    },
                    {
                      label: "Persentase Total Air Tubuh",
                      value: measurement.total_body_water_percent
                        ? `${measurement.total_body_water_percent}%`
                        : "-",
                    },
                    {
                      label: "Tingkat Lemak Visceral",
                      value: measurement.visceral_fat_level
                        ? measurement.visceral_fat_level
                        : "-",
                    },
                    {
                      label: "Usia Metabolik",
                      value: measurement.metabolic_age_years
                        ? `${measurement.metabolic_age_years} Tahun`
                        : "-",
                    },
                    {
                      label: "Kadar Protein",
                      value: measurement.protein_percent
                        ? `${measurement.protein_percent}%`
                        : "-",
                    },
                    {
                      label: "Usia Tubuh",
                      value: measurement.body_age_years
                        ? `${measurement.body_age_years} Tahun`
                        : "-",
                    },
                    {
                      label: "Rating Bentuk Tubuh",
                      value: measurement.physique_rating
                        ? `${measurement.physique_rating}/9`
                        : "-",
                    },
                    measurement.bmr_kcal
                      ? {
                          label: "BMR",
                          value: `${measurement.bmr_kcal} Kcal`,
                        }
                      : null,
                    measurement.tdee_kcal
                      ? {
                          label: "TDEE",
                          value: `${measurement.tdee_kcal} Kcal`,
                        }
                      : null,
                  ]
                    .filter(
                      (
                        item
                      ): item is {
                        label: string
                        value: string
                      } => Boolean(item)
                    )
                    .map((item) => (
                      <div key={item.label} className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                          {item.label}
                        </span>
                        <span className="text-foreground font-semibold">
                          {item.value}
                        </span>
                      </div>
                    ))}
                </SectionCard>

                {/* Body Size Measurement */}
                <SectionCard
                  title="Pengukuran Ukuran Tubuh"
                  contentClassName="grid gap-4 md:grid-cols-3"
                >
                  {[
                    {
                      label: "Lingkar Leher",
                      value: measurement.neck_cm
                        ? `${measurement.neck_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Lengan Kanan",
                      value: measurement.right_arm_cm
                        ? `${measurement.right_arm_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Lengan Kiri",
                      value: measurement.left_arm_cm
                        ? `${measurement.left_arm_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Lingkar Dada",
                      value: measurement.chest_cm
                        ? `${measurement.chest_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Lingkar Perut",
                      value: measurement.abdominal_cm
                        ? `${measurement.abdominal_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Lingkar Pinggul",
                      value: measurement.hip_cm
                        ? `${measurement.hip_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Paha Kanan",
                      value: measurement.right_thigh_cm
                        ? `${measurement.right_thigh_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Paha Kiri",
                      value: measurement.left_thigh_cm
                        ? `${measurement.left_thigh_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Betis Kanan",
                      value: measurement.right_calf_cm
                        ? `${measurement.right_calf_cm} Cm`
                        : "-",
                    },
                    {
                      label: "Betis Kiri",
                      value: measurement.left_calf_cm
                        ? `${measurement.left_calf_cm} Cm`
                        : "-",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col">
                      <span className="text-muted-foreground text-sm">
                        {item.label}
                      </span>
                      <span className="text-foreground font-semibold">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </SectionCard>

                {/* Delta Changes */}
                {(measurement.delta_weight_kg ||
                  measurement.delta_body_fat_percent ||
                  measurement.delta_abdominal_cm) && (
                  <SectionCard
                    title="Perubahan dari Pengukuran Sebelumnya"
                    contentClassName="grid gap-4 md:grid-cols-3"
                  >
                    {measurement.delta_weight_kg !== null &&
                      measurement.delta_weight_kg !== undefined && (
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-sm">
                            Perubahan Berat Badan
                          </span>
                          <span
                            className={cn(
                              "text-foreground font-semibold",
                              measurement.delta_weight_kg > 0
                                ? "text-destructive"
                                : measurement.delta_weight_kg < 0
                                  ? "text-green-500 dark:text-green-400"
                                  : ""
                            )}
                          >
                            {measurement.delta_weight_kg > 0 ? "+" : ""}
                            {measurement.delta_weight_kg} Kg
                          </span>
                        </div>
                      )}
                    {measurement.delta_body_fat_percent !== null &&
                      measurement.delta_body_fat_percent !== undefined && (
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-sm">
                            Perubahan Lemak Tubuh
                          </span>
                          <span
                            className={cn(
                              "text-foreground font-semibold",
                              measurement.delta_body_fat_percent > 0
                                ? "text-destructive"
                                : measurement.delta_body_fat_percent < 0
                                  ? "text-green-500 dark:text-green-400"
                                  : ""
                            )}
                          >
                            {measurement.delta_body_fat_percent > 0 ? "+" : ""}
                            {measurement.delta_body_fat_percent}%
                          </span>
                        </div>
                      )}
                    {measurement.delta_abdominal_cm !== null &&
                      measurement.delta_abdominal_cm !== undefined && (
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-sm">
                            Perubahan Lingkar Perut
                          </span>
                          <span
                            className={cn(
                              "text-foreground font-semibold",
                              measurement.delta_abdominal_cm > 0
                                ? "text-destructive"
                                : measurement.delta_abdominal_cm < 0
                                  ? "text-green-500 dark:text-green-400"
                                  : ""
                            )}
                          >
                            {measurement.delta_abdominal_cm > 0 ? "+" : ""}
                            {measurement.delta_abdominal_cm} Cm
                          </span>
                        </div>
                      )}
                  </SectionCard>
                )}

                {/* Photos */}
                {measurement.photos && measurement.photos.length > 0 && (
                  <SectionCard
                    title="Foto Pengukuran"
                    contentClassName="grid gap-4 md:grid-cols-2"
                  >
                    {measurement.photos.map((photo) => (
                      <div key={photo.id} className="flex flex-col gap-2">
                        <span className="text-muted-foreground text-sm capitalize">
                          {photo.view === "front"
                            ? "Tampak Depan"
                            : photo.view === "back"
                              ? "Tampak Belakang"
                              : photo.view === "left"
                                ? "Tampak Samping Kiri"
                                : "Tampak Samping Kanan"}
                        </span>
                        <img
                          src={photo.url}
                          alt={`${photo.view} view`}
                          className="border-border h-auto w-full rounded-lg border"
                        />
                      </div>
                    ))}
                  </SectionCard>
                )}

                {/* Result of Measurement */}
                <SectionCard title="Hasil Pengukuran">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Penilaian
                    </span>
                    <Badge
                      className={cn(
                        "mt-2 w-fit capitalize",
                        statusColor[measurement.result] || statusColor.active
                      )}
                    >
                      {measurement.result
                        ? resultOptions[
                            measurement.result as keyof typeof resultOptions
                          ] || measurement.result.replace("_", " ")
                        : "-"}
                    </Badge>
                  </div>
                  {measurement.notes && (
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-sm">
                        Catatan
                      </span>
                      <p className="text-foreground mt-2 whitespace-pre-wrap">
                        {measurement.notes}
                      </p>
                    </div>
                  )}
                </SectionCard>

                {/* Nutrition Target */}
                {(measurement.calorie_target_kcal ||
                  measurement.protein_target_grams ||
                  measurement.carb_target_grams ||
                  measurement.fat_target_grams ||
                  measurement.adherence_score ||
                  measurement.activity_factor) && (
                  <SectionCard
                    title="Target Nutrisi"
                    contentClassName="grid gap-4 md:grid-cols-3"
                  >
                    {measurement.calorie_target_kcal && (
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                          Target Kalori
                        </span>
                        <span className="text-foreground font-semibold">
                          {measurement.calorie_target_kcal} Kcal
                        </span>
                      </div>
                    )}
                    {measurement.protein_target_grams && (
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                          Target Protein
                        </span>
                        <span className="text-foreground font-semibold">
                          {measurement.protein_target_grams} g
                        </span>
                      </div>
                    )}
                    {measurement.carb_target_grams && (
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                          Target Karbohidrat
                        </span>
                        <span className="text-foreground font-semibold">
                          {measurement.carb_target_grams} g
                        </span>
                      </div>
                    )}
                    {measurement.fat_target_grams && (
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                          Target Lemak
                        </span>
                        <span className="text-foreground font-semibold">
                          {measurement.fat_target_grams} g
                        </span>
                      </div>
                    )}
                    {measurement.adherence_score && (
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                          Skor Kepatuhan
                        </span>
                        <span className="text-foreground font-semibold">
                          {measurement.adherence_score}/10
                        </span>
                      </div>
                    )}
                    {measurement.activity_factor && (
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">
                          Faktor Aktivitas
                        </span>
                        <span className="text-foreground font-semibold">
                          {measurement.activity_factor}
                        </span>
                      </div>
                    )}
                  </SectionCard>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="mt-6">
                <AnalyticsTab
                  memberId={measurement.member_id}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Loading>
  )
}

export default MeasurementDetail
