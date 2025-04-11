"use client"

import { useState, useEffect } from "react"
import { OrderHeader } from "@/components/order/OrderHeader"
import { OrderSummary } from "@/components/order/OrderSummary"
import { OrderTotal } from "@/components/order/OrderTotal"
import { Button } from "@/components/ui/button"
import type { Ticket } from "@/types/order"
import { CheckoutForm } from "@/components/order/checkoutform"
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

// Interface matching the data stored from MoviePage
interface StoredTicketInfo {
  movieId: string;
  movieTitle: string;
  showDate: string; // 'yyyy-MM-dd'
  showTime: string; // 'HH:mm'
  seatRow: number;
  seatCol: number;
  seatLabel: string;
  ticketType: 'adult' | 'child' | 'senior';
  price: number; // Price is  included from localStorage
  quantity?: number; 
}

export default function OrderPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [baseTicketPrices, setBaseTicketPrices] = useState<Record<string, number>>({})
  const router = useRouter()
  
  // Load tickets from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('pendingOrderTickets');
    if (storedData) {
      try {
        const pendingTickets: StoredTicketInfo[] = JSON.parse(storedData);
        
        // Track base price for each movie/showtime (keyed by movieId)
        const prices: Record<string, number> = {};
        
        // Map stored data to the Ticket structure
        const loadedTickets: Ticket[] = pendingTickets.map((storedTicket, index) => {
          const datePart = storedTicket.showDate;
          const timePart = storedTicket.showTime; 
          const displayShowtime = `${format(new Date(datePart), 'MMM d, yyyy')} at ${format(new Date(`1970-01-01T${timePart}:00`), 'hh:mm a')}`;
          
          if (!prices[storedTicket.movieId] && storedTicket.ticketType === 'adult') {
            prices[storedTicket.movieId] = storedTicket.price;
          } else if (!prices[storedTicket.movieId]) {

            const price = storedTicket.price;
            if (storedTicket.ticketType === 'child') {
              prices[storedTicket.movieId] = parseFloat((price / 0.90).toFixed(2));
            } else if (storedTicket.ticketType === 'senior') {
              prices[storedTicket.movieId] = parseFloat((price / 0.95).toFixed(2));
            } else {
              prices[storedTicket.movieId] = price;
            }
          }

          return {
            id: `${storedTicket.movieId}-${storedTicket.seatRow}-${storedTicket.seatCol}-${index}`, 
            type: storedTicket.ticketType.charAt(0).toUpperCase() + storedTicket.ticketType.slice(1), 
            price: typeof storedTicket.price === 'number' && !isNaN(storedTicket.price) ? storedTicket.price : 0,
            quantity: 1, // Each stored item represents one ticket
            movie: {
              title: storedTicket.movieTitle,
              showtime: displayShowtime, 
              seat: storedTicket.seatLabel,
              id: storedTicket.movieId // Store movie ID for price lookups
            },
          };
        });

        setBaseTicketPrices(prices);
        setTickets(loadedTickets);
      } catch (parseError) {
        console.error("Failed to parse stored order tickets:", parseError);
        localStorage.removeItem('pendingOrderTickets');
      }
    }
  }, []); 

  const removeTicket = (id: string) => {
    const updatedTickets = tickets.filter((ticket) => ticket.id !== id);
    setTickets(updatedTickets);
    
    // Update localStorage to reflect the removal
    const storedData = localStorage.getItem('pendingOrderTickets');
    if (storedData) {
        try {
            let pendingTickets: StoredTicketInfo[] = JSON.parse(storedData);
            // Filter out the removed ticket based on the derived ID logic
            const parts = id.split('-');
            if (parts.length >= 4) {
                 const movieId = parts[0];
                 const seatRow = parseInt(parts[1], 10);
                 const seatCol = parseInt(parts[2], 10);
                 pendingTickets = pendingTickets.filter(t => 
                    !(t.movieId === movieId && t.seatRow === seatRow && t.seatCol === seatCol)
                 );
                 localStorage.setItem('pendingOrderTickets', JSON.stringify(pendingTickets));
            }
        } catch (e) {
            console.error("Error updating localStorage after removal:", e);
        }
    }
  }

  const calculateTotal = () => {
    // Quantity is always 1 now
    return tickets.reduce((total, ticket) => total + ticket.price, 0)
  }

  const handleCheckoutSubmit = async (data: any) => {
    console.log('Checkout data:', data)
    console.log('Tickets submitted:', tickets); 
    setIsCheckoutOpen(false)
    localStorage.removeItem('pendingOrderTickets'); // Clear storage on successful checkout
    alert("Checkout successful (simulation)!"); 

  }

  const getTicketPrice = (type: string, movieId: string): number => {
    const basePrice = baseTicketPrices[movieId] || 0;
    
    if (basePrice <= 0) {
      console.warn(`Invalid base price for movie ID ${movieId}`);
      return 0;
    }

    // Normalize the type to lowercase for comparison
    const lowerType = type.toLowerCase();
    
    switch (lowerType) {
      case 'child':
        return parseFloat((basePrice * 0.90).toFixed(2)); 
      case 'senior':
        return parseFloat((basePrice * 0.95).toFixed(2)); 
      case 'adult':
      default:
        return parseFloat(basePrice.toFixed(2));
    }
  };

  // Generate ticket types with prices for each movie
  const getTicketTypesForMovie = (movieId: string) => {
    const basePrice = baseTicketPrices[movieId] || 0;
    
    return [
      { type: 'Adult', price: getTicketPrice('adult', movieId) },
      { type: 'Child', price: getTicketPrice('child', movieId) },
      { type: 'Senior', price: getTicketPrice('senior', movieId) }
    ];
  };

  // Handle ticket type update
  const handleUpdateTicketType = (id: string, newType: string) => {
    setTickets(prevTickets => {
      return prevTickets.map(ticket => {
        if (ticket.id === id) {
          // Get movie ID from the ticket ID
          const movieId = ticket.movie.id || ticket.id.split('-')[0];
          // Calculate new price based on type
          const newPrice = getTicketPrice(newType, movieId);
          
          return {
            ...ticket,
            type: newType,
            price: newPrice
          };
        }
        return ticket;
      });
    });
    
    //  update localStorage to persist changes
    const storedData = localStorage.getItem('pendingOrderTickets');
    if (storedData) {
      try {
        const pendingTickets: StoredTicketInfo[] = JSON.parse(storedData);
        const parts = id.split('-');
        
        if (parts.length >= 4) {
          const movieId = parts[0];
          const seatRow = parseInt(parts[1], 10);
          const seatCol = parseInt(parts[2], 10);
          
          const updatedPendingTickets = pendingTickets.map(ticket => {
            if (ticket.movieId === movieId && 
                ticket.seatRow === seatRow && 
                ticket.seatCol === seatCol) {
              const updatedType = newType.toLowerCase() as 'adult' | 'child' | 'senior';
              const newPrice = getTicketPrice(updatedType, movieId);
              
              return {
                ...ticket,
                ticketType: updatedType,
                price: newPrice
              };
            }
            return ticket;
          });
          
          localStorage.setItem('pendingOrderTickets', JSON.stringify(updatedPendingTickets));
        }
      } catch (e) {
        console.error("Error updating localStorage after type change:", e);
      }
    }
  };

  // Update the handleUpdateQuantity function
  const handleUpdateQuantity = (id: string, increment: boolean) => {
    setTickets(prevTickets => {
      return prevTickets.map(ticket => {
        if (ticket.id === id) {
          // Calculate new quantity (min 1)
          const newQuantity = increment ? ticket.quantity + 1 : Math.max(1, ticket.quantity - 1);
          
          return {
            ...ticket,
            quantity: newQuantity,
            // Update total price for this ticket based on quantity
            price: parseFloat((getTicketPrice(ticket.type, ticket.movie.id) * newQuantity).toFixed(2))
          };
        }
        return ticket;
      });
    });
    
    // Also update localStorage to persist changes
    const storedData = localStorage.getItem('pendingOrderTickets');
    if (storedData) {
      try {
        const pendingTickets: StoredTicketInfo[] = JSON.parse(storedData);
        const parts = id.split('-');
        
        if (parts.length >= 4) {
          const movieId = parts[0];
          const seatRow = parseInt(parts[1], 10);
          const seatCol = parseInt(parts[2], 10);
          const ticketIndex = parseInt(parts[3], 10);
          
          // Find the ticket by movieId, seat row and seat column
          const ticketToUpdate = pendingTickets.find(t => 
            t.movieId === movieId && t.seatRow === seatRow && t.seatCol === seatCol
          );
          
          if (ticketToUpdate) {

            if (!('quantity' in ticketToUpdate)) {
              ticketToUpdate.quantity = 1;
            }
            
            // Update the quantity
            ticketToUpdate.quantity = increment 
              ? (ticketToUpdate.quantity || 1) + 1 
              : Math.max(1, (ticketToUpdate.quantity || 1) - 1);
            
            // Update the price based on the new quantity
            const basePrice = getTicketPrice(ticketToUpdate.ticketType, movieId);
            ticketToUpdate.price = parseFloat((basePrice * ticketToUpdate.quantity).toFixed(2));
            
            localStorage.setItem('pendingOrderTickets', JSON.stringify(pendingTickets));
          }
        }
      } catch (e) {
        console.error("Error updating localStorage after quantity change:", e);
      }
    }
  };

  return (
    <>
      <OrderHeader />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Order Summary</h1>
          <p className="text-muted-foreground">Review your selected tickets</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr,400px]">
          {tickets.length > 0 ? (
            <OrderSummary
              tickets={tickets}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveTicket={removeTicket}
              onUpdateTicketType={handleUpdateTicketType}
              ticketTypes={getTicketTypesForMovie(tickets[0]?.movie?.id || '')}
            />
          ) : (
            <div className="text-center text-muted-foreground py-10 border rounded-md">
              Your order is empty. Go back to select movie tickets.
            </div>
          )}

          <div className="space-y-6">
            <OrderTotal tickets={tickets} total={calculateTotal()} />

            <div className="flex flex-col gap-4">
              <Button
                size="lg"
                className="w-full"
                disabled={tickets.length === 0} 
                onClick={() => setIsCheckoutOpen(true)}
              >
                Continue to Checkout
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => router.back()} 
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CheckoutForm
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        total={calculateTotal()}
        onSubmit={handleCheckoutSubmit}
      />
    </>
  )
}
