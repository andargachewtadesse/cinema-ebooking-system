import { Card } from "@/components/ui/card"
import type { Ticket } from "@/types/order"

interface OrderTotalProps {
  tickets: Ticket[]
  total: number
}

export function OrderTotal({ tickets, total }: OrderTotalProps) {
  // Group tickets by movie and showtime
  const ticketsByMovie = tickets.reduce((acc, ticket) => {
    const key = `${ticket.movie.title} - ${ticket.movie.showtime}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(ticket)
    return acc
  }, {} as Record<string, Ticket[]>)

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold">Order Total</h2>
      <div className="space-y-4">
        {Object.entries(ticketsByMovie).map(([movieKey, movieTickets]) => (
          <div key={movieKey} className="space-y-2">
            <div className="font-medium">{movieKey}</div>
            {movieTickets.map((ticket) => (
              <div key={ticket.id} className="flex justify-between text-sm">
                <span>
                  {ticket.type} (x{ticket.quantity})
                </span>
                <span>${(ticket.price * ticket.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t my-2" />
          </div>
        ))}
        <div className="pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}