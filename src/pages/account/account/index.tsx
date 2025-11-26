import { Separator } from "@/components/ui/separator"
import LayoutAccount from "../Layout"
import FormResetPassword from "./form-reset-password"
import FormUserAccount from "./form-user-account"

const AccountPage = () => {
  return (
    <LayoutAccount>
      <div className="space-y-8">
        <FormUserAccount />
        <Separator />
        <FormResetPassword />
      </div>
    </LayoutAccount>
  )
}

export default AccountPage
