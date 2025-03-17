import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Ticket } from "@/types/order"

interface TicketTableProps {
  tickets: Ticket[]
  onUpdateQuantity: (id: string, increment: boolean) => void
  onRemoveTicket: (id: string) => void
}

export function TicketTable({
  tickets,
  onUpdateQuantity,
  onRemoveTicket,
}: TicketTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Movie & Showtime</TableHead>
          <TableHead>Ticket Type</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Subtotal</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{ticket.movie.title}</span>
                <span className="text-sm text-muted-foreground">{ticket.movie.showtime}</span>
              </div>
            </TableCell>
            <TableCell>{ticket.type}</TableCell>
            <TableCell>${ticket.price.toFixed(2)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(ticket.id, false)}
                  disabled={ticket.quantity <= 0}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{ticket.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(ticket.id, true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell>${(ticket.price * ticket.quantity).toFixed(2)}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onRemoveTicket(ticket.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}