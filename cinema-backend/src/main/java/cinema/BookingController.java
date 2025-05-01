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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingDAO bookingDAO;
    private final UserDAO userDAO;

    @Autowired
    public BookingController(BookingDAO bookingDAO, UserDAO userDAO) {
        this.bookingDAO = bookingDAO;
        this.userDAO = userDAO;
    }

    // Add a single booking shell
    @PostMapping("/add")
    public ResponseEntity<Integer> CreateBookingShell(@RequestBody Booking bookingRequest) {
        try {
            // Expecting only customerId in the request body
            int customerId = bookingRequest.getCustomerId();
            System.out.println("BookingController: Creating booking shell for customer ID: " + customerId);
            
            // Validate the customer exists
            if (!userDAO.userExists(customerId)) {
                System.out.println("BookingController: Customer ID " + customerId + " does not exist");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(-1);
            }
            
            Booking newBooking = new Booking(customerId); 
            
            int bookingId = bookingDAO.createBooking(newBooking); // Call the updated DAO method

            if (bookingId != -1) {
                System.out.println("BookingController: Successfully created booking shell with ID: " + bookingId);
                // Return the generated booking_id
                return ResponseEntity.ok(bookingId); 
            } else {
                System.out.println("BookingController: Failed to create booking shell.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(-1);
            }
        } catch (Exception e) {
            System.out.println("BookingController: Error creating booking shell: " + e.getMessage());
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
    @PutMapping("/confirm/{bookingId}")
    public ResponseEntity<String> updateBookingStatus(@PathVariable int bookingId) {
        try {
            System.out.println("BookingController: Updating booking status to 'confirmed' for ID " + bookingId);
            int rowsUpdated = bookingDAO.updateBookingStatusToConfirmed(bookingId); // Calls simplified DAO method

            if (rowsUpdated == 1) {
                System.out.println("BookingController: Booking status updated to 'confirmed'.");
                return ResponseEntity.ok("Booking status updated to 'confirmed'.");
            } else if (rowsUpdated == 0) {
                System.out.println("BookingController: No booking found with ID " + bookingId + " or status is not 'pending'.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No booking found with the given ID or the status is not 'pending'.");
            } else { // rowsUpdated == -1 (error)
                 System.out.println("BookingController: Failed to update booking status for ID " + bookingId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update booking status.");
            }
        } catch (Exception e) {
            System.out.println("BookingController: Error updating booking status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while updating booking status.");
        }
    }
}
