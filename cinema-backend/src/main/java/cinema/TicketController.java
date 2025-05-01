package cinema;

import java.util.List;
import cinema.Ticket;

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
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    private final TicketDAO ticketDAO;

    @Autowired
    public TicketController(TicketDAO ticketDAO) {
        this.ticketDAO = ticketDAO;
    }

    // Add a new ticket
    @PostMapping("/add")
    public ResponseEntity<String> AddTicket(@RequestBody Ticket ticket) {
        try {
            System.out.println("TicketController: Adding a new ticket...");
            int ticketId = ticketDAO.addTicket(ticket);

            if (ticketId > 0) {
                System.out.println("TicketController: Successfully added ticket with ID " + ticketId);
                return ResponseEntity.ok("Ticket added successfully!");
            } else {
                System.out.println("TicketController: Failed to add ticket.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add ticket.");
            }
        } catch (Exception e) {
            System.out.println("TicketController: Error adding ticket: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while adding ticket.");
        }
    }

    // Delete a ticket
    @DeleteMapping("/delete/{ticketId}")
    public ResponseEntity<String> DeleteTicket(@PathVariable int ticketId) {
        try {
            System.out.println("TicketController: Deleting ticket with ID " + ticketId);
            boolean success = ticketDAO.deleteTicket(ticketId);

            if (success) {
                System.out.println("TicketController: Successfully deleted ticket with ID " + ticketId);
                return ResponseEntity.ok("Ticket deleted successfully!");
            } else {
                System.out.println("TicketController: Failed to delete ticket with ID " + ticketId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete ticket.");
            }
        } catch (Exception e) {
            System.out.println("TicketController: Error deleting ticket: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while deleting ticket.");
        }
    }

    // Get all tickets for a booking 
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Ticket>> GetTicketsByBookingId(@PathVariable int bookingId) {
        try {
            System.out.println("TicketController: Fetching tickets for booking ID " + bookingId);
            List<Ticket> tickets = ticketDAO.getTicketsByBookingId(bookingId);

            if (tickets.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            System.out.println("TicketController: Error fetching tickets: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Get ticket by ID 
    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> GetTicketById(@PathVariable int ticketId) {
        try {
            System.out.println("TicketController: Fetching ticket with ID " + ticketId);
            Ticket ticket = ticketDAO.getTicketById(ticketId);

            if (ticket == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            System.out.println("TicketController: Error fetching ticket: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Endpoint to get all seat numbers for a show
    @GetMapping("/seats/{showId}")
    public ResponseEntity<List<String>> getSeatNumbersByShowId(@PathVariable int showId) {
        try {
            List<String> seatNumbers = ticketDAO.getSeatNumbersByShowId(showId);
            if (seatNumbers == null || seatNumbers.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(seatNumbers);
        } catch (Exception e) {
            System.out.println("TicketController: Error fetching seat numbers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}

