export const PackageType = {
  MEMBERSHIP: "membership",
  PT_PROGRAM: "pt_program",
  CLASS: "class",
  SERVICE: "service",
}

export const categoryPackage = [
  { value: "membership", label: "Membership" },
  { value: "pt_program", label: "PT Program" },
  { value: "class", label: "Class" },
]

export const gradientPackages = {
  membership:
    "from-cyan-700 to-blue-900 text-white dark:from-cyan-700/40 dark:to-blue-900/40 dark:text-gray-100",
  pt_program:
    "from-gray-500 to-emerald-950 text-white dark:from-gray-500/40 dark:to-emerald-950/40 dark:text-gray-100",
  class:
    "from-amber-700 to-orange-900 text-white dark:from-amber-700/40 dark:to-orange-900/40 dark:text-gray-100",
}

export const textColorPackages = {
  membership: "text-cyan-500",
  pt_program: "text-gray-500",
  class: "text-amber-500",
}
