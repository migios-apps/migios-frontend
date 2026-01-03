import { ApplySearchCondition } from "@/services/api/@types/api"

export function applyArraySearch<T>(
  data: T[],
  searching?: ApplySearchCondition,
  customQueryAttr?: any
): T[] {
  if (!searching || (!searching.search_column && !searching.search)) {
    return data
  }

  const searchConditions: any[] = []
  const { search_column, search_text, search_condition, search } = searching

  if (search_column && search_text !== undefined) {
    searchConditions.push({
      column: customQueryAttr?.[search_column] || search_column,
      text: search_text,
      condition: search_condition || "=",
      operator: "and",
    })
  }

  if (search && Array.isArray(search)) {
    search.forEach((s) => {
      if (s.search_column && s.search_text !== undefined) {
        searchConditions.push({
          column: customQueryAttr?.[s.search_column] || s.search_column,
          text: s.search_text,
          condition: s.search_condition || "=",
          operator: s.search_operator || "and",
        })
      }
    })
  }

  if (searchConditions.length === 0) return data

  return data.filter((item) => {
    const andResults: boolean[] = []
    const orResults: boolean[] = []

    searchConditions.forEach((cond) => {
      let searchText: any = cond.text

      // Convert string representations to actual values
      const textStr = String(searchText).toLowerCase()
      if (textStr === "null") searchText = null
      else if (textStr === "true") searchText = true
      else if (textStr === "false") searchText = false

      const value = getObjectValue(item, cond.column)
      const isMatch = compareValue(value, searchText, cond.condition)

      if (cond.operator === "or") {
        orResults.push(isMatch)
      } else {
        andResults.push(isMatch)
      }
    })

    const andPassed = andResults.length > 0 ? andResults.every((r) => r) : true
    const orPassed = orResults.length > 0 ? orResults.some((r) => r) : false

    if (andResults.length > 0 && orResults.length > 0) {
      return andPassed || orPassed
    }
    if (andResults.length > 0) return andPassed
    if (orResults.length > 0) return orPassed
    return true
  })
}

function getObjectValue(obj: any, path: string) {
  if (!path) return undefined

  // Jika nama kolom mengandung titik (misal: 'events.id'),
  // kita coba ambil 'id' nya saja jika 'events.id' tidak ada langsung di objek.
  if (path.includes(".") && obj[path] === undefined) {
    const key = path.split(".").pop()
    if (key) return obj[key]
  }

  return obj[path]
}

function compareValue(val: any, target: any, condition: string): boolean {
  if (target === null || target === undefined) {
    const isNullish = val === null || val === undefined
    switch (condition.toLowerCase()) {
      case "=":
      case "is":
        return isNullish
      case "!=":
      case "is not":
        return !isNullish
      default:
        return false
    }
  }

  const v = String(val).toLowerCase()
  const t = String(target).toLowerCase()

  switch (condition.toLowerCase()) {
    case "like":
      return v.includes(t)
    case "=":
    case "is":
      return val == target
    case "is not":
    case "!=":
      return val != target
    case "not like":
      return !v.includes(t)
    case ">=":
      return val >= target
    case "<=":
      return val <= target
    case ">":
      return val > target
    case "<":
      return val < target
    default:
      return false
  }
}
