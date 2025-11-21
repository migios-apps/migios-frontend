import type { NavigationTree } from "@/@types/navigation"
import {
  Bell,
  HelpCircle,
  Monitor,
  Palette,
  Settings,
  UserCog,
  Wrench,
} from "lucide-react"
import {
  NAV_ITEM_TYPE_COLLAPSE,
  NAV_ITEM_TYPE_ITEM,
  NAV_ITEM_TYPE_TITLE,
} from "@/constants/navigation.constant"
import { ADMIN, USER } from "@/constants/roles.constant"

const othersNavigationConfig: NavigationTree[] = [
  {
    path: "",
    title: "Other",
    type: NAV_ITEM_TYPE_TITLE,
    authority: [ADMIN, USER],
    subMenu: [
      {
        path: "",
        title: "Settings",
        icon: <Settings />,
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [ADMIN, USER],
        subMenu: [
          {
            path: "/settings",
            title: "Profile",
            icon: <UserCog />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/settings/account",
            title: "Account",
            icon: <Wrench />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/settings/appearance",
            title: "Appearance",
            icon: <Palette />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/settings/notifications",
            title: "Notifications",
            icon: <Bell />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/settings/display",
            title: "Display",
            icon: <Monitor />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
        ],
      },
      {
        path: "/help-center",
        title: "Help Center",
        icon: <HelpCircle />,
        type: NAV_ITEM_TYPE_ITEM,
        authority: [ADMIN, USER],
        subMenu: [],
      },
    ],
  },
]

export default othersNavigationConfig
