import { forwardRef } from "react"
import CurrencyInput, {
  CurrencyInputProps,
  formatValue,
  CurrencyInputOnChangeValues,
} from "react-currency-input-field"
import { Input } from "./input"

export const currencyFormat = (value: number | string) => {
  // const currencyValue = parseFloat(value.toString()) as number
  // const number = new Intl.NumberFormat("id-ID", options || initalOptions)
  // return number.format(currencyValue)
  const formattedValue1 = formatValue({
    value: `${value}`,
    decimalSeparator: ",",
    groupSeparator: ".",
    prefix: `Rp. `,
    decimalScale: 2,
    // decimalScale: 0,
    // ...(config?.dec_digit && { decimalScale: Number(config?.dec_digit) }),
  })
  return formattedValue1
}

export type CombinedCurrencyInputProps = CurrencyInputProps &
  Omit<React.ComponentProps<"input">, "onChange">

const InputCurrency = forwardRef<HTMLInputElement, CombinedCurrencyInputProps>(
  (props, ref) => {
    return (
      <CurrencyInput
        ref={ref}
        prefix={`Rp. `}
        step={2}
        groupSeparator="."
        decimalSeparator=","
        customInput={Input}
        allowDecimals={true}
        {...props}
        onValueChange={(
          value: string | undefined,
          name: string | undefined,
          values: CurrencyInputOnChangeValues | undefined
        ) => {
          // Jika value adalah undefined atau empty string, kirim null untuk float
          // Ini memungkinkan field untuk dikosongkan sepenuhnya (Ctrl+A + Delete)
          // Library menggunakan null untuk nilai kosong, bukan undefined
          if (value === undefined || value === "") {
            props.onValueChange?.(value, name, {
              ...values,
              float: null,
            } as CurrencyInputOnChangeValues)
          } else {
            props.onValueChange?.(value, name, values)
          }
        }}
      />
    )
  }
)

InputCurrency.displayName = "InputCurrency"

export default InputCurrency
