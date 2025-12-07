import React from "react"
import { ArrowRight, Image as ImageIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem } from "@/components/ui/form"
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
      <div className="relative max-w-120">
        <h2>Beritahu kami sedikit tentang gym anda</h2>
        <span className="text-lg">
          Isi form ini untuk membantu kami mengetahui lebih lanjut tentang gym
          anda
        </span>
        <div className="mt-4 flex w-full flex-col">
          <div className="flex w-full items-center gap-4">
            <Avatar className="h-20 w-20 bg-gray-300 text-gray-600 dark:bg-gray-500/20 dark:text-gray-100">
              {avatarImg ? <AvatarImage src={avatarImg} alt="Avatar" /> : null}
              <AvatarFallback>
                <ImageIcon className="h-12 w-12 text-gray-600 dark:text-gray-100" />
              </AvatarFallback>
            </Avatar>
            <div className="w-full">
              <FormFieldItem
                control={control}
                name="name"
                label={
                  <>
                    Nama Gym <span className="text-destructive">*</span>
                  </>
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
            </div>
          </div>
          <FormFieldItem
            control={control}
            name="email"
            label={
              <>
                Email <span className="text-destructive">*</span>
              </>
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
              <>
                Nomor Telepon <span className="text-destructive">*</span>
              </>
            }
            invalid={Boolean(errors.phone)}
            errorMessage={errors.phone?.message}
            render={({ field }) => (
              <PhoneInput placeholder="+62 *** *** ***" {...field} />
            )}
          />
          <div className="mb-2 w-full">
            <FormFieldItem
              control={control}
              name="address"
              label={
                <>
                  Alamat Gym <span className="text-destructive">*</span>
                </>
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
          </div>
        </div>
        <div className="flex w-full items-center justify-end">
          <Button
            type="submit"
            variant="default"
            size="default"
            className="mt-4 w-full rounded-full"
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
