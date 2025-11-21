import type { ReactNode, Ref } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ControlSize, FormLayout } from "./context"
import { FormItemContextProvider, useForm } from "./context"

const CONTROL_SIZES: Record<ControlSize, { h: string }> = {
  sm: { h: "h-8" },
  md: { h: "h-10" },
  lg: { h: "h-12" },
}

export interface FormItemProps {
  asterisk?: boolean
  children?: React.ReactNode
  className?: string
  errorMessage?: string
  extra?: string | ReactNode
  extraType?: "start" | "end"
  htmlFor?: string
  invalid?: boolean
  label?: string
  labelClass?: string
  labelWidth?: string | number
  layout?: FormLayout
  ref?: Ref<HTMLDivElement>
  size?: ControlSize
  style?: React.CSSProperties
}

const FormItem = (props: FormItemProps) => {
  const {
    asterisk,
    children,
    className,
    errorMessage,
    extra,
    extraType = "end",
    htmlFor,
    invalid,
    label,
    labelClass,
    labelWidth,
    layout,
    ref,
    style,
    size,
  } = props

  const formContext = useForm()

  const formItemLabelHeight = size || formContext?.size || "md"
  const formItemLabelWidth = labelWidth || formContext?.labelWidth
  const formItemLayout = layout || formContext?.layout || "vertical"

  const getFormLabelLayoutClass = () => {
    switch (formItemLayout) {
      case "horizontal":
        return label
          ? `${CONTROL_SIZES[formItemLabelHeight].h} ${
              label && "ltr:pr-2 rtl:pl-2"
            }`
          : "ltr:pr-2 rtl:pl-2"
      case "vertical":
        return `mb-2`
      case "inline":
        return `${CONTROL_SIZES[formItemLabelHeight].h} ${
          label && "ltr:pr-2 rtl:pl-2"
        }`
      default:
        return ""
    }
  }

  const getFormItemClass = () => {
    const baseClass = "relative mb-7"
    const layoutClass = {
      horizontal: "flex flex-auto",
      vertical: "flex flex-col",
      inline: "mr-3 rtl:ml-3 md:inline-flex",
    }[formItemLayout]

    return cn(baseClass, layoutClass, className)
  }

  const formLabelClass = cn(
    "flex items-center font-semibold",
    label && getFormLabelLayoutClass(),
    invalid && "text-destructive",
    labelClass
  )

  const formLabelStyle = () => {
    if (formItemLayout === "horizontal" && formItemLabelWidth) {
      return {
        ...style,
        minWidth:
          typeof formItemLabelWidth === "number"
            ? `${formItemLabelWidth}px`
            : formItemLabelWidth,
      }
    }

    return { ...style }
  }

  const enterStyle = { opacity: 1, marginTop: 3, bottom: -21 }
  const exitStyle = { opacity: 0, marginTop: -10 }
  const initialStyle = exitStyle

  return (
    <FormItemContextProvider value={{ invalid }}>
      <div ref={ref} className={getFormItemClass()}>
        <label
          htmlFor={htmlFor}
          className={formLabelClass}
          style={formLabelStyle()}
        >
          {extra && extraType === "start" && extra}
          <div className="flex justify-start">
            {asterisk && (
              <span className="text-red-500 ltr:mr-1 rtl:ml-1">*</span>
            )}
            {label}
          </div>
          {extra && extraType === "end" && extra}
          {label && formItemLayout !== "vertical" && ":"}
        </label>
        <div
          className={
            formItemLayout === "horizontal"
              ? "relative flex w-full flex-col justify-center"
              : ""
          }
        >
          {children}
          <AnimatePresence mode="wait">
            {invalid && (
              <motion.div
                className="text-destructive absolute text-sm font-semibold"
                initial={initialStyle}
                animate={enterStyle}
                exit={exitStyle}
                transition={{ duration: 0.15, type: "tween" }}
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FormItemContextProvider>
  )
}

export default FormItem
