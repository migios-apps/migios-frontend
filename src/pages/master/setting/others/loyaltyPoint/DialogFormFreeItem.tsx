import React, { useState } from "react"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { Filter } from "@/services/api/@types/api"
import { CreateLoyaltyType } from "@/services/api/@types/settings/loyalty"
import { apiGetPackageList } from "@/services/api/PackageService"
import { apiGetProductList } from "@/services/api/ProductService"
import {
  apiCreateLoyalty,
  apiDeleteLoyalty,
  apiUpdateLoyalty,
} from "@/services/api/settings/LoyaltyService"
import {
  Archive,
  BookOpen,
  Filter as FilterIcon,
  Minus,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import useInfiniteScroll from "@/utils/hooks/useInfiniteScroll"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputDebounce from "@/components/ui/input-debounce"
import { InputGroup, InputGroupText } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreateLoyaltySchema,
  ReturnLoyaltyFormSchema,
  resetLoyaltyForm,
} from "./validation"

type DialogFormFreeItemProps = {
  formProps: ReturnLoyaltyFormSchema
  type: "create" | "update"
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DialogFormFreeItem: React.FC<DialogFormFreeItemProps> = ({
  type,
  open,
  onClose,
  formProps,
  onSuccess,
}) => {
  const queryClient = useQueryClient()
  const [showTab, setShowTab] = useState(false)
  const [tab, setTab] = useState<"package" | "product">("package")
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const { control, handleSubmit, watch } = formProps

  const watchData = watch()

  const handleClose = () => {
    setShowTab(false)
    resetLoyaltyForm(formProps)
    onClose()
  }

  const handlePrefecth = () => {
    onSuccess?.()
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.loyaltyList] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateLoyaltyType) => apiCreateLoyalty(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateLoyaltyType) =>
      apiUpdateLoyalty(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteLoyalty(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefecth,
  })

  const handleDelete = () => {
    deleteItem.mutate(watchData.id as number)
    setConfirmDelete(false)
    handleClose()
  }

  const handleFormSubmit = (data: CreateLoyaltySchema) => {
    if (type === "update") {
      update.mutate({
        name: data.name as string,
        type: "free_item",
        points_required: data.points_required,
        enabled: data.enabled,
        reward_items: data.reward_items as any[],
      })
      return
    }
    if (type === "create") {
      create.mutate({
        name: data.name as string,
        type: "free_item",
        points_required: data.points_required,
        enabled: data.enabled,
        reward_items: data.reward_items as any[],
      })
      return
    }
  }

  const {
    data: packages,
    fetchNextPage: fetchNextPagePackages,
    hasNextPage: hasNextPagePackages,
    isFetchingNextPage: isFetchingNextPagePackages,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.packages, search],
    initialPageParam: 1,
    enabled: !!open,
    queryFn: async ({ pageParam }) => {
      const res = await apiGetPackageList({
        page: pageParam,
        per_page: 3,
        sort_column: "id",
        sort_type: "desc",
        search: [
          {
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
          ...((search === ""
            ? []
            : [
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: search,
                },
              ]) as Filter[]),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const {
    data: products,
    fetchNextPage: fetchNextPageProducts,
    hasNextPage: hasNextPageProducts,
    isFetchingNextPage: isFetchingNextPageProducts,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.products, search],
    initialPageParam: 1,
    enabled: !!open,
    queryFn: async ({ pageParam }) => {
      const res = await apiGetProductList({
        page: pageParam,
        per_page: 3,
        sort_column: "id",
        sort_type: "desc",
        search: [
          ...((search === ""
            ? []
            : [
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: search,
                },
              ]) as Filter[]),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listPackages = React.useMemo(
    () => (packages ? packages.pages.flatMap((page) => page.data.data) : []),
    [packages]
  )
  const totalPackage = packages?.pages[0]?.data.meta.total

  const listProducts = React.useMemo(
    () => (products ? products.pages.flatMap((page) => page.data.data) : []),
    [products]
  )
  const totalProduct = products?.pages[0]?.data.meta.total

  const { containerRef: containerRefPackage } = useInfiniteScroll({
    offset: "100px",
    shouldStop: !hasNextPagePackages || !packages || listPackages.length === 0,
    onLoadMore: async () => {
      if (hasNextPagePackages && packages && listPackages.length > 0) {
        await fetchNextPagePackages()
      }
    },
  })

  const { containerRef: containerRefProduct } = useInfiniteScroll({
    offset: "100px",
    shouldStop: !hasNextPageProducts || !products || listProducts.length === 0,
    onLoadMore: async () => {
      if (hasNextPageProducts && products && listProducts.length > 0) {
        await fetchNextPageProducts()
      }
    },
  })

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Tambah Item Gratis" : "Ubah Item Gratis"}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <Form {...formProps}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-4"
            >
              <FormFieldItem
                control={control}
                name="name"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel>Name</FormLabel>
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder="Name"
                      {...field}
                    />
                  </div>
                )}
              />

              <FormFieldItem
                control={control}
                name="points_required"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel>Point yang diperlukan</FormLabel>
                    <InputGroup>
                      <Input
                        type="number"
                        autoComplete="off"
                        placeholder="0 Point"
                        {...field}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === "" ? 0 : Number(e.target.value)
                          field.onChange(value)
                        }}
                      />
                      <InputGroupText>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={field.value <= 0}
                          onClick={() => {
                            const newValue = Number(field.value) - 1
                            if (newValue >= 1) {
                              field.onChange(newValue)
                            }
                          }}
                        >
                          <Minus className="size-4" />
                        </Button>
                      </InputGroupText>
                      <InputGroupText>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newValue = Number(field.value) + 1
                            field.onChange(newValue)
                          }}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </InputGroupText>
                    </InputGroup>
                  </div>
                )}
              />

              <FormFieldItem
                control={control}
                name="reward_items"
                render={() => (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <InputDebounce
                        placeholder="Cari package dan produk..."
                        handleOnchange={(value) => {
                          setSearch(value)
                        }}
                        onFocus={() => setShowTab(true)}
                      />
                      {showTab && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowTab(false)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              />

              <div className="flex flex-col gap-3">
                {showTab ? (
                  <Tabs
                    value={tab}
                    onValueChange={(value) =>
                      setTab(value as "package" | "product")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="package" className="gap-2">
                        <FilterIcon className="size-4" />
                        Package Plan
                      </TabsTrigger>
                      <TabsTrigger value="product" className="gap-2">
                        <Package className="size-4" />
                        Product
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="package" className="mt-4">
                      <div
                        ref={containerRefPackage}
                        className="border-border max-h-56 overflow-y-auto rounded-md border"
                      >
                        {listPackages.map((i, index) => {
                          const isExist = (
                            formProps.getValues("reward_items") || []
                          ).some((item) => item.package_id === i.id)
                          return (
                            <div
                              key={index}
                              className={cn(
                                "border-border flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0",
                                isExist
                                  ? "bg-primary/5 hover:bg-primary/10"
                                  : "hover:bg-muted/50"
                              )}
                              onClick={() => {
                                const currentItems =
                                  formProps.getValues("reward_items") || []
                                const existingItemIndex =
                                  currentItems.findIndex(
                                    (item) => item.package_id === i.id
                                  )

                                if (existingItemIndex === -1) {
                                  formProps.setValue("reward_items", [
                                    ...currentItems,
                                    {
                                      package_id: i.id,
                                      product_id: null,
                                      quantity: 1,
                                      name: i.name,
                                      foriginal_price: i.fprice,
                                      fprice: i.fprice,
                                      price: i.price,
                                    },
                                  ])
                                }
                                setShowTab(false)
                                formProps.clearErrors("reward_items")
                              }}
                            >
                              <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                                <BookOpen className="text-muted-foreground size-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-foreground text-sm font-medium">
                                  {i.name}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {i.fprice}
                                </div>
                              </div>
                              {isExist && (
                                <span className="text-primary font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                          )
                        })}
                        {isFetchingNextPagePackages &&
                          Array.from({ length: 3 }, (_, i) => i + 1).map(
                            (_, i) => (
                              <Skeleton
                                key={i}
                                className="h-[60px] rounded-md"
                              />
                            )
                          )}
                        {totalPackage === listPackages.length &&
                          listPackages.length > 0 && (
                            <p className="text-muted-foreground py-4 text-center text-sm">
                              Semua item telah dimuat
                            </p>
                          )}
                      </div>
                    </TabsContent>
                    <TabsContent value="product" className="mt-4">
                      <div
                        ref={containerRefProduct}
                        className="border-border max-h-56 overflow-y-auto rounded-md border"
                      >
                        {listProducts.map((i, index) => {
                          const isExist = (
                            formProps.getValues("reward_items") || []
                          ).some((item) => item.product_id === i.id)
                          return (
                            <div
                              key={index}
                              className={cn(
                                "border-border flex cursor-pointer items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0",
                                isExist
                                  ? "bg-primary/5 hover:bg-primary/10"
                                  : "hover:bg-muted/50"
                              )}
                              onClick={() => {
                                const currentItems =
                                  formProps.getValues("reward_items") || []
                                const existingItemIndex =
                                  currentItems.findIndex(
                                    (item) => item.product_id === i.id
                                  )

                                if (existingItemIndex === -1) {
                                  formProps.setValue("reward_items", [
                                    ...currentItems,
                                    {
                                      package_id: null,
                                      product_id: i.id,
                                      quantity: 1,
                                      name: i.name,
                                      foriginal_price: i.fprice,
                                      fprice: i.fprice,
                                      price: i.price,
                                    },
                                  ])
                                }
                                setShowTab(false)
                                formProps.clearErrors("reward_items")
                              }}
                            >
                              <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                                <Package className="text-muted-foreground size-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-foreground text-sm font-medium">
                                  {i.name}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {i.fprice}
                                </div>
                              </div>
                              {isExist && (
                                <span className="text-primary font-bold">
                                  ✓
                                </span>
                              )}
                            </div>
                          )
                        })}
                        {isFetchingNextPageProducts &&
                          Array.from({ length: 3 }, (_, i) => i + 1).map(
                            (_, i) => (
                              <Skeleton
                                key={i}
                                className="h-[60px] rounded-md"
                              />
                            )
                          )}
                        {totalProduct === listProducts.length &&
                          listProducts.length > 0 && (
                            <p className="text-muted-foreground py-4 text-center text-sm">
                              Semua item telah dimuat
                            </p>
                          )}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col gap-2">
                    {watchData.reward_items?.map((i, index) => {
                      return (
                        <div
                          key={index}
                          className="border-border flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                            {i.product_id !== null ? (
                              <Package className="text-muted-foreground size-4" />
                            ) : i.package_id !== null ? (
                              <BookOpen className="text-muted-foreground size-4" />
                            ) : (
                              <Archive className="text-muted-foreground size-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-foreground text-sm font-medium">
                              {i.name}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {i.foriginal_price}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const currentItems =
                                  formProps.getValues("reward_items") || []
                                const itemIndex = currentItems.findIndex(
                                  (item) =>
                                    (item.product_id === i.product_id &&
                                      item.product_id !== null) ||
                                    (item.package_id === i.package_id &&
                                      item.package_id !== null)
                                )

                                if (itemIndex !== -1) {
                                  const newQty =
                                    currentItems[itemIndex].quantity - 1

                                  if (newQty <= 0) {
                                    const newItems = [...currentItems]
                                    newItems.splice(itemIndex, 1)
                                    formProps.setValue("reward_items", newItems)
                                  } else {
                                    const newItems = [...currentItems]
                                    newItems[itemIndex] = {
                                      ...newItems[itemIndex],
                                      quantity: newQty,
                                    }
                                    formProps.setValue("reward_items", newItems)
                                  }
                                }
                              }}
                            >
                              <Minus className="size-4" />
                            </Button>

                            <span className="text-foreground mx-2 font-medium">
                              {i.quantity}
                            </span>

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const currentItems =
                                  formProps.getValues("reward_items") || []
                                const itemIndex = currentItems.findIndex(
                                  (item) =>
                                    (item.product_id === i.product_id &&
                                      item.product_id !== null) ||
                                    (item.package_id === i.package_id &&
                                      item.package_id !== null)
                                )

                                if (itemIndex !== -1) {
                                  const newQty =
                                    currentItems[itemIndex].quantity + 1
                                  const newItems = [...currentItems]
                                  newItems[itemIndex] = {
                                    ...newItems[itemIndex],
                                    quantity: newQty,
                                  }
                                  formProps.setValue("reward_items", newItems)
                                }
                              }}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    {watchData.reward_items?.length === 0 && (
                      <div className="bg-muted flex flex-col items-center justify-center rounded-lg py-10 text-center">
                        <div className="text-muted-foreground mb-4 text-5xl">
                          <Search className="size-16" />
                        </div>
                        <h6 className="text-foreground text-lg font-medium">
                          Belum ada item gratis
                        </h6>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Cari item yang ingin anda tambahkan sebagai item
                          gratis
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                {type === "update" ? (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Hapus
                  </Button>
                ) : (
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Loyalty Free Item"
        description="Are you sure want to delete this loyalty free item?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default DialogFormFreeItem
