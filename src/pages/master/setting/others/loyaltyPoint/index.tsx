import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LayoutOtherSetting from "../Layout"
import LoyaltyPointSettings from "./LoyaltyPointSettings"
import RedeemOtion from "./RedeemOtion"

const LayoutLoyaltyPoint = () => {
  return (
    <LayoutOtherSetting>
      <div className="mx-auto flex w-full max-w-2xl">
        <Tabs defaultValue="redeem" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="redeem">Opsi Redeem</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>
          <TabsContent value="redeem" className="mt-4">
            <RedeemOtion />
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <LoyaltyPointSettings />
          </TabsContent>
        </Tabs>
      </div>
    </LayoutOtherSetting>
  )
}

export default LayoutLoyaltyPoint
