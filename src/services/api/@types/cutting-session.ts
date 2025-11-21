import { ApiTypes, MetaApi } from "./api"

export interface CuttingSessionLists {
  id: number
  club_id: number
  event_id: number | null
  member_id: number
  trainer_id: number
  package_id: number
  type: string
  status: string
  description: string
  notes: string
  photo: string | null
  due_date: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  approved_at: string
  approved_by: number | null
  member_package_id: number
  rejected_at: string | null
  rejected_by: number | null
  session_cut: number | null
  type_code: number | null
  status_code: number | null
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
  package: {
    id: number
    name: string
    session_duration: number
  }
  member_package: {
    id: number
    session_duration: number
    extra_session: number
  }
  approver: {
    id: number
    code: string
    name: string
    photo: string
  }
  rejector: {
    id: number
    code: string
    name: string
    photo: string
  }
  exercises: {
    id: number
    name: string
    sets: number
    reps: number
    weight_kg: number
    rpe: number
  }[]
}

export type CuttingSessionListsResponse = Omit<ApiTypes, "data"> & {
  data: { data: CuttingSessionLists[]; meta: MetaApi }
}

export interface CreateCuttingSession {
  club_id: number
  member_id: number
  member_package_id: number
  trainer_id: number
  type: string
  session_cut: number
  description?: string | null
  due_date: string
  start_date: string
  end_date: string
  exercises: {
    // optional: array latihan yang dilakukan dalam sesi ini
    name: string // required: nama latihan
    sets: number // optional: jumlah set (min: 1)
    reps: number // optional: repetisi per set (min: 1)
    weight_kg: number // optional: beban dalam kg (min: 0)
    rpe: number // optional: effort 1-10 (min: 1, max: 10)
  }[]
}

export interface ChangeStatusCuttingSession {
  id?: number
  status: number
  notes?: string | null
}
