import type {
  ClassNamesConfig,
  GroupBase,
  Props as SelectProps,
  StylesConfig,
} from "react-select"
import ReactSelect from "react-select"
import { cn } from "@/lib/utils"
import {
  ClearIndicator,
  CustomInput,
  DropdownIndicator,
  MultiValueRemove,
} from "./component"

export interface ReactSelectProps<
  OptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
> extends SelectProps<OptionType, IsMulti, Group> {
  error?: boolean
  className?: string
}

function Select<
  OptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<OptionType> = GroupBase<OptionType>,
>(props: ReactSelectProps<OptionType, IsMulti, Group>) {
  const { components, className, classNames, styles, error, ...rest } = props

  return (
    <ReactSelect<OptionType, IsMulti, Group>
      className={cn("react-select-container", className)}
      classNamePrefix="react-select"
      unstyled
      classNames={
        {
          clearIndicator: () => "cursor-pointer",
          container: () => "",
          control: (state) =>
            cn(
              "flex min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors",
              state.isDisabled && "cursor-not-allowed opacity-50",
              state.isFocused &&
                "outline-none ring-[3px] ring-ring/50 border-ring",
              error && "border-destructive ring-destructive/20"
            ),
          dropdownIndicator: () => "",
          group: () => "",
          groupHeading: () =>
            "py-2 px-1 text-muted-foreground text-xs font-semibold",
          indicatorsContainer: () => "gap-1",
          indicatorSeparator: () => "hidden",
          input: () => "m-0 p-0",
          loadingIndicator: () => "",
          loadingMessage: () => "text-muted-foreground p-2 text-sm",
          menu: () => "p-1 mt-1 border bg-popover shadow-md rounded-md z-50",
          menuList: () => "",
          menuPortal: () => "",
          multiValue: () =>
            "inline-flex items-center gap-2 rounded-md border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-1.5 py-0.5 text-xs font-semibold",
          multiValueLabel: () => "",
          multiValueRemove: () => "hover:bg-transparent hover:text-destructive",
          noOptionsMessage: () =>
            "text-muted-foreground p-2 bg-accent/50 border border-dashed border-border rounded-sm text-sm",
          option: (state) =>
            cn(
              "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
              state.isFocused && "bg-accent text-accent-foreground",
              state.isDisabled && "pointer-events-none opacity-50",
              state.isSelected && "bg-accent/50"
            ),
          placeholder: () => "text-sm text-muted-foreground",
          singleValue: () => "ml-0",
          valueContainer: () => "gap-1 px-0",
          ...classNames,
        } as ClassNamesConfig<OptionType, IsMulti, Group>
      }
      styles={
        {
          input: (base) => ({
            ...base,
            "input:focus": {
              boxShadow: "none",
            },
          }),
          multiValueLabel: (base) => ({
            ...base,
            whiteSpace: "normal",
            overflow: "visible",
          }),
          control: (base) => ({
            ...base,
            transition: "none",
          }),
          menuList: (base) => ({
            ...base,
            "::-webkit-scrollbar": {
              background: "transparent",
              width: "8px",
            },
            "::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "::-webkit-scrollbar-thumb": {
              background: "hsl(var(--border))",
              borderRadius: "4px",
            },
            "::-webkit-scrollbar-thumb:hover": {
              background: "hsl(var(--muted-foreground))",
            },
          }),
          ...styles,
        } as StylesConfig<OptionType, IsMulti, Group>
      }
      components={{
        DropdownIndicator,
        ClearIndicator,
        MultiValueRemove,
        Input: CustomInput,
        IndicatorSeparator: () => null,
        ...components,
      }}
      {...rest}
    />
  )
}

export default Select
export { Select }
