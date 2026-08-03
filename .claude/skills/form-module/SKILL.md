---
name: form-module
description: Build a create/edit form in the Migios gym frontend using react-hook-form + yup with the project's validation-module convention (useXValidation / resetXForm / setXForm), FormFieldItem fields, IDR currency inputs, date pickers, async paginated selects, and mutation wiring. Use when adding or modifying any form.
---

# Form module pattern

Forms live in `src/components/form/<domain>/`, split into a **validation module** (schema +
hook + reset/set helpers) and a **form component** (fields + mutations). Pages own the hook
instance and pass it down as `formProps`.

> Comments in the snippets below are documentation for you, not part of the output. Per
> CLAUDE.md, code you write carries **no comments** — strip them when adapting these examples.

```
src/components/form/member/
  memberValidation.ts    schema, types, useMemberValidation, resetMemberForm, setMemberForm
  FormPageMember.tsx     full-page form (Card sections + BottomStickyBar)
  FormMember.tsx         dialog/embedded variant
```

## 1. Validation module

```ts
// src/components/form/voucher/voucherValidation.ts
import { useForm } from "react-hook-form"
import { VoucherType } from "@/services/api/@types/voucher"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { dayjs } from "@/utils/dayjs"

export const validationSchemaVoucher = yup.object().shape({
  id: yup.number().optional().nullable(),
  code: yup.string().required("Kode wajib diisi"),
  discount_type: yup
    .string()
    .oneOf(["percent", "nominal"], "Tipe diskon tidak valid")
    .required("Tipe diskon wajib diisi"),
  discount: yup.number().required("Diskon wajib diisi").nullable(),
  valid_until: yup
    .date()
    .required("Tanggal berlaku wajib diisi")
    .typeError("Tanggal tidak valid"),
  enabled: yup.boolean().default(true),
})

export type CreateVoucherSchema = yup.InferType<typeof validationSchemaVoucher>
export type ReturnVoucherSchema = ReturnType<typeof useForm<CreateVoucherSchema>>

export const defaultValueVoucher = {
  discount_type: "percent" as const,
  valid_until: dayjs().toDate(),
  enabled: true,
}

export const useVoucherValidation = () =>
  useForm<CreateVoucherSchema>({
    resolver: yupResolver(validationSchemaVoucher) as any,
    defaultValues: defaultValueVoucher,
  })

export const resetVoucherForm = (form: ReturnVoucherSchema) => {
  form.reset(defaultValueVoucher)
}

export const setVoucherForm = (
  form: ReturnVoucherSchema,
  data: VoucherType
) => {
  form.setValue("id", data.id)
  form.setValue("code", data.code)
  form.setValue("discount_type", data.discount_type as any)
  form.setValue("discount", data.discount)
  form.setValue("valid_until", dayjs(data.valid_until).toDate())
  form.setValue("enabled", data.enabled)
}
```

Conventions:

- Yup, **not** zod. `yupResolver(schema) as any` — the cast is needed and is used everywhere.
- Export all five: schema, `CreateXSchema`, `ReturnXSchema`, `useXValidation`, `resetXForm`.
  Add `setXForm` for anything editable.
- Validation messages are **Indonesian** (user-facing copy).
- Dates are `yup.date()` holding real `Date` objects; convert to strings only in the payload.
- Optional API fields: `.optional().nullable()`.

## 2. Form component

```tsx
type FormProps = {
  type: "create" | "update"
  formProps: ReturnVoucherSchema
  onSuccess: () => void
}
```

The page creates the hook and decides what "success" means; the component owns mutations.

```tsx
const FormPageVoucher: React.FC<FormProps> = ({ type, formProps, onSuccess }) => {
  const queryClient = useQueryClient()
  const club = useSessionUser((state) => state.club)
  const { control, watch, handleSubmit, formState: { errors } } = formProps
  const watchData = watch()

  const handlePrefetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.vouchers] })
    resetVoucherForm(formProps)
    onSuccess()
  }

  const create = useMutation({
    mutationFn: (data: CreateVoucherTypes) => apiCreateVoucher(data),
    onSuccess: handlePrefetch,
  })
  const update = useMutation({
    mutationFn: (data: CreateVoucherTypes) =>
      apiUpdateVoucher(watchData.id as number, data),
    onSuccess: handlePrefetch,
  })

  const onSubmit: SubmitHandler<CreateVoucherSchema> = (data) => {
    const payload: CreateVoucherTypes = {
      club_id: club?.id as number,
      code: data.code,
      discount_type: data.discount_type,
      discount: data.discount ?? 0,
      valid_until: dayjs(data.valid_until).format("YYYY-MM-DD"),
      enabled: data.enabled,
    }
    if (type === "update") return update.mutate(payload)
    create.mutate(payload)
  }

  return (
    <Form {...formProps}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto flex max-w-5xl flex-col gap-2">
          <Card>
            <CardHeader><CardTitle>Data Voucher</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {/* fields */}
            </CardContent>
          </Card>
        </div>
        <BottomStickyBar>
          <Button type="submit" disabled={create.isPending || update.isPending}>
            {create.isPending || update.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </BottomStickyBar>
      </form>
    </Form>
  )
}
```

