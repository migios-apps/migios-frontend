import * as React from "react"
import { cn } from "@/lib/utils"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

export type IdentityTypeOption = {
  key: string
  name: string
}

export const DEFAULT_IDENTITY_TYPE_OPTIONS: IdentityTypeOption[] = [
  { key: "ktp", name: "KTP" },
  { key: "sim", name: "SIM" },
  { key: "passport", name: "Passport" },
]

export interface InputIdentityProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  /**
   * Nilai identity type yang dipilih
   */
  identityType?: string
  /**
   * Callback ketika identity type berubah
   */
  onIdentityTypeChange?: (value: string) => void
  /**
   * Nilai identity number
   */
  identityNumber?: string
  /**
   * Callback ketika identity number berubah
   */
  onIdentityNumberChange?: (value: string) => void
  /**
   * Opsi identity type yang tersedia
   * Default: [{ key: "ktp", name: "KTP" }, { key: "sim", name: "SIM" }, { key: "passport", name: "Passport" }]
   */
  identityTypeOptions?: IdentityTypeOption[]
  /**
   * Apakah ada error pada input
   */
  error?: boolean
  /**
   * Placeholder untuk input identity number
   */
  placeholder?: string
  /**
   * ClassName untuk wrapper ButtonGroup
   */
  className?: string
  /**
   * ClassName untuk SelectTrigger
   */
  selectTriggerClassName?: string
  /**
   * ClassName untuk Input
   */
  inputClassName?: string
  /**
   * Placeholder untuk Select (ketika tidak ada yang dipilih)
   */
  selectPlaceholder?: string
}

const InputIdentity = React.forwardRef<HTMLInputElement, InputIdentityProps>(
  (
    {
      identityType,
      onIdentityTypeChange,
      identityNumber,
      onIdentityNumberChange,
      identityTypeOptions = DEFAULT_IDENTITY_TYPE_OPTIONS,
      error = false,
      placeholder = "No. Identity",
      className,
      selectTriggerClassName,
      inputClassName,
      selectPlaceholder = "Pilih",
      ...inputProps
    },
    ref
  ) => {
    const selectedIdentityType = identityTypeOptions.find(
      (item) => item.key === identityType
    )

    return (
      <ButtonGroup className={cn("w-full", className)} aria-invalid={error}>
        <Select
          value={identityType || ""}
          onValueChange={(value) => {
            onIdentityTypeChange?.(value)
          }}
        >
          <SelectTrigger
            className={cn("font-mono", selectTriggerClassName)}
            aria-invalid={error}
          >
            {selectedIdentityType?.name || selectPlaceholder}
          </SelectTrigger>
          <SelectContent className="min-w-24">
            {identityTypeOptions.map((item) => (
              <SelectItem key={item.key} value={item.key}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          ref={ref}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          aria-invalid={error}
          value={identityNumber}
          onChange={(e) => {
            onIdentityNumberChange?.(e.target.value)
          }}
          className={inputClassName}
          {...inputProps}
        />
      </ButtonGroup>
    )
  }
)

InputIdentity.displayName = "InputIdentity"

export { InputIdentity }
