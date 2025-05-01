import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Minus, Plus } from "lucide-react"
import type { Ticket } from "@/types/order"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OrderSummaryProps {
  tickets: Ticket[]
  onUpdateQuantity: (id: string, increment: boolean) => void
  onRemoveTicket: (id: string) => void
  onUpdateTicketType: (id: string, type: string) => void
  ticketTypes: { type: string; price: number }[]
}

export function OrderSummary({
  tickets,
  onUpdateQuantity,
  onRemoveTicket,
  onUpdateTicketType,
  ticketTypes,
}: OrderSummaryProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="flex items-center justify-between border-b pb-4">
            <div className="space-y-1">
              <h3 className="font-medium">{ticket.movie.title}</h3>
              <p className="text-sm text-muted-foreground">{ticket.movie.showtime}</p>
              <p className="text-sm text-muted-foreground">Seat: {ticket.movie.seat}</p>
              
              <Select
                value={ticket.type}
                onValueChange={(value) => onUpdateTicketType(ticket.id, value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((type) => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.type} (${type.price.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(ticket.id, false)}
                  disabled={ticket.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{ticket.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onUpdateQuantity(ticket.id, true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onRemoveTicket(ticket.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}