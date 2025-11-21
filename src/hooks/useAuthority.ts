import { useMemo } from "react"

function useAuthority(
  userAuthority: string[] = [],
  authority: string[] = [],
  emptyCheck = false
) {
  const roleMatched = useMemo(() => {
    if (emptyCheck) {
      return authority.some((role) => userAuthority.includes(role))
    }
    return (
      authority.length === 0 ||
      authority.some((role) => userAuthority.includes(role))
    )
  }, [authority, userAuthority, emptyCheck])

  return roleMatched
}

export default useAuthority
