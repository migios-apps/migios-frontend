import type { NavigationTree } from "@/@types/navigation"
import {
  Blocks,
  LayoutDashboard,
  LayoutGrid,
  ListTodo,
  MessagesSquare,
  Package,
  Sparkles,
  Users,
} from "lucide-react"
import {
  NAV_ITEM_TYPE_ITEM,
  NAV_ITEM_TYPE_TITLE,
} from "@/constants/navigation.constant"
import { ADMIN, USER } from "@/constants/roles.constant"

const generalNavigationConfig: NavigationTree[] = [
  {
    path: "",
    title: "General",
    type: NAV_ITEM_TYPE_TITLE,
    authority: [ADMIN, USER],
    subMenu: [
      {
        path: "/dashboard",
        title: "Dashboard",
        icon: <LayoutDashboard />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
      {
        path: "/dashboard-2",
        title: "Dashboard 2",
        icon: <LayoutGrid />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
      {
        path: "/tasks",
        title: "Tasks",
        icon: <ListTodo />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
      {
        path: "/apps",
        title: "Apps",
        icon: <Package />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
      {
        path: "/chats",
        title: "Chats",
        icon: <MessagesSquare />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
      {
        path: "/users",
        title: "Users",
        icon: <Users />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
      {
        path: "/landing",
        title: "Landing",
        icon: <Sparkles />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
      {
        path: "/components",
        title: "Components",
        icon: <Blocks />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
    ],
  },
]

export default generalNavigationConfig
