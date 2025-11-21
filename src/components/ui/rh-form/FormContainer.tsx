import { cn } from "@/lib/utils"
import { FormContextConsumer, FormContextProvider } from "./context"
import type { ControlSize, FormContextProps, FormLayout } from "./context"

export interface FormContainerProps {
  children?: React.ReactNode
  className?: string
  size?: ControlSize
  layout?: FormLayout
  labelWidth?: string | number
}

const FormContainer = (props: FormContainerProps) => {
  const {
    children,
    className,
    labelWidth = 100,
    layout = "vertical",
    size = "md",
  } = props

  const contextValue = {
    labelWidth,
    layout,
    size,
  }

  return (
    <FormContextProvider value={contextValue as FormContextProps}>
      <FormContextConsumer>
        {(context) => {
          const containerClass = cn(
            context?.layout === "inline" && "items-center md:flex",
            className
          )
          return <div className={containerClass}>{children}</div>
        }}
      </FormContextConsumer>
    </FormContextProvider>
  )
}

FormContainer.displayName = "FormContainer"

export default FormContainer
