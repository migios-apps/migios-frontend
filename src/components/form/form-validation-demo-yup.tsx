import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import * as yup from "yup"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DateTimeInput,
  DateTimePicker,
  SimpleTimePicker,
} from "@/components/ui/date-picker"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormFieldItem,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import PhoneInput from "@/components/ui/phone-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectAsyncPaginate } from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  Select as SelectUI,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/animate-ui/components/radix/sheet"

// Schema validation dengan Yup
const formSchema = yup.object({
  username: yup
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .required("Username harus diisi"),
  email: yup.string().email("Email tidak valid").required("Email harus diisi"),
  password: yup
    .string()
    .min(8, "Password minimal 8 karakter")
    .required("Password harus diisi"),
  bio: yup
    .string()
    .required("Bio harus diisi")
    .max(500, "Bio maksimal 500 karakter"),
  age: yup
    .number()
    .min(18, "Umur minimal 18 tahun")
    .max(100, "Umur maksimal 100 tahun")
    .required("Umur harus diisi"),
  salary: yup.string().required("Gaji harus diisi"),
  country: yup.string().required("Negara harus dipilih"),
  city: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .test("required", "Kota harus dipilih", (value) => value !== null),
  remoteCity: yup
    .object({
      value: yup.string().required(),
      label: yup.string().required(),
    })
    .nullable()
    .test("required", "Kota remote harus dipilih", (value) => value !== null),
  language: yup.string().required("Bahasa harus dipilih"),
  datePicker: yup.date().required("Tanggal harus diisi"),
  appointmentDateTime: yup.date().optional(),
  meetingDateTime: yup.date().optional(),
  eventTime: yup.date().optional(),
  phone: yup
    .string()
    .min(10, "Nomor telepon harus valid")
    .required("Nomor telepon harus diisi"),
  otp: yup
    .string()
    .min(6, "Kode OTP harus 6 digit")
    .required("Kode OTP harus diisi"),
  terms: yup
    .boolean()
    .oneOf([true], "Anda harus menyetujui syarat dan ketentuan")
    .required(),
  notifications: yup
    .array()
    .of(yup.string().required())
    .min(1, "Pilih minimal 1 notifikasi")
    .required(),
  gender: yup
    .string()
    .oneOf(["male", "female", "other"])
    .required("Gender harus dipilih"),
  newsletter: yup.boolean().required(),
})

// Data untuk select options
const countries = [
  { value: "id", label: "Indonesia" },
  { value: "sg", label: "Singapura" },
  { value: "my", label: "Malaysia" },
  { value: "th", label: "Thailand" },
]

const cities = [
  { value: "jakarta", label: "Jakarta" },
  { value: "bandung", label: "Bandung" },
  { value: "surabaya", label: "Surabaya" },
  { value: "yogyakarta", label: "Yogyakarta" },
  { value: "bali", label: "Bali" },
]

const languages = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
]

const notificationItems = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "push", label: "Push Notification" },
  { id: "whatsapp", label: "WhatsApp" },
]

// Fungsi untuk load async options (simulasi API)
const loadOptions = async (
  search: string,
  _loadedOptions: unknown,
  additional: { page: number } | undefined
) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const page = additional?.page || 1

  const filteredCities = cities.filter((city) =>
    city.label.toLowerCase().includes(search.toLowerCase())
  )

  const hasMore = page < 2
  const sliceStart = (page - 1) * 10
  const sliceEnd = sliceStart + 10

  return {
    options: filteredCities.slice(sliceStart, sliceEnd),
    hasMore,
    additional: {
      page: page + 1,
    },
  }
}

