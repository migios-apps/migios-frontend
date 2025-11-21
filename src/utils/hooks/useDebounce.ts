import type { DebounceSettingsLeading } from "lodash"
import debounce from "lodash/debounce"

function useDebounce<T extends (...args: any) => any>(
  func: T,
  wait: number | undefined,
  options?: DebounceSettingsLeading
) {
  return debounce(func, wait, options)
}

export default useDebounce
