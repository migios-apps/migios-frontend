import * as React from "react"
import { ChevronDown, Loader2, X } from "lucide-react"
import type { GroupBase, InputProps } from "react-select"
import { components as selectComponents } from "react-select"
import { cn } from "@/lib/utils"

export const DropdownIndicator = () => {
  return (
    <div className="flex h-full items-center justify-center px-2">
      <ChevronDown className="h-4 w-4 opacity-50" />
    </div>
  )
}

interface ClearIndicatorProps {
  innerProps: React.HTMLProps<HTMLDivElement>
}

export const ClearIndicator = ({ innerProps }: ClearIndicatorProps) => {
  return (
    <div {...innerProps}>
      <div className="flex h-full items-center justify-center px-2 opacity-50 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}

export const MultiValueRemove = ({ innerProps }: ClearIndicatorProps) => {
  return (
    <div {...innerProps}>
      <div className="flex h-full items-center justify-center opacity-50 hover:opacity-100">
        <X className="h-3 w-3" />
      </div>
    </div>
  )
}

// Custom Input component that wraps the default react-select Input
export const CustomInput = <
  OptionType,
  IsMulti extends boolean,
  Group extends GroupBase<OptionType>,
>({
  ...props
}: InputProps<OptionType, IsMulti, Group>) => {
  return (
    <selectComponents.Input
      {...props}
      className={cn("m-0 p-0", props.className)}
    />
  )
}

export const LoadingIndicator = () => {
  return (
    <div className="flex h-full items-center justify-center px-2">
      <Loader2 className="h-4 w-4 animate-spin opacity-50" />
    </div>
  )
}
