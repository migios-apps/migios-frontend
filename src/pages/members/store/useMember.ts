import { MemberDetail } from "@/services/api/@types/member"
import { create } from "zustand"

interface MemberState {
  member: MemberDetail | null
  setMember: (member: MemberDetail | null) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  reset: () => void
}

export const useMember = create<MemberState>((set) => ({
  member: null,
  setMember: (member) => set({ member }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  error: null,
  setError: (error) => set({ error }),
  reset: () => set({ member: null, isLoading: false, error: null }),
}))
