import React from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Filter } from "@/services/api/@types/api"
import { apiGetPackageList } from "@/services/api/PackageService"
import { apiGetProductList } from "@/services/api/ProductService"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Select } from "@/components/ui/react-select"

type OptionType = { label: string; value: number }

type VoucherScopePickerProps = {
  enabled: boolean
  packageIds: number[]
  productIds: number[]
  onChangePackageIds: (ids: number[]) => void
  onChangeProductIds: (ids: number[]) => void
  errorMessage?: string
}

const searchFilter = (search: string): Filter[] =>
  search === ""
    ? []
    : [
        {
          search_operator: "and",
          search_column: "name",
          search_condition: "like",
          search_text: search,
        },
      ]

const VoucherScopePicker: React.FC<VoucherScopePickerProps> = ({
  enabled,
  packageIds,
  productIds,
  onChangePackageIds,
  onChangeProductIds,
  errorMessage,
}) => {
  const [packageSearch, setPackageSearch] = React.useState("")
  const [productSearch, setProductSearch] = React.useState("")

  const { data: packages } = useInfiniteQuery({
    queryKey: [QUERY_KEY.packages, "voucher-scope", packageSearch],
    initialPageParam: 1,
    enabled,
    queryFn: async ({ pageParam }) =>
      apiGetPackageList({
        page: pageParam,
        per_page: 200,
        sort_column: "name",
        sort_type: "asc",
        search: searchFilter(packageSearch),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const { data: products } = useInfiniteQuery({
    queryKey: [QUERY_KEY.products, "voucher-scope", productSearch],
    initialPageParam: 1,
    enabled,
    queryFn: async ({ pageParam }) =>
      apiGetProductList({
        page: pageParam,
        per_page: 200,
        sort_column: "name",
        sort_type: "asc",
        search: searchFilter(productSearch),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const packageOptions: OptionType[] = React.useMemo(
    () =>
      (packages?.pages.flatMap((page) => page.data.data) ?? []).map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [packages]
  )

  const productOptions: OptionType[] = React.useMemo(
    () =>
      (products?.pages.flatMap((page) => page.data.data) ?? []).map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [products]
  )

  const selectedPackages = packageOptions.filter((option) =>
    packageIds.includes(option.value)
  )
  const selectedProducts = productOptions.filter((option) =>
    productIds.includes(option.value)
  )

  return (
    <div className="space-y-4 rounded-md border p-4">
      <FormItem>
        <FormLabel>Paket yang Berlaku</FormLabel>
        <FormControl>
          <Select
            isMulti
            placeholder="Pilih paket"
            options={packageOptions}
            value={selectedPackages}
            onInputChange={(value: string) => setPackageSearch(value)}
            onChange={(value) =>
              onChangePackageIds(
                ((value as unknown as OptionType[]) ?? []).map(
                  (item) => item.value
                )
              )
            }
          />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>Produk yang Berlaku</FormLabel>
        <FormControl>
          <Select
            isMulti
            placeholder="Pilih produk"
            options={productOptions}
            value={selectedProducts}
            onInputChange={(value: string) => setProductSearch(value)}
            onChange={(value) =>
              onChangeProductIds(
                ((value as unknown as OptionType[]) ?? []).map(
                  (item) => item.value
                )
              )
            }
          />
        </FormControl>
      </FormItem>

      <FormDescription>
        Diskon hanya dihitung dari paket dan produk yang dipilih di atas.
        Minimal pembelian juga dinilai dari item tersebut, bukan dari total
        keranjang.
      </FormDescription>

      {errorMessage ? <FormMessage>{errorMessage}</FormMessage> : null}
    </div>
  )
}

export default VoucherScopePicker
