import type { PropsWithChildren } from "react"
import { Navigate } from "react-router"
import useAuthority from "@/hooks/useAuthority"

type AuthorityGuardProps = PropsWithChildren<{
  userAuthority?: string[]
  authority?: string[]
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
  const { userAuthority = [], authority = [], children } = props

  const roleMatched = useAuthority(userAuthority, authority)

  return <>{roleMatched ? children : <Navigate to="/403" />}</>
}

export default AuthorityGuard
