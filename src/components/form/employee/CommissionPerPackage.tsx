import React from "react"
import { useFieldArray } from "react-hook-form"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { EmployeeCommissionPackage } from "@/services/api/@types/employee"
import { apiGetEmployeeCommissionByPackage } from "@/services/api/EmployeeService"
import { useParams } from "react-router"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import InputDebounce from "@/components/ui/input-debounce"
import { InputPercentNominal } from "@/components/ui/input-percent-nominal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/animate-ui/components/radix/sheet"
import { ReturnEmployeeSchema } from "./employeeValidation"

type CommissionPerPackageProps = {
  formProps: ReturnEmployeeSchema
  open: boolean
  onClose: () => void
}

const CommissionPerPackage: React.FC<CommissionPerPackageProps> = ({
  formProps,
  open,
  onClose,
}) => {
  const { id } = useParams()
  const {
    control,
    watch,
    formState: { errors },
  } = formProps

  const watchData = watch()
  const { replace } = useFieldArray({
    control,
    name: "commission_package",
  })

  const [tempItems, setTempItems] = React.useState<any[]>([])

  React.useEffect(() => {
    if (open) {
      const currentValues = formProps.getValues("commission_package") || []
      setTempItems(JSON.parse(JSON.stringify(currentValues)))
    }
  }, [open, formProps])

  const [tableData, setTableData] = React.useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const code = id || "all"

  const {
    data,
    isFetchingNextPage,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.commissionPackage, tableData, code],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetEmployeeCommissionByPackage(`${code}`, {
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort: [
                {
                  sort_column: "package_id",
                  sort_type: "desc",
                },
                {
                  sort_column: "sales",
                  sort_type: "desc",
                },
              ],
            }),
        ...(tableData.query === ""
          ? {}
          : {
              search: [
                {
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ],
            }),
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const packageList = React.useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )

  React.useEffect(() => {
    if (data && open) {
      setTempItems((prev) => {
        const newItems = [...prev]
        let hasChange = false
        data.pages.forEach((page) => {
          page.data.data.forEach((item) => {
            if (
              item.sales > 0 &&
              !newItems.find((f) => f.package_id === item.package_id)
            ) {
              newItems.push({
                package_id: item.package_id,
                sales: item.sales,
                sales_type: item.sales_type,
                commission_type: item.commission_type,
              })
              hasChange = true
            }
          })
        })
        if (hasChange) {
          replace(newItems)
        }
        return hasChange ? newItems : prev
      })
    }
  }, [data, open, replace])

  const handleCommissionChange = (
    pkg: EmployeeCommissionPackage,
    value: number | string | null,
    type: "percent" | "nominal"
  ) => {
    const val = value === null || value === "" ? 0 : Number(value)
    const index = tempItems.findIndex((f) => f.package_id === pkg.package_id)

    const newItems = [...tempItems]
    if (index !== -1) {
      newItems[index] = {
        ...newItems[index],
        sales: val,
        sales_type: type,
      }
    } else {
      newItems.push({
        package_id: pkg.package_id,
        sales: val,
        sales_type: type,
        commission_type: pkg.commission_type,
      })
    }
    setTempItems(newItems)
  }

  const isDefaultEnabled =
    watchData.earnings?.default_sales_package_commission === 1

  const handleSave = () => {
    const validItems = tempItems.filter((i) => i.sales > 0)
    replace(validItems)
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent floating className="gap-0 sm:max-w-xl" autoFocus={false}>
        <Form {...formProps}>
          <SheetHeader>
            <SheetTitle>Komisi per paket dan plan</SheetTitle>
            <SheetDescription />
          </SheetHeader>
          <div className="min-w-0 flex-1 overflow-hidden px-4">
            <div className="grid min-w-0 grid-cols-1 space-y-6 pb-4">
              <FormFieldItem
                control={control}
                name="earnings.default_sales_package_commission_amount"
                label={
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <FormLabel></FormLabel>
                    <FormFieldItem
                      control={control}
                      name="earnings.default_sales_package_commission"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-sm">
                            Terapkan untuk semua paket dan plan
                          </span>
                          <Switch
                            tabIndex={undefined}
                            autoFocus={false}
                            checked={field.value === 1}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : 0)
                            }}
                          />
                        </div>
                      )}
                    />
                  </div>
                }
                invalid={
                  Boolean(
                    errors.earnings?.default_sales_package_commission_amount
                  ) ||
                  Boolean(
                    errors.earnings?.default_sales_package_commission_type
                  )
                }
                errorMessage={
                  errors.earnings?.default_sales_package_commission_amount
                    ?.message ||
                  errors.earnings?.default_sales_package_commission_type
                    ?.message
                }
                render={({ field, fieldState }) => {
                  return (
                    <InputPercentNominal
                      value={field.value}
                      inputProps={{
                        tabIndex: undefined,
                      }}
                      disabled={
                        watchData.earnings?.default_sales_package_commission ===
                        0
                      }
                      onChange={(val) => {
                        const value =
                          val === null || val === "" ? 0 : Number(val)
                        field.onChange(value)
                      }}
                      type={
                        (watchData.earnings
                          ?.default_sales_package_commission_type as
                          | "percent"
                          | "nominal") || "nominal"
                      }
                      onTypeChange={(type) => {
                        formProps.setValue(
                          "earnings.default_sales_package_commission_type",
                          type as any
                        )
                      }}
                      error={!!fieldState.error}
                      placeholderPercent="10%"
                      placeholderNominal="Rp. 0"
                    />
                  )
                }}
              />

              <div className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <InputDebounce
                    placeholder="Cari paket..."
                    className="w-full sm:max-w-xs"
                    disabled={isDefaultEnabled}
                    handleOnchange={(value) => {
                      setTableData({
                        ...tableData,
                        query: value,
                        pageIndex: 1,
                      })
                    }}
                  />
                </div>

                <ScrollArea className="h-[calc(100vh-18.5rem)]">
                  <div
                    className={cn(
                      "grid grid-cols-1 gap-4",
                      isDefaultEnabled && "pointer-events-none opacity-50"
                    )}
                  >
                    {packageList.map((pkg) => {
                      const tempItem = tempItems.find(
                        (f) => f.package_id === pkg.package_id
                      )
                      const currentValue = tempItem ? tempItem.sales : pkg.sales
                      const currentType = (
                        tempItem ? tempItem.sales_type : pkg.sales_type
                      ) as "percent" | "nominal"

                      return (
                        <Card
                          key={pkg.package_id}
                          className="hover:border-primary/50 gap-1 p-4 transition-all"
                        >
                          <CardHeader className="gap-0 p-0">
                            <CardTitle className="text-base">
                              {pkg.name}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-sm capitalize">
                              {pkg.type === "class" && pkg.classes?.length > 0
                                ? `Kelas: ${pkg.classes.map((c) => c.name).join(", ")}`
                                : pkg.type}
                            </CardDescription>
                            <CardAction className="text-right">
                              <span className="text-foreground text-sm font-medium">
                                {pkg.fprice}
                              </span>
                            </CardAction>
                          </CardHeader>
                          <CardContent className="p-0">
                            <InputPercentNominal
                              value={currentValue}
                              type={currentType}
                              disabled={isDefaultEnabled}
                              onChange={(val) => {
                                handleCommissionChange(pkg, val, currentType)
                              }}
                              onTypeChange={(type) =>
                                handleCommissionChange(pkg, currentValue, type)
                              }
                              placeholderPercent="0%"
                              placeholderNominal="Rp 0"
                            />
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {(!isLoading && packageList.length === 0) || error ? (
                    <div className="text-muted-foreground flex flex-col items-center justify-center py-10">
                      <span>Tidak ada data ditemukan</span>
                    </div>
                  ) : null}

                  {hasNextPage && (
                    <div className="mt-4 flex justify-center pb-6">
                      <Button
                        variant="outline"
                        type="button"
                        disabled={isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                        className="w-full px-10 sm:w-auto"
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
          <SheetFooter className="px-4 py-3 sm:py-2">
            <div className="flex items-center justify-end">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={handleSave}
              >
                Simpan
              </Button>
            </div>
          </SheetFooter>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default CommissionPerPackage