export default function FormValidationDemo() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)

  const form = useForm({
    resolver: yupResolver(formSchema) as any,
    defaultValues: {
      username: "",
      email: "",
      password: "",
      bio: "",
      age: 18,
      salary: "",
      country: "",
      city: null,
      remoteCity: null,
      language: "",
      phone: "",
      otp: "",
      terms: false,
      notifications: [],
      gender: null,
      newsletter: false,
      datePicker: null,
      appointmentDateTime: null,
      meetingDateTime: null,
      eventTime: null,
    },
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)

    // Simulasi API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Form Data:", data)
    toast.success("Form berhasil disubmit!", {
      description: "Data telah disimpan ke sistem.",
    })

    setIsSubmitting(false)
  }

  const formComponents = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Text Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Text Inputs</CardTitle>
            <CardDescription>Input teks dengan validasi</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            {/* Using FormFieldItem - simplified */}
            <FormFieldItem
              control={form.control}
              name="username"
              label="Username"
              description="Username harus unik (3-20 karakter)"
              render={({ field }) => <Input placeholder="johndoe" {...field} />}
            />

            {/* Using FormFieldItem - no description */}
            <FormFieldItem
              control={form.control}
              name="email"
              label="Email"
              render={({ field }) => (
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              )}
            />

            <FormFieldItem
              control={form.control}
              name="password"
              label="Password"
              description="Password minimal 8 karakter"
              render={({ field }) => (
                <Input type="password" placeholder="********" {...field} />
              )}
            />

            <FormFieldItem
              control={form.control}
              name="phone"
              label="Nomor Telepon"
              render={({ field }) => (
                <PhoneInput {...field} defaultCountry="ID" />
              )}
            />

            <div className="md:col-span-2">
              <FormFieldItem
                control={form.control}
                name="bio"
                label="Bio"
                description="Maksimal 500 karakter"
                render={({ field }) => (
                  <Textarea
                    placeholder="Ceritakan tentang diri Anda..."
                    className="resize-none"
                    {...field}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Number Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Number Inputs</CardTitle>
            <CardDescription>Input angka dengan validasi</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormFieldItem
              control={form.control}
              name="age"
              label="Umur"
              description="Umur harus antara 18-100 tahun"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="18"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <FormFieldItem
              control={form.control}
              name="salary"
              label="Gaji (IDR)"
              render={({ field }) => (
                <InputCurrency
                  placeholder="Rp. 0"
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Select Components */}
        <Card>
          <CardHeader>
            <CardTitle>Select Components</CardTitle>
            <CardDescription>
              Berbagai jenis select dengan validasi
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormFieldItem
              control={form.control}
              name="country"
              label="Negara (Shadcn Select)"
              render={({ field, fieldState }) => (
                <SelectUI
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger aria-invalid={!!fieldState.error}>
                    <SelectValue placeholder="Pilih negara" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectUI>
              )}
            />

            <FormFieldItem
              control={form.control}
              name="city"
              label="Kota (React Select)"
              render={({ field, fieldState }) => (
                <Select
                  {...field}
                  options={cities}
                  placeholder="Pilih kota"
                  isClearable
                  error={!!fieldState.error}
                />
              )}
            />

            <FormFieldItem
              control={form.control}
              name="remoteCity"
              label="Kota Remote (Async Select)"
              description="Select dengan loading dari API"
              // invalid={Boolean(errors.city)}
              // errorMessage={errors.city?.message}
              render={({ field, fieldState }) => (
                <SelectAsyncPaginate
                  {...field}
                  loadOptions={loadOptions}
                  placeholder="Cari kota..."
                  isClearable
                  debounceTimeout={300}
                  additional={{ page: 1 }}
                  error={!!fieldState.error}
                />
              )}
            />

            <div className="flex flex-col gap-2">
              <FormFieldItem
                control={form.control}
                name="language"
                label="Bahasa (Combobox)"
                render={({ field }) => (
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? languages.find(
                              (language) => language.value === field.value
                            )?.label
                          : "Pilih bahasa"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Cari bahasa..." />
                        <CommandList>
                          <CommandEmpty>Bahasa tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {languages.map((language) => (
                              <CommandItem
                                value={language.label}
                                key={language.value}
                                onSelect={() => {
                                  form.setValue("language", language.value)
                                  setOpenCombobox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    language.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {language.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date & Special Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Special Inputs</CardTitle>
            <CardDescription>Input tanggal dan input khusus</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormFieldItem
              control={form.control}
              name="otp"
              label="Kode OTP"
              description="Masukkan 6 digit kode OTP"
              render={({ field, fieldState }) => (
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} aria-invalid={!!fieldState.error} />
                    <InputOTPSlot index={1} aria-invalid={!!fieldState.error} />
                    <InputOTPSlot index={2} aria-invalid={!!fieldState.error} />
                    <InputOTPSlot index={3} aria-invalid={!!fieldState.error} />
                    <InputOTPSlot index={4} aria-invalid={!!fieldState.error} />
                    <InputOTPSlot index={5} aria-invalid={!!fieldState.error} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          </CardContent>
        </Card>

        {/* DateTime Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>DateTime Inputs</CardTitle>
            <CardDescription>
              Input tanggal dan waktu dengan berbagai komponen
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormFieldItem
              control={form.control}
              name="datePicker"
              label="Date Picker"
              description="Pilih tanggal dengan picker"
              render={({ field, fieldState }) => (
                <DateTimePicker
                  value={
                    field.value ? (field.value as unknown as Date) : undefined
                  }
                  hideTime={true}
                  onChange={field.onChange}
                  clearable
                  error={!!fieldState.error}
                />
              )}
            />

            <FormFieldItem
              control={form.control}
              name="appointmentDateTime"
              label="DateTime Picker"
              description="Pilih tanggal dan waktu dengan picker"
              render={({ field, fieldState }) => (
                <DateTimePicker
                  value={
                    field.value ? (field.value as unknown as Date) : undefined
                  }
                  onChange={field.onChange}
                  use12HourFormat={false}
                  clearable
                  error={!!fieldState.error}
                />
              )}
            />

            <FormFieldItem
              control={form.control}
              name="meetingDateTime"
              label="DateTime Input"
              description="Input tanggal dan waktu dengan keyboard"
              render={({ field, fieldState }) => (
                <DateTimePicker
                  value={
                    field.value ? (field.value as unknown as Date) : undefined
                  }
                  onChange={field.onChange}
                  use12HourFormat={true}
                  timePicker={{ hour: true, minute: true }}
                  error={!!fieldState.error}
                  modal
                  renderTrigger={({ open, value, setOpen }) => (
                    <DateTimeInput
                      value={value}
                      onChange={(x) => !open && field.onChange(x)}
                      format="dd/MM/yyyy hh:mm aa"
                      disabled={open}
                      error={!!fieldState.error}
                      onCalendarClick={() => setOpen(!open)}
                    />
                  )}
                />
              )}
            />

            <FormFieldItem
              control={form.control}
              name="eventTime"
              label="Simple Time Picker"
              description="Pilih waktu saja (jam, menit, detik)"
              render={({ field, fieldState }) => (
                <SimpleTimePicker
                  value={
                    field.value ? (field.value as unknown as Date) : new Date()
                  }
                  onChange={field.onChange}
                  use12HourFormat={true}
                  error={!!fieldState.error}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Checkbox, Radio, Switch */}
        <Card>
          <CardHeader>
            <CardTitle>Checkbox, Radio & Switch</CardTitle>
            <CardDescription>Pilihan dengan validasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="notifications"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Notifikasi</FormLabel>
                    <FormDescription>
                      Pilih metode notifikasi yang Anda inginkan
                    </FormDescription>
                  </div>
                  {notificationItems.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="notifications"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-y-0 space-x-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={(field.value as string[])?.includes(
                                  item.id
                                )}
                                onCheckedChange={(checked) => {
                                  const currentValue = (field.value ||
                                    []) as string[]
                                  return checked
                                    ? field.onChange([...currentValue, item.id])
                                    : field.onChange(
                                        currentValue.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormFieldItem
                control={form.control}
                name="gender"
                label="Jenis Kelamin"
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ? String(field.value) : undefined}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-y-0 space-x-3">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">Laki-laki</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-y-0 space-x-3">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">Perempuan</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-y-0 space-x-3">
                      <FormControl>
                        <RadioGroupItem value="o" />
                      </FormControl>
                      <FormLabel className="font-normal">Lainnya</FormLabel>
                    </FormItem>
                  </RadioGroup>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="newsletter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Newsletter</FormLabel>
                    <FormDescription>
                      Terima update dan berita terbaru via email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Saya menyetujui syarat dan ketentuan
                      </FormLabel>
                      <FormDescription>
                        Anda harus menyetujui untuk melanjutkan
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Form
          </Button>
        </div>
      </form>
    </Form>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Form Validation Demo (Yup)</h1>
        <p className="text-muted-foreground mt-2">
          Contoh lengkap form validation menggunakan React Hook Form, Yup, dan
          semua komponen Shadcn UI
        </p>
      </div>

      {formComponents}

      <Button type="button" variant="outline" onClick={() => form.reset()}>
        Reset
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open Sheet (Floating)</Button>
        </SheetTrigger>
        <SheetContent floating>
          <SheetHeader>
            <SheetTitle>Floating Sheet</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <ScrollArea className="h-[calc(100vh-10rem)]">
              {formComponents}
            </ScrollArea>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog (Scroll Body)</Button>
        </DialogTrigger>
        <DialogContent scrollBody>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">{formComponents}</div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
