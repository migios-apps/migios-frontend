import { Command } from "lucide-react"
import { type SidebarData } from "../types"

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Migios Admin",
      logo: Command,
      plan: "Vite + MigiosUI",
    },
  ],
  // navGroups akan di-generate oleh useSidebarData hook
  navGroups: [],
}
