import { ApiTypes } from "../Auth2"
import { MetaApi } from "./api"

export interface MemberMeasurement {
  id: number
  member_id: number
  trainer_id: number
  measured_at: string
  weight_kg: number
  body_fat_percent: number
  muscle_mass_kg: number
  bmi?: number | null
  bone_mass_kg: number
  total_body_water_percent: number
  visceral_fat_level: number
  metabolic_age_years: number
  lean_body_mass_kg: number
  protein_percent: number
  body_age_years: number
  physique_rating: number
  neck_cm: number
  right_arm_cm: number
  left_arm_cm: number
  chest_cm: number
  abdominal_cm: number
  hip_cm: number
  right_thigh_cm: number
  left_thigh_cm: number
  right_calf_cm: number
  left_calf_cm: number
  result: string
  notes: string
  calorie_target_kcal: number
  protein_target_grams: number
  carb_target_grams: number
  fat_target_grams: number
  adherence_score: number
  created_at: string
  updated_at: string
  activity_factor: number
  bmr_kcal?: number | null
  delta_abdominal_cm?: number | null
  delta_body_fat_percent?: number | null
  delta_weight_kg?: number | null
  tdee_kcal?: number | null
  member: {
    id: number
    code: string
    name: string
    photo: string
  }
  trainer: {
    id: number
    code: string
    name: string
    photo: string
  }
  photos: {
    id: number
    measurement_id: number
    view: string
    url: string
    created_at: string
  }[]
}

export type MemberMeasurementResponse = Omit<ApiTypes, "data"> & {
  data: { data: MemberMeasurement[]; meta: MetaApi }
}

export interface MemberMeasurementPayload {
  // ========== WAJIB ==========
  member_id: number // WAJIB: ID member yang diukur

  // ========== OPTIONAL: Basic Info ==========
  trainer_id?: number // optional: ID trainer yang melakukan pengukuran
  measured_at?: string // optional: tanggal pengukuran (default: now())

  // ========== OPTIONAL: Body Composition ==========
  // Semua field di bawah ini optional, bisa diisi sebagian atau semua
  weight_kg?: number // optional: berat badan (kg) - jika ada + height_cm member tersedia, BMI & BMR akan auto-calculate
  body_fat_percent?: number // optional: persentase lemak tubuh (%) - jika ada + weight_kg, LBM akan auto-calculate
  muscle_mass_kg?: number // optional: massa otot total (kg)
  // JANGAN ISI FIELD DI BAWAH INI - AKAN AUTO-CALCULATE:
  // bmi?: number;                // ❌ TIDAK PERLU DIISI - auto-calculate dari weight_kg + height_cm member
  // lean_body_mass_kg?: number;  // ❌ TIDAK PERLU DIISI - auto-calculate dari weight_kg × (1 - body_fat_percent/100)
  // bmr_kcal?: number;           // ❌ TIDAK PERLU DIISI - auto-calculate dari weight_kg + height_cm + age + gender member
  // tdee_kcal?: number;          // ❌ TIDAK PERLU DIISI - auto-calculate dari BMR × activity_factor
  // delta_weight_kg?: number;    // ❌ TIDAK PERLU DIISI - auto-calculate dari measurement sebelumnya
  // delta_body_fat_percent?: number; // ❌ TIDAK PERLU DIISI - auto-calculate dari measurement sebelumnya
  // delta_abdominal_cm?: number; // ❌ TIDAK PERLU DIISI - auto-calculate dari measurement sebelumnya
  bone_mass_kg?: number // optional: massa tulang (kg)
  total_body_water_percent?: number // optional: kadar air tubuh (%)
  visceral_fat_level?: number // optional: tingkat lemak visceral (0-59)
  metabolic_age_years?: number // optional: usia metabolik tubuh (tahun)
  protein_percent?: number // optional: kadar protein tubuh (%)
  body_age_years?: number // optional: perkiraan usia tubuh secara biologis
  physique_rating?: number // optional: rating bentuk tubuh (1-9)

