import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SalesLayout from "../Layout"

const TransferMember = () => {
  return (
    <SalesLayout>
      <Card>
        <CardHeader>
          <CardTitle>Transfer Member</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Halaman Transfer Member akan ditampilkan di sini.
          </p>
        </CardContent>
      </Card>
    </SalesLayout>
  )
}

export default TransferMember

