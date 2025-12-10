import { useForm } from "react-hook-form"
import {
  DiscountType,
  DurationType,
  ItemType,
  PackageType,
} from "@/services/api/@types/sales"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"
import parseToDecimal from "@/utils/parseToDecimal"

export const transactionItemSchema = Yup.object().shape({
  item_type: Yup.string()
    .oneOf(["package", "product"] as ItemType[], "Invalid item type.")
    .required("Item type is required."),
  package_id: Yup.number().when("item_type", {
    is: "package",
    then: (schema) => schema.required("Package ID is required for packages."),
    otherwise: (schema) => schema.nullable(),
  }),
  product_id: Yup.number().when("item_type", {
    is: "product",
    then: (schema) => schema.required("Product ID is required for products."),
    otherwise: (schema) => schema.nullable(),
  }),
  name: Yup.string().required("Item name is required."),
  product_qty: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable(),
  quantity: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Quantity is required."),
  price: Yup.number()
    .transform((_, originalValue) => {
      if (!originalValue) return undefined
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? undefined
        : num
    })
    .typeError("Price must be a valid number")
    .required("Price is required."),
  sell_price: Yup.number()
    .transform((_, originalValue) => {
      if (!originalValue) return undefined
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? undefined
        : num
    })
    .typeError("Sell Price must be a valid number")
    .required("Sell Price is required."),
  discount_type: Yup.string()
    .oneOf(["percent", "nominal"] as DiscountType[], "Invalid discount type.")
    .optional()
    .nullable(),
  discount: Yup.number()
    .nullable()
    .transform((_, originalValue) => {
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      )
        return null
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? null
        : num
    })
    .typeError("Discount must be a valid number"),
  duration: Yup.number().when("item_type", {
    is: "package",
    then: (schema) => schema.required("Duration is required for packages."),
    otherwise: (schema) => schema.nullable(),
  }),
  duration_type: Yup.string().when("item_type", {
    is: "package",
    then: (schema) =>
      schema
        .oneOf(
          ["day", "month", "year"] as DurationType[],
          "Invalid duration type."
        )
        .required("Duration type is required for packages."),
    otherwise: (schema) => schema.nullable(),
  }),
  session_duration: Yup.number().when("item_type", {
    is: "package",
    then: (schema) =>
      schema
        .transform((value) => (isNaN(value) ? undefined : value))
        .required("Session duration is required for packages."),
    otherwise: (schema) => schema.nullable(),
  }),
  extra_session: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable(),
  extra_day: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable(),
  start_date: Yup.date().when("item_type", {
    is: "package",
    then: (schema) => schema.required("Start date is required for packages."),
    otherwise: (schema) => schema.nullable(),
  }),
  notes: Yup.string().nullable(),

  //   custom
  source_from: Yup.string()
    .oneOf(["item", "redeem_item"], "Invalid source from.")
    .default("item"),
  is_promo: Yup.number().default(0),
  loyalty_reward_id: Yup.number()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value)),
  loyalty_reward_name: Yup.string()
    .nullable()
    .when(["loyalty_reward_id", "source_from"], {
      is: (loyalty_reward_id: number | null, source_from: string) =>
        (loyalty_reward_id !== null && loyalty_reward_id !== undefined) ||
        source_from === "redeem_item",
      then: (schema) =>
        schema.required(
          "Loyalty reward name is required when loyalty reward ID is set or source is redeem_item."
        ),
      otherwise: (schema) => schema.nullable(),
    }),
  loyalty_point: Yup.object()
    .shape({
      points: Yup.number().min(0).default(0),
      expired_type: Yup.string()
        .oneOf(["forever", "day", "week", "month", "year"])
        .default("forever"),
      expired_value: Yup.number().min(0).default(0),
    })
    .nullable()
    .default(null),
  allow_all_trainer: Yup.boolean().default(false),
  package_type: Yup.string().when("item_type", {
    is: "package",
    then: (schema) =>
      schema
        .oneOf(
          ["membership", "pt_program", "class"] as PackageType[],
          "Invalid package type."
        )
        .required("Package type is required for packages."),
    otherwise: (schema) => schema.nullable(),
  }),
  classes: Yup.array().when("item_type", {
    is: "package",
    then: (schema) =>
      schema.of(
        Yup.object().shape({
          id: Yup.number().required("Class ID is required."),
          name: Yup.string().required("Class name is required."),
          level: Yup.number().required("Class level is required."),
          allow_all_instructor: Yup.boolean().required(
            "Allow all instructor setting is required."
          ),
        })
      ),
    otherwise: (schema) => schema.default([]),
  }),
  instructors: Yup.array().default([]),
  trainers: Yup.object()
    .shape({
      id: Yup.number(),
      name: Yup.string(),
      code: Yup.string(),
      photo: Yup.string().nullable(),
    })
    .nullable()
    .default(null)
    .when(["item_type", "package_type"], {
      is: (item_type: string, package_type: string) =>
        item_type === "package" && package_type === "pt_program",
      then: (schema) =>
        schema
          .shape({
            id: Yup.number().required("Trainer ID is required."),
            name: Yup.string().required("Trainer name is required."),
            code: Yup.string().required("Trainer code is required."),
            photo: Yup.string().nullable(),
          })
          .required("Trainer is required for PT Program."),
      otherwise: (schema) => schema.nullable(),
    }),
  data: Yup.object().nullable(),
})

