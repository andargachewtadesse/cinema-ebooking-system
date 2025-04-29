package cinema;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingDAO bookingDAO;
    private final TicketDAO ticketDAO;

    @Autowired
    public BookingController(BookingDAO bookingDAO, TicketDAO ticketDAO) {
        this.bookingDAO = bookingDAO;
        this.ticketDAO = ticketDAO;
    }

    // Add multiple bookings
    @PostMapping("/add")
    public ResponseEntity<Integer> AddBookings(@RequestBody Booking bookings) {
        try {
            System.out.println("BookingController: Adding bookings...");
            int success = bookingDAO.addBookings(bookings);

            if (success != -1) {
                System.out.println("BookingController: Successfully added bookings.");
                return ResponseEntity.ok(success);
            } else {
                System.out.println("BookingController: Failed to add some bookings.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
            }
        } catch (Exception e) {
            System.out.println("BookingController: Error adding bookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
        }
    }

    // Get bookings by customer ID
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Booking>> FetchBookingsForCustomer(@PathVariable int customerId) {
        try {
            System.out.println("BookingController: Fetching bookings for customer ID " + customerId);
            List<Booking> bookings = bookingDAO.getBookingsByCustomerId(customerId);

            if (bookings.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            System.out.println("BookingController: Error fetching bookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Get a specific booking by booking ID
    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> FetchBookingById(@PathVariable int bookingId) {
        try {
            System.out.println("BookingController: Fetching booking ID " + bookingId);
            Booking booking = bookingDAO.getBookingById(bookingId);

            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            System.out.println("BookingController: Error fetching booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Delete a booking by ID
    @DeleteMapping("/delete/{bookingId}")
    public ResponseEntity<String> DeleteBooking(@PathVariable int bookingId) {
        try {
            System.out.println("BookingController: Deleting booking ID " + bookingId);
            boolean deleted = bookingDAO.deleteBookingById(bookingId);

            if (deleted) {
                return ResponseEntity.ok("Booking deleted successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found.");
            }
        } catch (Exception e) {
            System.out.println("BookingController: Error deleting booking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while deleting booking.");
        }
    }

    // updating booking status to confirmed
    @PutMapping("/confirm")
    public ResponseEntity<String> updateBookingStatus(@PathVariable int bookingId) {
        try {
            System.out.println("BookingController: Updating booking status to 'confirmed'...");
            int rowsUpdated = bookingDAO.updateBookingStatusToConfirmed(bookingId);

            if (rowsUpdated == 1) {
                System.out.println("BookingController: Booking status updated to 'confirmed'.");
                return ResponseEntity.ok("Booking status updated to 'confirmed'.");
            } else if (rowsUpdated == 0) {
                System.out.println("BookingController: No booking found with the given ID or the status is not 'pending'.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No booking found with the given ID or the status is not 'pending'.");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update booking status.");
            }
        } catch (Exception e) {
            System.out.println("BookingController: Error updating booking status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while updating booking status.");
        }
    }

    // Get all tickets for a customer's bookings
    @GetMapping("/customer/{customerId}/tickets")
    public ResponseEntity<List<Ticket>> getAllTicketsForCustomer(@PathVariable int customerId) {
        try {
            System.out.println("BookingController: Fetching all tickets for customer ID " + customerId);
            List<Booking> bookings = bookingDAO.getBookingsByCustomerId(customerId);

            if (bookings.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            List<Ticket> allTickets = new ArrayList<>();
            for (Booking booking : bookings) {
                List<Ticket> tickets = ticketDAO.getTicketsByBookingId(booking.getBookingId());
                allTickets.addAll(tickets);
            }

            return ResponseEntity.ok(allTickets);
        } catch (Exception e) {
            System.out.println("BookingController: Error fetching tickets for customer: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
