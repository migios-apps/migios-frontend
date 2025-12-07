import React from "react"
import { ArrowRight, Image as ImageIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import PhoneInput from "@/components/ui/phone-input"
import { Textarea } from "@/components/ui/textarea"
import { ReturnClubFormSchema } from "./validation"

type PropsType = {
  onNext?: () => void
  formProps: ReturnClubFormSchema
}

const Step1: React.FC<PropsType> = ({ onNext, formProps }) => {
  const {
    control,
    formState: { errors },
  } = formProps

  const [avatarImg, setAvatarImg] = React.useState<string | null>(null)

  // const onFileUpload = (files: File[]) => {
  //   if (files.length > 0) {
  //     setAvatarImg(URL.createObjectURL(files[0]))
  //   }
  // }

  // const beforeUpload = (files: FileList | null) => {
  //   let valid: string | boolean = true

  //   const allowedFileType = ["image/jpeg", "image/png"]
  //   if (files) {
  //     for (const file of files) {
  //       if (!allowedFileType.includes(file.type)) {
  //         valid = "Please upload a .jpeg or .png file!"
  //       }
  //     }
  //   }

  //   return valid
  // }
  return (
    <Form {...formProps}>
      <div className="flex w-full max-w-120 flex-col gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">
            Beritahu kami sedikit tentang gym anda
          </h2>
          <span className="text-muted-foreground text-lg">
            Isi form ini untuk membantu kami mengetahui lebih lanjut tentang gym
            anda
          </span>
        </div>
        <div className="flex w-full items-center justify-center">
          <Avatar className="border-background bg-muted h-28 w-28 border-4 shadow-lg">
            {avatarImg ? <AvatarImage src={avatarImg} alt="Avatar" /> : null}
            <AvatarFallback>
              <ImageIcon className="text-muted-foreground h-14 w-14" />
            </AvatarFallback>
          </Avatar>
        </div>
        <FormFieldItem
          control={control}
          name="name"
          label={
            <FormLabel>
              Nama Gym <span className="text-destructive">*</span>
            </FormLabel>
          }
          invalid={Boolean(errors.name)}
          errorMessage={errors.name?.message}
          render={({ field }) => (
            <Input
              type="text"
              autoComplete="off"
              placeholder="Nama Gym"
              {...field}
            />
          )}
        />
        <FormFieldItem
          control={control}
          name="email"
          label={
            <FormLabel>
              Email <span className="text-destructive">*</span>
            </FormLabel>
          }
          invalid={Boolean(errors.email)}
          errorMessage={errors.email?.message}
          render={({ field }) => (
            <Input
              type="email"
              autoComplete="off"
              placeholder="Email"
              {...field}
            />
          )}
        />
        <FormFieldItem
          control={control}
          name="phone"
          label={
            <FormLabel>
              Nomor Telepon <span className="text-destructive">*</span>
            </FormLabel>
          }
          invalid={Boolean(errors.phone)}
          errorMessage={errors.phone?.message}
          render={({ field }) => (
            <PhoneInput placeholder="08 *** *** ***" {...field} />
          )}
        />
        <FormFieldItem
          control={control}
          name="address"
          label={
            <FormLabel>
              Alamat Gym <span className="text-destructive">*</span>
            </FormLabel>
          }
          invalid={Boolean(errors.address)}
          errorMessage={errors.address?.message}
          render={({ field }) => (
            <Textarea
              placeholder="Tulis alamat lengkap untuk lokasi gym Anda."
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
        <div className="flex w-full items-center justify-end">
          <Button
            type="submit"
            variant="default"
            size="default"
            className="w-full rounded-full"
            onClick={onNext}
          >
            Step berikutnya
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Form>
  )
}

export default Step1
