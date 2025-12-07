import { Faker, id_ID } from "@faker-js/faker"
import { ArrowRight, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ReturnClubFormSchema } from "./validation"

type PropsType = {
  onFinished?: () => void
  formProps: ReturnClubFormSchema
  isLoading?: boolean
}

const customFaker = new Faker({
  locale: [id_ID],
})

function createRandomUser() {
  return {
    name: customFaker.person.fullName(),
    email: customFaker.internet.email()?.toLowerCase(),
    photo: customFaker.image.avatar(),
    address: customFaker.location.streetAddress(),
    identity_number: "123456789",
    identity_type: customFaker.helpers.arrayElement(["ktp", "sim", "passport"]),
    birth_date: customFaker.date.birthdate(),
    gender: customFaker.helpers.arrayElement(["m", "f"]),
    phone: customFaker.phone.number(),
    notes: "dummy notes",
    goals: "dummy goals",
    join_date: new Date(),
  }
}

const users = customFaker.helpers.multiple(createRandomUser, {
  count: 2,
})

const Step4: React.FC<PropsType> = ({ onFinished, formProps, isLoading }) => {
  const { watch, setValue } = formProps
  const watchData = watch()
  const dataMembers = watchData.members || []
  return (
    <div className="relative max-w-140">
      <h2>Tambahkan member percobaan?</h2>
      <span className="text-lg">
        Menambahkan member percobaan akan memberi Anda pengalaman pertama
        menggunakan Migios.
      </span>
      <div className="mt-4 flex w-full flex-col gap-4">
        {users.map(
          (user: ReturnType<typeof createRandomUser>, index: number) => (
            <Card key={index}>
              <CardContent className="p-2 px-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.photo} alt={user.name} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <h6>{user.name}</h6>
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>
                  <Checkbox
                    checked={dataMembers.some(
                      (member) => member.email === user.email
                    )}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setValue("members", [...dataMembers, user])
                      } else {
                        setValue(
                          "members",
                          dataMembers.filter(
                            (member) => member.email !== user.email
                          )
                        )
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
      <div className="mt-8 flex w-full items-end justify-between">
        <div></div>
        <Button
          type="submit"
          variant="default"
          size="default"
          className="mt-4 min-w-32 rounded-full"
          disabled={isLoading}
          onClick={onFinished}
        >
          {isLoading ? "Memproses..." : "Selesai"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default Step4
