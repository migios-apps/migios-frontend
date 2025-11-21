import type { ChangeEvent } from "react"
import { forwardRef } from "react"
import { SearchNormal1 } from "iconsax-reactjs"
import useDebounce from "@/utils/hooks/useDebounce"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group"

type InputDebounceProps = React.ComponentProps<"input"> & {
  wait?: number
  handleOnchange?: (value: string) => void
}

const InputDebounce = forwardRef<HTMLInputElement, InputDebounceProps>(
  (props, ref) => {
    const { wait = 500, handleOnchange, ...rest } = props

    const handleInputChange = (val: string) => {
      if (typeof val === "string" && (val.length > 1 || val.length === 0)) {
        handleOnchange?.(val)
      }
    }

    function handleDebounceFn(value: ChangeEvent<HTMLInputElement>) {
      props.onChange?.(value)
      handleInputChange(value.target.value)
    }

    const debounceFn = useDebounce(handleDebounceFn, wait)

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      debounceFn(e)
    }

    // return <Input ref={ref} {...rest} type="search" onChange={onInputChange} />
    return (
      <InputGroup>
        <InputGroupAddon>
          <SearchNormal1 />
        </InputGroupAddon>
        <InputGroupInput
          ref={ref}
          {...rest}
          type="search"
          onChange={onInputChange}
        />
      </InputGroup>
    )
  }
)

InputDebounce.displayName = "InputDebounce"

export default InputDebounce
