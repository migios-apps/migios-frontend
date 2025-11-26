import { UserCog, Wrench } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "./sidebar-nav"

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/account/profile",
    icon: <UserCog size={18} />,
  },
  {
    title: "Account",
    href: "/account/account",
    icon: <Wrench size={18} />,
  },
]

const LayoutAccount = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-4 lg:my-6" />
      <div className="flex flex-1 flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="lg:sticky lg:top-14 lg:h-fit lg:w-1/5 lg:self-start">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <main className="flex-1 lg:w-4/5">{children}</main>
      </div>
    </div>
  )
}

export default LayoutAccount
