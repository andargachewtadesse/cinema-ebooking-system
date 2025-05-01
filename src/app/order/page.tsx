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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { isAuthenticated } from "@/utils/auth"
import type { SubmitData } from "@/components/order/checkoutform"

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
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [baseTicketPrices, setBaseTicketPrices] = useState<Record<string, number>>({})
  const [userData, setUserData] = useState<any>(null)
  const [userCards, setUserCards] = useState<any[]>([])
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
          const datePart = storedTicket.showDate; // 'yyyy-MM-dd'
          const timePart = storedTicket.showTime; // 'h:mm A' format
          
          // Parse date safely
          let formattedDate = datePart; // Default
          try {
            const parts = datePart.split('-');
            if (parts.length === 3) {
              const year = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10);
              const day = parseInt(parts[2], 10);
              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                formattedDate = format(new Date(year, month - 1, day), 'MMM d, yyyy');
              }
            }
          } catch(e) {
            console.error("Error formatting date in order page:", datePart, e);
          }
          
          // Combine formatted date and time (time is already formatted)
          const displayShowtime = `${formattedDate} at ${timePart}`;
          
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

  const handleCheckoutSubmit = async (data: SubmitData) => {
    console.log('Checkout form data received in OrderPage:', data);
    console.log('Tickets submitted:', tickets); 

    // TEMPORARY: Skip actual API call and redirect
    try {
      console.log("Mock success - would normally send payload to backend");
      
      // Log what would have been sent to the backend
      const payload = {
        tickets: tickets.map(t => ({
          movieId: t.movie.id,
          showtime: t.movie.showtime,
          seatLabel: t.movie.seat,
          ticketType: t.type.toLowerCase(),
          price: t.price,
          quantity: t.quantity
        })),
        payment: data.selectedCardId 
          ? { type: 'savedCard', cardId: data.selectedCardId }
          : { 
              type: 'newCard', 
              cardDetails: data.newCardDetails
            },
        userDetails: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        },
        totalAmount: calculateTotal()
      };
      
      console.log("Would have sent payload:", JSON.stringify(payload, null, 2));

      // Clear checkout data
      setIsCheckoutOpen(false);
      localStorage.removeItem('pendingOrderTickets');
      setTickets([]);
      
      // Redirect to order confirmation
      router.push('/order-confirmation');
      
    } catch (error) {
      console.error("Checkout submission error:", error);
      alert("There was an issue processing your payment. Please try again.");
    }
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
          // Get movie ID from the main ticket id (format: movieId-row-col-index)
          const movieId = ticket.id.split('-')[0];
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
          // Get movie ID from the main ticket id
          const movieId = ticket.id.split('-')[0];
          
          return {
            ...ticket,
            quantity: newQuantity,
            // Update total price for this ticket based on quantity
            price: parseFloat((getTicketPrice(ticket.type, movieId) * newQuantity).toFixed(2))
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

  // Function to load user profile data
  const loadUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/profileLoad', {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        console.log("User profile loaded:", data);
      } else {
        console.error("Failed to load user profile:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };
  
  // Function to load user's saved cards
  const loadUserCards = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cards/activeCards', {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserCards(data);
        console.log("User cards loaded:", data);
      } else {
        console.error("Failed to load user cards:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error loading user cards:", error);
    }
  };
  
  const handleCheckoutClick = async () => {
    if (isAuthenticated()) {
      // Load user profile data
      await loadUserProfile();
      
      // Load user cards - uncommented this line
      await loadUserCards();
      
      setIsCheckoutOpen(true);
    } else {
      setIsAuthDialogOpen(true);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const checkoutData = {
      ...formData,
      // If using a saved card, only send the card ID
      ...(selectedCard && !isAddingNewCard 
        ? { cardId: selectedCard.id } 
        : { /* new card details */ }
      ),
      total: total
    };
    
    onSubmit(checkoutData);
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
              ticketTypes={getTicketTypesForMovie(tickets[0]?.id.split('-')[0] || '')}
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
                onClick={handleCheckoutClick}
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

      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to complete your purchase.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p>Please login to your existing account or create a new account to continue.</p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:w-1/2"
              onClick={() => {
                setIsAuthDialogOpen(false)
                router.push('/signup')
              }}
            >
              Register
            </Button>
            <Button 
              className="sm:w-1/2 bg-black text-white hover:bg-gray-800"
              onClick={() => {
                setIsAuthDialogOpen(false)
                router.push('/login')
              }}
            >
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CheckoutForm
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        total={calculateTotal()}
        onSubmit={handleCheckoutSubmit}
        userData={userData}
        userCards={userCards}
      />
    </>
  )
}
