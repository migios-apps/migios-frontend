/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react"
import { FieldValues, SetFieldValue } from "react-hook-form"

interface FormPersistOptions<T extends FieldValues = any> {
  storage?: Storage
  exclude?: (keyof T)[]
  include?: keyof T | (keyof T)[]
  validate?: boolean
  dirty?: boolean
  timeout?: number | null
  restore?: (data: Partial<T>) => void
  watch: (names?: keyof T | (keyof T)[]) => T
  setValue: SetFieldValue<T>
  onTimeout?: () => void
  defaultValue?: Partial<T>
}

const useFormPersist = <T extends FieldValues>(
  name: string,
  {
    storage,
    exclude = [],
    include,
    validate = false,
    dirty = false,
    timeout = null,
    restore,
    watch,
    setValue,
    onTimeout,
    defaultValue,
  }: FormPersistOptions<T>
) => {
  const values = watch()
  const getStorage = (): Storage => storage || window.sessionStorage
  const clearStorage = (): void => {
    getStorage().removeItem(name)
  }

  // Filter data berdasarkan include/exclude
  const filterData = (data: Record<string, any>): Partial<T> => {
    const filtered: Record<string, any> = {}

    Object.keys(data).forEach((key) => {
      // Skip timestamp
      if (key === "_timestamp") return

      // Jika ada include, hanya ambil field yang di-include
      if (include) {
        const includeArray = Array.isArray(include) ? include : [include]
        if (includeArray.includes(key)) {
          filtered[key] = data[key]
        }
        return
      }

      // Jika tidak ada include, ambil semua kecuali yang di-exclude
      if (!exclude.includes(key)) {
        filtered[key] = data[key]
      }
    })

    return filtered as Partial<T>
  }

  useEffect(() => {
    const str = getStorage().getItem(name)
    if (!str && defaultValue) {
      const filteredDefault = filterData(defaultValue)
      if (restore) {
        restore(filteredDefault)
      }
      getStorage().setItem(
        name,
        JSON.stringify({ ...filteredDefault, _timestamp: Date.now() })
      )
      return
    }

    if (str) {
      const { _timestamp = null, ...values } = JSON.parse(str) as {
        _timestamp?: number
        [key: string]: any
      }
      const currTimestamp = Date.now()

      if (timeout && currTimestamp - _timestamp! > timeout) {
        onTimeout?.()
        clearStorage()
        return
      }

      const filteredData = filterData(values)

      // Merge defaultValue dengan data dari localStorage
      const mergedData = { ...defaultValue, ...filteredData }

      Object.keys(mergedData).forEach((key) => {
        setValue(key, mergedData[key], {
          shouldValidate: validate,
          shouldDirty: dirty,
        })
      })

      if (restore) {
        restore(filteredData)
      }
    }
  }, [name])

  useEffect(() => {
    if (values && Object.keys(values).length > 0) {
      const filteredValues = filterData(values)
      // Pastikan ada data yang akan disimpan selain timestamp
      if (Object.keys(filteredValues).length > 0) {
        const _timestamp = Date.now()
        const dataToSave = { ...filteredValues, _timestamp }
        getStorage().setItem(name, JSON.stringify(dataToSave))
      } else {
        console.log("useFormPersist - no data to save after filtering")
      }
    }
  }, [values])

  return {
    clear: (): void => getStorage().removeItem(name),
  }
}

export default useFormPersist
