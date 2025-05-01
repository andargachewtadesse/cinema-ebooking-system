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
  showId: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  
  // Load tickets from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('pendingOrderTickets');
    if (storedData) {
      try {
        console.log("Loading from localStorage:", storedData);
        const pendingTickets: StoredTicketInfo[] = JSON.parse(storedData);

        // Validate that items have showId
        const validPendingTickets = pendingTickets.filter(pt => {
            if (!pt.showId) {
                console.warn("Found stored ticket without showId, filtering out:", pt);
                return false;
            }
            return true;
        });

        const prices: Record<string, number> = {};
        const loadedTickets: Ticket[] = validPendingTickets.map((storedTicket, index) => {
          const datePart = storedTicket.showDate; // 'yyyy-MM-dd'
          const timePart = storedTicket.showTime; // 'h:mm A' format
          

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
          
          // Combine formatted date and time 
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
            id: `${storedTicket.showId}-${storedTicket.seatRow}-${storedTicket.seatCol}-${index}`, 
            type: storedTicket.ticketType.charAt(0).toUpperCase() + storedTicket.ticketType.slice(1), 
            price: typeof storedTicket.price === 'number' && !isNaN(storedTicket.price) ? storedTicket.price : 0,
            quantity: storedTicket.quantity || 1,
            movie: {
              title: storedTicket.movieTitle,
              showtime: displayShowtime, 
              seat: storedTicket.seatLabel,
              id: storedTicket.movieId // Store movie ID for price lookups
            },
            showId: storedTicket.showId
          };
        });

        console.log("Loaded tickets state:", loadedTickets);
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

    return tickets.reduce((total, ticket) => total + ticket.price * ticket.quantity, 0)
  }

  const handleCheckoutSubmit = async (data: SubmitData) => {
    console.log('Checkout form data received in OrderPage:', data); // Includes promoCode and appliedDiscount 

    // User validation
    if (!userData || !userData.userId) {
        console.error("User data or User ID is missing.");
        alert("Error: User information not loaded. Please try logging in again.");
        setIsSubmitting(false);
        return;
    }
    const userId = userData.userId;
    console.log("Using definite customer ID:", userId);

    // Ticket validation
    if (tickets.length === 0) {
        console.error("No tickets in the order.");
        alert("Your order is empty.");
        setIsSubmitting(false);
        return;
    }

    try {
      setIsSubmitting(true);

      // Format tickets for API 
      const ticketData = tickets.map(ticket => {
         // Access showId directly from the ticket object
         const showIdNum = parseInt(ticket.showId, 10); // Already stored on the ticket object
         if (isNaN(showIdNum)) {

             console.error("Invalid showId found in ticket state:", ticket);
             throw new Error("Invalid ticket data: show ID is not a number.");
         }

        return {
          showId: showIdNum, 
          seatLabel: ticket.movie.seat,
          ticketType: ticket.type.toLowerCase(),
          price: ticket.price // Send the final price for this ticket
        };
      });
      console.log("Formatted ticket data for API:", ticketData);

      // Payment info object construction 
      const paymentInfo = data.selectedCardId ? { id: data.selectedCardId, type: 'saved' } : data.newCardDetails ? {
              type: 'new',
              details: {
                cardholderName: data.newCardDetails.cardholderName,
                cardNumber: data.newCardDetails.cardNumber.slice(-4), 
                expiryMonth: data.newCardDetails.expiryMonth,
                expiryYear: data.newCardDetails.expiryYear,
                saveCard: data.newCardDetails.saveCard
              }
            }
          : null;

      // Send the data to our API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          customerId: userId,
          tickets: ticketData, // Send the ticket data (prices are pre-calculated by type)
          paymentInfo: paymentInfo, // Still sent, backend might ignore
          total: calculateTotal(),   // Send the calculated total (could be original or discounted)
          // Forward promotion details to the booking API route
          promoCode: data.promoCode,
          appliedDiscount: data.appliedDiscount
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Server error:", error);

        let userMessage = `Failed to process booking: ${error}`;
        if (response.status === 400) {
            userMessage = `There was a problem with your booking details: ${error}. Please check and try again.`;
        } else if (response.status === 500) {
            userMessage = `An internal server error occurred: ${error}. Please try again later.`;
        }
        throw new Error(userMessage);
      }

      const result = await response.json();
      console.log('Booking successful:', result);

      // Clear checkout data
      setIsCheckoutOpen(false);
      localStorage.removeItem('pendingOrderTickets');
      setTickets([]);


      router.push('/order-confirmation'); 

    } catch (error) {
      console.error("Checkout submission error:", error);
      alert(`There was an issue processing your booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
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
  const getTicketTypesForMovie = (movieId: string | undefined) => {
    if (!movieId) return []; // Handle undefined movieId
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
        console.log("User profile loaded successfully:", data);
        
        
        if (!data.userId && data.user_id) {
          data.userId = data.user_id; 
        }
        
        // For testing - if userId is still missing, use a default
        if (!data.userId) {
          console.warn("No user ID found in profile data, using default");
          data.userId = 1; 
        }
        
        console.log("User ID:", data.userId);
        setUserData(data);
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
      

      await loadUserCards();
      
      setIsCheckoutOpen(true);
    } else {
      setIsAuthDialogOpen(true);
    }
  }

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
              ticketTypes={getTicketTypesForMovie(tickets[0]?.movie.id)}
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
