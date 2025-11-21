import type { NavigationTree } from "@/@types/navigation"
import {
  Bug,
  Construction,
  FileX,
  Lock,
  ServerOff,
  ShieldCheck,
  UserX,
} from "lucide-react"
import {
  NAV_ITEM_TYPE_COLLAPSE,
  NAV_ITEM_TYPE_ITEM,
  NAV_ITEM_TYPE_TITLE,
} from "@/constants/navigation.constant"
import { ADMIN, USER } from "@/constants/roles.constant"

const pagesNavigationConfig: NavigationTree[] = [
  {
    path: "",
    title: "Pages",
    type: NAV_ITEM_TYPE_TITLE,
    authority: [ADMIN, USER],
    subMenu: [
      {
        path: "",
        title: "Auth",
        icon: <ShieldCheck />,
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [ADMIN, USER],
        subMenu: [
          {
            path: "/sign-in",
            title: "Sign In",
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/sign-in-2",
            title: "Sign In (2 Col)",
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/sign-up",
            title: "Sign Up",
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/forgot-password",
            title: "Forgot Password",
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/otp",
            title: "OTP",
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
        ],
      },
      {
        path: "",
        title: "Errors",
        icon: <Bug />,
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [ADMIN, USER],
        subMenu: [
          {
            path: "/errors/unauthorized",
            title: "Unauthorized",
            icon: <Lock />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/errors/forbidden",
            title: "Forbidden",
            icon: <UserX />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/errors/not-found",
            title: "Not Found",
            icon: <FileX />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/errors/internal-server-error",
            title: "Internal Server Error",
            icon: <ServerOff />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
          {
            path: "/errors/maintenance-error",
            title: "Maintenance Error",
            icon: <Construction />,
            type: NAV_ITEM_TYPE_ITEM,
            authority: [ADMIN, USER],
            subMenu: [],
          },
        ],
      },
    ],
  },
]

export default pagesNavigationConfig
