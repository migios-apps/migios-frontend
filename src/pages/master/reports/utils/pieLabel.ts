import { currencyFormat } from "@/components/ui/input-currency"

interface PieValueLabelProps {
  value?: number
}

const hasValue = ({ value }: PieValueLabelProps) =>
  typeof value === "number" && value > 0

export const pieCurrencyLabel = (props: PieValueLabelProps) =>
  hasValue(props) ? currencyFormat(props.value as number) : ""

export const pieCountLabel = (props: PieValueLabelProps) =>
  hasValue(props) ? (props.value as number).toLocaleString("id-ID") : ""