  // ========== OPTIONAL: Body Size Measurement ==========
  // Semua field di bawah ini optional, bisa diisi sebagian atau semua
  neck_cm?: number // optional: lingkar leher (cm)
  right_arm_cm?: number // optional: lingkar lengan kanan (cm)
  left_arm_cm?: number // optional: lingkar lengan kiri (cm)
  chest_cm?: number // optional: lingkar dada (cm)
  abdominal_cm?: number // optional: lingkar perut (cm)
  hip_cm?: number // optional: lingkar pinggul (cm)
  right_thigh_cm?: number // optional: lingkar paha kanan (cm)
  left_thigh_cm?: number // optional: lingkar paha kiri (cm)
  right_calf_cm?: number // optional: lingkar betis kanan (cm)
  left_calf_cm?: number // optional: lingkar betis kiri (cm)

  // ========== OPTIONAL: Result & Notes ==========
  result?: "excellent" | "good" | "average" | "need_improvement" | "poor" // optional: hasil penilaian trainer (excellent, good, average, need_improvement, poor)
  notes?: string // optional: catatan trainer

  // ========== OPTIONAL: Nutrition Target ==========
  calorie_target_kcal?: number // optional: target kalori harian (kcal) - jika ada, macro targets akan auto-calculate
  // JANGAN ISI FIELD DI BAWAH INI JIKA calorie_target_kcal SUDAH DIISI - AKAN AUTO-CALCULATE:
  // protein_target_grams?: number; // ❌ TIDAK PERLU DIISI jika calorie_target_kcal ada - auto-calc (25% dari kalori)
  // carb_target_grams?: number;    // ❌ TIDAK PERLU DIISI jika calorie_target_kcal ada - auto-calc (45% dari kalori)
  // fat_target_grams?: number;     // ❌ TIDAK PERLU DIISI jika calorie_target_kcal ada - auto-calc (30% dari kalori)
  adherence_score?: number // optional: skor kepatuhan diet (1-10)
  activity_factor?: number // optional: faktor aktivitas (1.2-1.8) untuk menghitung TDEE (1.2=sedentary, 1.8=very active)

  // ========== OPTIONAL: Photos ==========
  photos?: {
    view: "front" | "back" | "left" | "right" // enum: front, back, left, right
    url: string // URL foto (upload dulu ke endpoint upload)
  }[] // optional: array foto progres

  // ========== CATATAN PENTING ==========
  // 1. Semua field optional kecuali member_id
  // 2. Bisa partial create: hanya isi Body Composition, atau hanya Body Size, atau hanya Photos
  // 3. FIELD AUTO-CALCULATE (JANGAN DIISI MANUAL):
  //    ✅ BMI: auto dari weight_kg + height_cm member
  //    ✅ Lean Body Mass: auto dari weight_kg + body_fat_percent
  //    ✅ BMR: auto dari weight_kg + height_cm + age + gender member (formula Mifflin-St Jeor)
  //    ✅ TDEE: auto dari BMR × activity_factor (jika activity_factor diisi)
  //    ✅ Macro Targets: auto dari calorie_target_kcal (ratio: 25% protein, 45% carb, 30% fat)
  //    ✅ Delta Fields: auto dari measurement sebelumnya (delta_weight_kg, delta_body_fat_percent, delta_abdominal_cm)
  // 4. Contoh penggunaan minimal:
  //    - Create hanya Body Composition: kirim member_id + weight_kg + body_fat_percent
  //    - Create hanya Body Size: kirim member_id + chest_cm + abdominal_cm
  //    - Create hanya Photos: kirim member_id + photos array
}

// ========== ANALYTICS TYPES ==========

export interface GetMeasurementAnalyticParams {
  member_id: number
  start_date?: string
  end_date?: string
}

export interface WeightTrendData {
  date: string
  weight: number | null
}

export interface WeightTrendSummary {
  first_weight: number | null
  last_weight: number | null
  change: number
  change_percent: number
  total_measurements: number
}

