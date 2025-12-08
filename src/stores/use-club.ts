import { create } from "zustand"

interface ClubState {
  welcome: boolean
  setWelcome: (value: boolean) => void
  newBranchClub: boolean
  setNewBranchClub: (value: boolean) => void
}

export const useClubStore = create<ClubState>((set) => ({
  welcome: false,
  setWelcome: (value) => set({ welcome: value }),
  newBranchClub: false,
  setNewBranchClub: (value) => set({ newBranchClub: value }),
}))
