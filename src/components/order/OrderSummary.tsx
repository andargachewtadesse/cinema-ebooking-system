import { Card } from "@/components/ui/card"
import { TicketTable } from "./TicketTable"
import type { Ticket } from "@/types/order"

interface OrderSummaryProps {
  tickets: Ticket[]
  onUpdateQuantity: (id: string, increment: boolean) => void
  onRemoveTicket: (id: string) => void
}

export function OrderSummary({
  tickets,
  onUpdateQuantity,
  onRemoveTicket,
}: OrderSummaryProps) {
  return (
    <Card className="p-6">
      <TicketTable
        tickets={tickets}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveTicket={onRemoveTicket}
      />
    </Card>
  )
}