export type TransactionItemSchema = Yup.InferType<typeof transactionItemSchema>
export type ReturnTransactionItemFormSchema = ReturnType<
  typeof useForm<TransactionItemSchema>
>

const defaultValueCartItem = {
  discount_type: "percent",
  discount: 0,
  start_date: new Date(),
  source_from: "item",
} as any

export const useTransactionItemForm = () => {
  return useForm<TransactionItemSchema>({
    resolver: yupResolver(transactionItemSchema) as any,
    defaultValues: {
      ...defaultValueCartItem,
    },
  })
}

export const resetTransactionItemForm = (
  form: ReturnTransactionItemFormSchema
) => {
  form.reset({
    ...defaultValueCartItem,
  })
}

export const validationTransactionSchema = Yup.object().shape({
  // club_id: Yup.number().required('Club ID is required.'),
  employee: Yup.object().nullable().shape({
    id: Yup.number().nullable(),
    name: Yup.string().nullable(),
    photo: Yup.string().nullable(),
  }),
  member: Yup.object()
    .nullable()
    .shape({
      id: Yup.number().when("$hasPackage", {
        is: true,
        then: (schema) => schema.required("Member ID is required."),
        otherwise: (schema) => schema.nullable(),
      }),
      name: Yup.string().when("$hasPackage", {
        is: true,
        then: (schema) => schema.required("Member name is required."),
        otherwise: (schema) => schema.nullable(),
      }),
      photo: Yup.string().nullable(),
      code: Yup.string().nullable(),
    })
    .test(
      "member-required-if-package",
      "Member is required when a package is included.",
      function (value) {
        const { items } = this.parent
        const hasPackageItem = items?.some(
          (item: TransactionItemSchema) => item.item_type === "package"
        )

        // Jika tidak ada package item, member tidak wajib
        if (!hasPackageItem) {
          return true
        }

        // Jika ada package item, member wajib diisi
        return Boolean(value && value.id && value.name)
      }
    ),
  tax_calculation: Yup.number().default(0),
  loyalty_enabled: Yup.number().default(0),
  taxes: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number(),
        type: Yup.string(),
        name: Yup.string(),
        rate: Yup.number(),
      })
    )
    .default([]),

  discounts: Yup.array()
    .of(
      Yup.object().shape({
        discount_type: Yup.string()
          .oneOf(
            ["percent", "nominal"] as DiscountType[],
            "Invalid discount type."
          )
          .required("Discount type is required."),
        discount_amount: Yup.number()
          .transform((_, originalValue) => {
            if (!originalValue) return undefined
            const num = parseToDecimal(originalValue)
            return num === 0 && originalValue !== 0 && originalValue !== "0"
              ? undefined
              : num
          })
          .typeError("Discount amount must be a valid number")
          .required("Discount amount is required."),
        loyalty_reward_id: Yup.number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .nullable()
          .optional(),
      })
    )
    .default([]),
  // is_paid: Yup.number()
  //   .oneOf([0, 1, 2, 3] as PaymentStatus[], 'Invalid payment status.')
  //   .required('Payment status is required.'),
  due_date: Yup.date().required("Due date is required."),
  notes: Yup.string().nullable(),
  items: Yup.array()
    .of(transactionItemSchema)
    .required("Transaction items are required.")
    .min(1, "At least one transaction item is required."),
  balance_amount: Yup.number().required("Balance amount is required."),
  payments: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required("Rekening ID is required."),
        name: Yup.string().required("Payment name is required."),
        amount: Yup.number()
          .transform((_, originalValue) => {
            if (!originalValue) return undefined
            const num = parseToDecimal(originalValue)
            return num === 0 && originalValue !== 0 && originalValue !== "0"
              ? undefined
              : num
          })
          .typeError("Payment amount must be a valid number")
          .required("Payment amount is required.")
          .test("not-zero", "Payment amount cannot be zero.", (value) => {
            // Izinkan nilai negatif untuk refund mode
            // Hanya cek bahwa value tidak undefined, null, atau 0
            return value !== undefined && value !== null && value !== 0
          }),
        date: Yup.string().optional(),
        isDefault: Yup.boolean().optional().default(false),
        // reference_no: Yup.string().required('Reference number is required.'),
        // payment_date: Yup.date()
        //   .required('Payment date is required.')
        //   .max(new Date(), 'Payment date cannot be in the future.'),
      })
    )
    .required("Payments are required.")
    .min(0, "At least one payment is required."),
  refund_from: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required("Rekening ID is required for refunds."),
        amount: Yup.number()
          .transform((_, originalValue) => {
            if (!originalValue) return undefined
            const num = parseToDecimal(originalValue)
            return num === 0 && originalValue !== 0 && originalValue !== "0"
              ? undefined
              : num
          })
          .typeError("Refund amount must be a valid number")
          .required("Refund amount is required."),
        notes: Yup.string().nullable(),
        date: Yup.string().optional(),
        isDefault: Yup.boolean().optional().default(false),
      })
    )
    .min(0, "At least one refund is required."),
  loyalty_redeem_items: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required("Loyalty reward ID is required."),
        name: Yup.string().required("Reward name is required."),
        type: Yup.string()
          .oneOf(["discount", "free_item"], "Invalid reward type.")
          .required("Reward type is required."),
        points_required: Yup.number()
          .min(0, "Points required cannot be negative.")
          .required("Points required is required."),
        discount_type: Yup.string()
          .oneOf(["percent", "nominal"])
          .nullable()
          .when("type", {
            is: "discount",
            then: (schema) =>
              schema.required("Discount type is required for discount reward."),
            otherwise: (schema) => schema.nullable(),
          }),
        discount_value: Yup.number()
          .nullable()
          .transform((_, originalValue) => {
            if (
              originalValue === null ||
              originalValue === undefined ||
              originalValue === ""
            )
              return null
            const num = parseToDecimal(originalValue)
            return num === 0 && originalValue !== 0 && originalValue !== "0"
              ? null
              : num
          })
          .typeError("Discount value must be a valid number")
          .when("type", {
            is: "discount",
            then: (schema) =>
              schema.required(
                "Discount value is required for discount reward."
              ),
            otherwise: (schema) => schema.nullable(),
          }),
        items: Yup.array()
          .of(
            Yup.object().shape({
              id: Yup.number(),
              reward_id: Yup.number().nullable(),
              package_id: Yup.number().nullable(),
              product_id: Yup.number().nullable(),
              quantity: Yup.number().min(1).required(),
              item_type: Yup.string(),
              name: Yup.string(),
              original_price: Yup.number(),
              price: Yup.number(),
              discount_type: Yup.string(),
              discount: Yup.number(),
            })
          )
          .nullable()
          .when("type", {
            is: "free_item",
            then: (schema) =>
              schema
                .min(1, "At least one item is required for free item reward.")
                .required("Items are required for free item reward."),
            otherwise: (schema) => schema.nullable(),
          }),
      })
    )
    .default([]),
})

export const defaultValueTransaction: any = {
  discounts: [],
  is_paid: 0,
  notes: null,
  items: [],
  payments: [],
  refund_from: [],
  loyalty_redeem_items: [],
  due_date: new Date(),
}

export type ValidationTransactionSchema = Yup.InferType<
  typeof validationTransactionSchema
>

export type ReturnTransactionFormSchema = ReturnType<
  typeof useForm<ValidationTransactionSchema>
>

export const useTransactionForm = () => {
  return useForm<ValidationTransactionSchema>({
    resolver: yupResolver(validationTransactionSchema) as any,
    defaultValues: {},
  })
}

export const resetTransactionForm = (form: ReturnTransactionFormSchema) => {
  form.reset({
    ...defaultValueTransaction,
  })
}
