import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"
import type { ReportSectionDef } from "../types"

const PARAM_VIEW = "view"

export interface UseReportSectionReturn {
  slug: string
  section: ReportSectionDef
  setSlug: (slug: string) => void
}

const useReportSection = (
  sections: ReportSectionDef[]
): UseReportSectionReturn => {
  const [searchParams, setSearchParams] = useSearchParams()

  const slug = useMemo(() => {
    const requested = searchParams.get(PARAM_VIEW)
    const match = sections.find((item) => item.slug === requested)
    return match ? match.slug : sections[0].slug
  }, [searchParams, sections])

  const section = useMemo(
    () => sections.find((item) => item.slug === slug) ?? sections[0],
    [sections, slug]
  )

  const setSlug = useCallback(
    (next: string) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          params.set(PARAM_VIEW, next)
          return params
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return { slug, section, setSlug }
}

export default useReportSection