export interface WeightTrendResponse {
  data: WeightTrendData[]
  summary: WeightTrendSummary
}

export interface BodyCompositionData {
  date: string
  body_fat_percent: number | null
  muscle_mass_kg: number | null
  bone_mass_kg: number | null
  total_body_water_percent: number | null
  visceral_fat_level: number | null
  lean_body_mass_kg: number | null
  protein_percent: number | null
}

export interface BodyCompositionSummary {
  body_fat: {
    first: number | null
    last: number | null
    change: number | null
  }
  muscle_mass: {
    first: number | null
    last: number | null
    change: number | null
  }
  lean_body_mass: {
    first: number | null
    last: number | null
    change: number | null
  }
}

export interface BodyCompositionResponse {
  data: BodyCompositionData[]
  summary: BodyCompositionSummary
}

export interface BodySizeData {
  date: string
  neck: number | null
  right_arm: number | null
  left_arm: number | null
  chest: number | null
  abdominal: number | null
  hip: number | null
  right_thigh: number | null
  left_thigh: number | null
  right_calf: number | null
  left_calf: number | null
}

export interface BodySizeSummary {
  chest: {
    first: number | null
    last: number | null
    change: number | null
  }
  abdominal: {
    first: number | null
    last: number | null
    change: number | null
  }
  hip: {
    first: number | null
    last: number | null
    change: number | null
  }
  right_arm: {
    first: number | null
    last: number | null
    change: number | null
  }
  left_arm: {
    first: number | null
    last: number | null
    change: number | null
  }
}

export interface BodySizeResponse {
  data: BodySizeData[]
  summary: BodySizeSummary
}

export interface BMITrendData {
  date: string
  bmi: number | null
  weight: number | null
}

export interface BMITrendSummary {
  first_bmi: number | null
  last_bmi: number | null
  first_category: string | null
  last_category: string | null
  change: number | null
}

export interface BMITrendResponse {
  data: BMITrendData[]
  summary: BMITrendSummary
}

export interface ResultTrendData {
  date: string
  result: string | null
  notes: string | null
}

export interface ResultTrendSummary {
  first_result: string | null
  last_result: string | null
  result_counts: Record<string, number>
  total_measurements: number
}

export interface ResultTrendResponse {
  data: ResultTrendData[]
  summary: ResultTrendSummary
}

export interface NutritionProgressLatest {
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  adherence_score: number | null
}

export interface NutritionProgressHistory {
  date: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  adherence_score: number | null
}

export interface NutritionProgressResponse {
  latest_targets: NutritionProgressLatest | null
  history: NutritionProgressHistory[]
}

export interface OverallProgressSummary {
  total_measurements: number
  first_measurement_date: string
  last_measurement_date: string
  weight: {
    first: number | null
    last: number | null
    change: number
  }
  bmi: {
    first: number | null
    last: number | null
    change: number | null
  }
  body_fat: {
    first: number | null
    last: number | null
    change: number | null
  }
  muscle_mass: {
    first: number | null
    last: number | null
    change: number | null
  }
  result: {
    first: string | null
    last: string | null
  }
}

export interface OverallProgressResponse {
  summary: OverallProgressSummary | null
  message?: string
}

export type FatLossStatus = "GOOD" | "SLOW" | "TOO_FAST" | "REVERSE" | "UNKNOWN"
export type TrainingStatus = "HIGH" | "OK" | "LOW" | "NONE"
export type AdherenceStatus = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"

export interface RecommendationMeta {
  period_weeks: number
  weight_change: number
  body_fat_change: number
  abdominal_change: number
  weight_per_week: number
  workout_count: number
  workout_per_week: number
  avg_adherence: number
  avg_calorie: number
  status: {
    progress_fat_loss: FatLossStatus
    training: TrainingStatus
    adherence: AdherenceStatus
  }
}

export interface RecommendationResponse {
  summary: string
  body_composition: string
  training: string
  nutrition: string
  next_4_weeks_plan: string
  meta: RecommendationMeta
  message?: string
  data?: null
}
