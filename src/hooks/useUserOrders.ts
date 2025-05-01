import { useState, useEffect, useCallback } from "react";
import { isAuthenticated } from "@/utils/auth";

interface ShowTime {
  showTimeId: number;
  movieId: number;
  showroomId: number;
  showDate: string;
  showTime: string;
  price: number;
}

interface Movie {
  movieId: number;
  title: string;
}

interface Ticket {
  ticketId: number;
  bookingId: number;
  showId: number;
  movieTitle: string;
  ticketType: string;
  price: number;
  seatNumber: string;
  showTime?: ShowTime;
  movie?: Movie;
}

interface Booking {
  bookingId: number;
  customerId: number;
  bookingDatetime: string;
  status: string;
  tickets?: Ticket[];
}

export function useUserOrders() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOrderHistory = useCallback(async () => {
    setBookings([]);
    try {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated()) {
        setError("User not authenticated");
        return;
      }
      
      const userJson = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      
      if (!user || !user.userId) {
        setError("User information not available");
        return;
      }
      
      const bookingsResponse = await fetch(`http://localhost:8080/api/bookings/customer/${user.userId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken") || sessionStorage.getItem("authToken")}`
        }
      });
      
      if (bookingsResponse.status === 404) {
        setBookings([]);
      } else if (!bookingsResponse.ok) {
        throw new Error(`Failed to fetch booking history (Status: ${bookingsResponse.status})`);
      } else {
        const bookingsData = await bookingsResponse.json();
        
        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          const bookingsWithTickets = await Promise.all(
            bookingsData.map(async (booking: Booking) => {
              try {
                const ticketsResponse = await fetch(`http://localhost:8080/api/tickets/booking/${booking.bookingId}`, {
                  headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken") || sessionStorage.getItem("authToken")}`
                  }
                });
                
                if (!ticketsResponse.ok) {
                    console.warn(`Could not fetch tickets for booking ${booking.bookingId} (Status: ${ticketsResponse.status})`);
                    return { ...booking, tickets: [] };
                }
                
                const tickets = await ticketsResponse.json();
                return { ...booking, tickets };
              } catch (error) {
                console.error(`Error fetching tickets for booking ${booking.bookingId}:`, error);
                return { ...booking, tickets: [] };
              }
            })
          );
          setBookings(bookingsWithTickets);
        } else {
          setBookings([]);
        }
      }
      
    } catch (err: any) {
      console.error("Error fetching order history:", err);
      setError(err.message || "Failed to load order history. Please try again later.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);
  
  return { bookings, loading, error, refreshOrders: fetchOrderHistory };
} 