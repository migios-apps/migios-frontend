"use client"

import * as React from "react"
import { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input, inputVariants } from "@/components/ui/input"
import InputCurrency, {
  type CombinedCurrencyInputProps,
} from "@/components/ui/input-currency"
import { ButtonGroup } from "./button-group"

export type PercentNominalType = "percent" | "nominal"

export interface InputPercentNominalProps {
  /**
   * Nilai input saat ini
   */
  value?: number | string | null
  /**
   * Callback ketika nilai input berubah
   */
  onChange?: (value: number | string | null) => void
  /**
   * Tipe input saat ini: "percent" atau "nominal"
   */
  type?: PercentNominalType
  /**
   * Callback ketika tipe berubah
   */
  onTypeChange?: (type: PercentNominalType) => void
  /**
   * Apakah ada error pada input
   */
  error?: boolean
  /**
   * Placeholder untuk input
   */
  placeholder?: string
  /**
   * Placeholder untuk mode percent
   */
  placeholderPercent?: string
  /**
   * Placeholder untuk mode nominal
   */
  placeholderNominal?: string
  /**
   * ClassName untuk wrapper InputGroup
   */
  className?: string
  /**
   * ClassName untuk input
   */
  inputClassName?: string
  /**
   * ClassName untuk button percent
   */
  percentButtonClassName?: string
  /**
   * ClassName untuk button nominal
   */
  nominalButtonClassName?: string
  /**
   * Label untuk button percent (default: "%")
   */
  percentLabel?: string
  /**
   * Label untuk button nominal (default: "Rp")
   */
  nominalLabel?: string
  /**
   * Apakah input disabled
   */
  disabled?: boolean
  /**
   * Size untuk button dan input (konsisten dengan Button component)
   */
  size?:
    | VariantProps<typeof inputVariants>["size"]
    | VariantProps<typeof buttonVariants>["size"]
    | null
    | undefined
  /**
   * Props tambahan untuk Input (mode percent)
   */
  inputProps?: Omit<
    React.ComponentProps<typeof Input>,
    | "value"
    | "onChange"
    | "placeholder"
    | "className"
    | "aria-invalid"
    | "type"
    | "autoComplete"
    | "size"
  >
  /**
   * Props tambahan untuk InputCurrency (mode nominal)
   */
  currencyProps?: Omit<
    CombinedCurrencyInputProps,
    "value" | "onValueChange" | "placeholder" | "className" | "aria-invalid"
  >
}

const InputPercentNominal = React.forwardRef<
  HTMLInputElement,
  InputPercentNominalProps
>(
  (
    {
      value,
      onChange,
      type = "percent",
      onTypeChange,
      error = false,
      placeholder,
      placeholderPercent = "10%",
      placeholderNominal = "Rp. 0",
      className,
      inputClassName,
      percentButtonClassName,
      nominalButtonClassName,
      percentLabel = "%",
      nominalLabel = "Rp",
      disabled = false,
      inputProps,
      currencyProps,
      size,
    },
    ref
  ) => {
    const handlePercentClick = () => {
      if (!disabled && onTypeChange && type !== "percent") {
        onTypeChange("percent")
      }
    }

    const handleNominalClick = () => {
      if (!disabled && onTypeChange && type !== "nominal") {
        onTypeChange("nominal")
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return
      onChange(e.target.value)
    }

    const handleCurrencyChange = (
      _value: string | undefined,
      _name: string | undefined,
      values: any
    ) => {
      if (!onChange) return
      onChange(values?.float ?? null)
    }

    return (
      <ButtonGroup className={cn("w-full", className)} aria-invalid={error}>
        <Button
          type="button"
          variant={type === "percent" ? "default" : "outline"}
          className={cn(percentButtonClassName)}
          aria-invalid={error}
          onClick={handlePercentClick}
          disabled={disabled}
          size={size}
          tabIndex={-1}
        >
          {percentLabel}
        </Button>
        <Button
          type="button"
          variant={type === "nominal" ? "default" : "outline"}
          className={cn(nominalButtonClassName)}
          aria-invalid={error}
          onClick={handleNominalClick}
          disabled={disabled}
          size={size}
          tabIndex={-1}
        >
          {nominalLabel}
        </Button>
        {type === "nominal" ? (
          <InputCurrency
            ref={ref}
            placeholder={placeholder || placeholderNominal}
            value={value ?? undefined}
            onValueChange={handleCurrencyChange}
            aria-invalid={error}
            className={cn(inputClassName)}
            disabled={disabled}
            {...currencyProps}
            size={(size as any) || undefined}
          />
        ) : (
          <Input
            ref={ref}
            type="number"
            autoComplete="off"
            placeholder={placeholder || placeholderPercent}
            value={value ?? ""}
            onChange={handleInputChange}
            aria-invalid={error}
            className={cn(inputClassName)}
            disabled={disabled}
            size={size}
            {...inputProps}
          />
        )}
      </ButtonGroup>
    )
  }
)

InputPercentNominal.displayName = "InputPercentNominal"

export { InputPercentNominal }
