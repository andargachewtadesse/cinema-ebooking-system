import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { OrderHeader } from "@/components/order/OrderHeader"
import Link from "next/link"

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <OrderHeader />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. Your tickets have been sent to your email.
          </p>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <div className="text-sm mb-2">Order Reference</div>
            <div className="font-mono text-lg">#ORD-2025-1234</div>
          </div>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/">Browse More Movies</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/account/orders">View Order History</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

