"use client"

import { useState } from "react"
import { OrderHeader } from "@/components/order/OrderHeader"
import { OrderSummary } from "@/components/order/OrderSummary"
import { OrderTotal } from "@/components/order/OrderTotal"
import { Button } from "@/components/ui/button"
import type { Ticket } from "@/types/order"

export default function OrderPage() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "1",
      type: "Adult",
      price: 15.0,
      quantity: 2,
      movie: {
        title: "Inception",
        showtime: "Today, 7:30 PM"
      }
    },
    {
      id: "2",
      type: "Child",
      price: 10.0,
      quantity: 1,
      movie: {
        title: "Inception",
        showtime: "Today, 7:30 PM"
      }
    },
    {
      id: "3",
      type: "Senior",
      price: 12.0,
      quantity: 1,
      movie: {
        title: "The Dark Knight",
        showtime: "Tomorrow, 4:15 PM"
      }
    },
  ])

  const updateQuantity = (id: string, increment: boolean) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === id) {
          const newQuantity = increment ? ticket.quantity + 1 : ticket.quantity - 1
          return {
            ...ticket,
            quantity: Math.max(0, newQuantity),
          }
        }
        return ticket
      }),
    )
  }

  const removeTicket = (id: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id))
  }

  const calculateTotal = () => {
    return tickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0)
  }

  return (
    <>
      <OrderHeader />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Order Summary</h1>
          <p className="text-muted-foreground">Review and modify your tickets</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr,400px]">
          <OrderSummary
            tickets={tickets}
            onUpdateQuantity={updateQuantity}
            onRemoveTicket={removeTicket}
          />

          <div className="space-y-6">
            <OrderTotal tickets={tickets} total={calculateTotal()} />

            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                className="w-full"
                disabled={tickets.length === 0 || calculateTotal() === 0}
                onClick={() => alert("Proceeding to checkout...")}
              >
                Continue to Checkout
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => window.history.back()}
              >
                Back to Movie
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}