`Button` has **no `loading` prop** — show pending state with `disabled` plus a swapped label.
(`AlertConfirm` does take `loading`.)

Always build an explicit `payload` object — never `mutate(data)` with the raw form values.
Schema shape and API shape differ (Date → `YYYY-MM-DD`, `club_id` injected, `undefined` → `null`).

## 3. Fields

Use `FormFieldItem` from `@/components/ui/form` — the project's wrapper that wires label,
control, description, and error message in one node.

```tsx
<FormFieldItem
  control={control}
  name="code"
  label={<FormLabel>Kode Voucher</FormLabel>}
  render={({ field }) => (
    <FormControl>
      <Input placeholder="VOUCHER10" {...field} value={field.value ?? ""} />
    </FormControl>
  )}
/>
```

| Input | Component | Notes |
|---|---|---|
| Text / number | `Input` from `@/components/ui/input` | `value={field.value ?? ""}` to stay controlled |
| Money (IDR) | `InputCurrency` | `Rp. ` prefix, `.` thousands, `,` decimals; read back with `parseToDecimal()` |
| Percent / nominal toggle | `InputPercentNominal` | Discount-style dual-mode fields |
| Phone | `InputPhone` | `react-phone-number-input`, ID default |
| KTP/SIM/Passport | `InputIdentity` | Type + number pair |
| Date / datetime | `DateTimePicker` from `@/components/ui/date-picker` | Works with `Date` objects |
| Static select | `Select` from `@/components/ui/react-select` | Styled `react-select` |
| Remote search select | `SelectAsyncPaginate` | Paginated remote options; returns `{ options, hasMore, additional: { page } }` |
| Multi-line | `Textarea` | |
| Boolean | `Checkbox` / `Switch` | |
| Choice group | `RadioGroup` + `RadioGroupItem` | Gender, type pickers |
| File / photo | `Upload` | |
| Repeating rows | `useFieldArray` | POS cart, PT schedules |

`SelectAsyncPaginate` loader shape:

```tsx
loadOptions={async (search, _prev, additional) => {
  const res = await apiGetEmployeeList({
    page: additional?.page ?? 1,
    per_page: 10,
    ...(search ? { search: [{ search_column: "name", search_condition: "like", search_text: search }] } : {}),
  })
  return {
    options: res.data.data,
    hasMore: res.data.meta.page !== res.data.meta.total_page,
    additional: { page: (additional?.page ?? 1) + 1 },
  }
}}
```

## 4. Layout

- One `Card` per logical section, with a `CardTitle`.
- Fields in `grid gap-4 md:grid-cols-2`; full width for address, notes, goals.
- Container: `mx-auto flex max-w-5xl flex-col gap-2`.
- Submit lives in `BottomStickyBar` so it stays reachable on long forms.
- Delete sits far from submit and routes through `AlertConfirm type="delete"`.
- Forms with more than ~8 fields belong on a dedicated page, not in a dialog. Short forms
  (loyalty adjustment, status change) stay in an animate-ui `Dialog`.

## 5. Edit mode

```tsx
const formProps = useVoucherValidation()
const { data } = useQuery({
  queryKey: [QUERY_KEY.voucherDetail, id],
  queryFn: () => apiGetVoucher(Number(id)),
  enabled: !!id,
})

useEffect(() => {
  if (data?.data) setVoucherForm(formProps, data.data)
}, [data])
```

## 6. Draft persistence

For multi-step / high-value flows (POS), keep the draft across reloads:

```tsx
useFormPersist<ValidationTransactionSchema>("item_pos", {
  defaultValue: defaultValueTransaction,
  watch: form.watch,
  setValue: form.setValue,
})
```

Defaults to `sessionStorage`. Clear it after a successful submit.

## Don't

- Don't add `onError` toasts for API failures — the axios interceptor already toasts the
  backend message.
- Don't validate manually inside `onSubmit`; put it in the yup schema.
- Don't use zod (`@hookform/resolvers/zod` appears in the Prettier import order but the
  codebase is yup throughout).
- Don't format dates with the native `Date` API — use `dayjs` from `@/utils/dayjs`.
