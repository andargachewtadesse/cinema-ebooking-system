package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingDAO bookingDAO;

    @Autowired
    public BookingController(BookingDAO bookingDAO) {
        this.bookingDAO = bookingDAO;
    }

    // Add multiple bookings
    @PostMapping("/add")
    public ResponseEntity<String> AddBookings(@RequestBody List<Booking> bookings) {
        try {
            System.out.println("BookingController: Adding bookings...");
            boolean success = bookingDAO.addBookings(bookings);

            if (success) {
                System.out.println("BookingController: Successfully added bookings.");
                return ResponseEntity.ok("Bookings added successfully!");
            } else {
                System.out.println("BookingController: Failed to add some bookings.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add bookings.");
            }
        } catch (Exception e) {
            System.out.println("BookingController: Error adding bookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while adding bookings.");
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
}
