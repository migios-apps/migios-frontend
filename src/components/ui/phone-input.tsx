import React from "react"
import { ChevronDown, Search } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"
import type { StylesConfig } from "react-select"
import { components } from "react-select"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"
import { Button } from "./button"
import { Input } from "./input"
import { Select } from "./react-select"

export type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void
    defaultCountry?: RPNInput.Country
  }

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, defaultCountry = "ID", ...props }, ref) => {
      return (
        <RPNInput.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          smartCaret={false}
          international={false}
          defaultCountry={defaultCountry}
          onChange={(value) => onChange?.(value || ("" as RPNInput.Value))}
          {...props}
        />
      )
    }
  )
PhoneInput.displayName = "PhoneInput"

export default PhoneInput

const InputComponent = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  ref: React.RefObject<HTMLInputElement>
}) => {
  const { size, ref, ...restProps } = props
  return (
    <Input
      {...restProps}
      ref={ref}
      className={cn("rounded-s-none rounded-e-lg", className)}
    />
  )
}
InputComponent.displayName = "InputComponent"

type CountryEntry = { label: string; value: RPNInput.Country | undefined }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const listCountry = countryList.filter(
    (option) => option.label?.toLowerCase() !== "international"
  )
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="rounded-tr-none rounded-br-none px-3"
          type="button"
          variant="outline"
        >
          {selectedCountry ? (
            <div className="flex items-center gap-2">
              <FlagComponent
                country={selectedCountry}
                countryName={
                  listCountry.find((option) => option.value === selectedCountry)
                    ?.label || ""
                }
              />
              <span className="text-foreground/50 text-sm">
                {`+${selectedCountry ? RPNInput.getCountryCallingCode(selectedCountry) : ""}`}
              </span>
              <ChevronDown className="size-4 opacity-50" />
            </div>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2" align="start">
        <Select
          autoFocus
          menuIsOpen
          isDisabled={disabled}
          backspaceRemovesValue={false}
          components={{
            DropdownIndicator: () => (
              <div className="flex h-full items-center justify-center px-2">
                <Search className="size-4 opacity-50" />
              </div>
            ),
            IndicatorSeparator: null,
            Option: (props) => {
              const { isSelected, isFocused, isDisabled, data } = props
              return (
                <components.Option
                  {...props}
                  className={cn(
                    !isDisabled && "cursor-pointer",
                    isSelected && "!bg-primary/10 !text-primary",
                    isFocused && !isSelected && "bg-accent",
                    !isDisabled &&
                      !isSelected &&
                      "hover:text-gray-800 hover:dark:text-gray-100"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FlagComponent
                      country={data.value}
                      countryName={data.label}
                    />
                    <span className="flex-1 text-sm">{data.label}</span>
                    <span
                      className={cn(
                        "text-xs",
                        isSelected ? "text-primary/70" : "text-muted-foreground"
                      )}
                    >{`+${data?.value ? RPNInput.getCountryCallingCode(data?.value) : ""}`}</span>
                  </div>
                </components.Option>
              )
            },
          }}
          tabIndex={-1}
          controlShouldRenderValue={false}
          hideSelectedOptions={false}
          isClearable={false}
          options={listCountry}
          placeholder="Search country..."
          styles={selectStyles}
          tabSelectsValue={false}
          value={listCountry.find((option) => option.value === selectedCountry)}
          onChange={(newValue) => {
            onChange(newValue.value)
            setIsOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

const selectStyles: StylesConfig<any, false> = {
  control: () => ({}),
  menu: () => ({}),
}

const FlagComponent = ({
  country,
  countryName,
  className,
}: RPNInput.FlagProps & { className?: string }) => {
  const Flag = flags[country]

  return (
    <span
      className={cn(
        "flex h-4 overflow-hidden rounded-sm [&_svg]:size-full",
        className
      )}
    >
      {Flag && <Flag title={countryName} />}
    </span>
  )
}
