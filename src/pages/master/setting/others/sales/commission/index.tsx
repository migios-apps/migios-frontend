import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CommissionSettingType,
  CreateCommissionSetting,
} from "@/services/api/@types/settings/commissions"
import {
  apiCreateCommissionSetting,
  apiGetCommissionList,
  apiUpdateCommissionSetting,
} from "@/services/api/settings/commission"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormFieldItem,
  FormLabel,
  FormControl,
  FormItem,
  FormDescription,
} from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreateCommissionSchema, useCommissionForm } from "./validation"

const LoadingCommissionSetting = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="gap-2 p-4">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-muted/50 space-y-3 rounded-lg border p-2"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const CommissionSetting = () => {
  const [formType, setFormType] = React.useState<"create" | "update">("update")
  const formProps = useCommissionForm()
  const queryClient = useQueryClient()
  const club = useSessionUser((state) => state.club)
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = formProps
  const watchData = watch()

  const { isLoading } = useQuery({
    queryKey: [QUERY_KEY.commissionSetting],
    queryFn: async () => {
      const res = await apiGetCommissionList()
      const commissionSetting = res.data[0] as CommissionSettingType | undefined
      if (commissionSetting) {
        setFormType("update")
        formProps.setValue("id", commissionSetting.id)
        formProps.setValue("club_id", commissionSetting.club_id)
        formProps.setValue(
          "commission_sales_by_item_before_tax",
          commissionSetting.commission_sales_by_item_before_tax
        )
        formProps.setValue(
          "commission_sales_by_item_before_discount",
          commissionSetting.commission_sales_by_item_before_discount
        )
        formProps.setValue(
          "commission_prorate_by_total_sales",
          commissionSetting.commission_prorate_by_total_sales
        )
        formProps.setValue("service", commissionSetting.service)
        formProps.setValue("session", commissionSetting.session)
        formProps.setValue("class", commissionSetting.class)
      }
      return res
    },
  })

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.commissionSetting] })
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateCommissionSetting) =>
      apiCreateCommissionSetting(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateCommissionSetting) =>
      apiUpdateCommissionSetting(Number(watchData.id), data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<CreateCommissionSchema> = (data) => {
    if (formType === "update") {
      update.mutate({
        club_id: club?.id as number,
        commission_sales_by_item_before_tax:
          data.commission_sales_by_item_before_tax,
        commission_sales_by_item_before_discount:
          data.commission_sales_by_item_before_discount,
        commission_prorate_by_total_sales:
          data.commission_prorate_by_total_sales,
        service: data.service,
        session: data.session,
        class: data.class,
      })
      return
    }
    if (formType === "create") {
      create.mutate({
        club_id: club?.id as number,
        commission_sales_by_item_before_tax:
          data.commission_sales_by_item_before_tax,
        commission_sales_by_item_before_discount:
          data.commission_sales_by_item_before_discount,
        commission_prorate_by_total_sales:
          data.commission_prorate_by_total_sales,
        service: data.service,
        session: data.session,
        class: data.class,
      })
      return
    }
  }

  if (isLoading) return <LoadingCommissionSetting />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="gap-2 p-4">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Pengaturan Komisi
              </CardTitle>
              <CardDescription>
                Pengaturan cara perhitungan komisi penjualan dan komisi default
                untuk layanan, sesi, dan kelas. Jika tidak ada komisi yang
                diatur di level staff atau level item, akan menggunakan komisi
                default ini.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-3">
                {/* Commission Sales Settings */}
                <div className="bg-muted/50 rounded-lg border p-4">
                  <FormLabel className="text-base font-semibold">
                    Pengaturan Komisi Penjualan
                  </FormLabel>
                  <p className="text-muted-foreground mb-2 text-sm">
                    Pengaturan cara perhitungan komisi penjualan berdasarkan
                    item transaksi.
                  </p>

                  {/* Before Tax */}
                  <FormFieldItem
                    control={control}
                    name="commission_sales_by_item_before_tax"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(
                      errors.commission_sales_by_item_before_tax
                    )}
                    errorMessage={
                      errors.commission_sales_by_item_before_tax?.message
                    }
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Hitung Komisi Item Sebelum Pajak
                          </FormLabel>
                          <FormDescription>
                            Komisi dihitung berdasarkan subtotal item sebelum
                            pajak diterapkan
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value === 1)}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : 0)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Before Discount */}
                  <FormFieldItem
                    control={control}
                    name="commission_sales_by_item_before_discount"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(
                      errors.commission_sales_by_item_before_discount
                    )}
                    errorMessage={
                      errors.commission_sales_by_item_before_discount?.message
                    }
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Hitung Komisi Item Sebelum Diskon
                          </FormLabel>
                          <FormDescription>
                            Komisi dihitung berdasarkan subtotal item sebelum
                            diskon item diterapkan
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value === 1)}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : 0)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Prorate by Total Sales */}
                  <FormFieldItem
                    control={control}
                    name="commission_prorate_by_total_sales"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(errors.commission_prorate_by_total_sales)}
                    errorMessage={
                      errors.commission_prorate_by_total_sales?.message
                    }
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Prorate Komisi Berdasarkan Total Penjualan
                          </FormLabel>
                          <FormDescription>
                            Jika aktif, komisi akan dihitung dan dicatat secara
                            proporsional untuk setiap item berdasarkan nilai
                            item tersebut terhadap total penjualan setelah
                            dikurangi diskon global dari transaksi.
                          </FormDescription>

                          <div className="mt-4">
                            <strong>Contoh Perhitungan:</strong>
                            <div className="border-border mt-2 overflow-hidden rounded-md border text-[10px] leading-tight md:text-xs">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50 hover:bg-muted/50 text-muted-foreground tracking-wider uppercase">
                                    <TableHead className="text-xs font-bold">
                                      Item
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold">
                                      Harga
                                    </TableHead>
                                    <TableHead className="text-center text-xs font-bold">
                                      Proporsional Disc
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold">
                                      Dasar Komisi
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-bold">
                                      Komisi (10%)
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow className="hover:bg-transparent">
                                    <TableCell>Barang A</TableCell>
                                    <TableCell className="text-right text-xs">
                                      10.000,00
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-center text-xs">
                                      (10rb / 17rb) x 3rb = 1.764,71
                                    </TableCell>
                                    <TableCell className="text-right text-xs">
                                      8.235,29
                                      <div className="text-muted-foreground text-xs font-normal">
                                        (10.000 - 1.764,71)
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-primary text-right text-xs font-bold">
                                      823,53
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="hover:bg-transparent">
                                    <TableCell>Barang B</TableCell>
                                    <TableCell className="text-right text-xs">
                                      7.000,00
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-center text-xs">
                                      (7rb / 17rb) x 3rb = 1.235,29
                                    </TableCell>
                                    <TableCell className="text-right text-xs">
                                      5.764,71
                                      <div className="text-muted-foreground text-xs font-normal">
                                        (7.000 - 1.235,29)
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-primary text-right text-xs font-bold">
                                      576,47
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableCell className="text-xs font-bold italic">
                                      SUB TOTAL
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-bold">
                                      17.000,00
                                    </TableCell>
                                    <TableCell
                                      colSpan={3}
                                      className="p-0 text-xs"
                                    ></TableCell>
                                  </TableRow>
                                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableCell className="text-muted-foreground text-right text-xs font-medium">
                                      Diskon
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-bold">
                                      3.000,00
                                    </TableCell>
                                    <TableCell
                                      colSpan={3}
                                      className="p-0 text-xs"
                                    ></TableCell>
                                  </TableRow>
                                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableCell className="text-muted-foreground text-right text-xs font-medium">
                                      Total
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-bold">
                                      14.000,00
                                    </TableCell>
                                    <TableCell
                                      colSpan={3}
                                      className="p-0 text-xs"
                                    ></TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                              <div className="bg-accent/30 space-y-1 border-t p-2">
                                <p className="text-muted-foreground text-xs italic">
                                  * Rumus Dasar: (Harga Item / Sub Total) x
                                  Total Disc.
                                  <br />
                                  * Komisi Akhir: Persentase Komisi (%) x Kolom
                                  Komisi.
                                  <br />
                                  Contoh: Jika set komisi 10% untuk barang A
                                  pada karyawan, maka Barang A = 10% x 8.235,29
                                  = 823,53.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value === 1)}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : 0)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Service */}
                <div className="bg-muted/50 space-y-3 rounded-lg border p-2">
                  <FormFieldItem
                    control={control}
                    name="service"
                    label={<FormLabel className="text-base">Layanan</FormLabel>}
                    invalid={Boolean(errors.service)}
                    errorMessage={errors.service?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    Atur nominal komisi yang diterima staff untuk setiap{" "}
                    <strong>Layanan (Service)</strong> yang dikerjakan. Komisi
                    ini bersifat nominal tetap per layanan.
                  </p>
                </div>
                {/* Session */}
                <div className="bg-muted/50 space-y-3 rounded-lg border p-2">
                  <FormFieldItem
                    control={control}
                    name="session"
                    label={
                      <FormLabel className="text-base">
                        Per Sesi Latihan
                      </FormLabel>
                    }
                    invalid={Boolean(errors.session)}
                    errorMessage={errors.session?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    Atur nominal komisi yang diterima trainer untuk setiap{" "}
                    <strong>Sesi Latihan (Personal Training)</strong> yang
                    diselesaikan. Komisi ini bersifat nominal tetap per sesi.
                  </p>
                </div>
                {/* Class */}
                <div className="bg-muted/50 space-y-3 rounded-lg border p-2">
                  <FormFieldItem
                    control={control}
                    name="class"
                    label={
                      <FormLabel className="text-base">Per Kelas</FormLabel>
                    }
                    invalid={Boolean(errors.class)}
                    errorMessage={errors.class?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    Atur nominal komisi yang diterima instruktur untuk setiap{" "}
                    <strong>Kelas (Group Class)</strong> yang diajar. Komisi ini
                    bersifat nominal tetap per kelas.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommissionSetting
