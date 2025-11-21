import { create } from "zustand"

interface WelcomeState {
  welcome: boolean
  setWelcome: (value: boolean) => void
}

export const useWelcome = create<WelcomeState>((set) => ({
  welcome: false,
  setWelcome: (value) => set({ welcome: value }),
}))
