import { createContext, useContext } from "react"

export type FormLayout = "horizontal" | "vertical" | "inline"
export type ControlSize = "sm" | "md" | "lg"

export type FormContextProps = {
  size?: ControlSize
  layout?: FormLayout
  labelWidth?: string | number
}

const FormContext = createContext<FormContextProps | null>(null)

export const FormContextProvider = FormContext.Provider

export const FormContextConsumer = FormContext.Consumer

export function useForm() {
  return useContext(FormContext)
}

export type FormItemContextProps = {
  invalid?: boolean
}

const FormItemContext = createContext<FormItemContextProps | null>(null)

export const FormItemContextProvider = FormItemContext.Provider

export const FormItemContextConsumer = FormItemContext.Consumer

export function useFormItem() {
  return useContext(FormItemContext)
}

export default FormContext
