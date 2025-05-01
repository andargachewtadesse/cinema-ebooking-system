package cinema;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class BookingDAO {

    private final JdbcTemplate jdbcTemplate;
    private final UserDAO userDAO;
    private final TicketDAO ticketDAO;
    private final EmailService emailService;

    @Autowired
    public BookingDAO(JdbcTemplate jdbcTemplate, UserDAO userDAO, TicketDAO ticketDAO, EmailService emailService) {
        this.jdbcTemplate = jdbcTemplate;
        this.userDAO = userDAO;
        this.ticketDAO = ticketDAO;
        this.emailService = emailService;
    }

    // Create a single booking entry (shell)
    public int createBooking(Booking booking) {
        // Insert only customer_id and default status/timestamp
        String sql = "INSERT INTO booking (customer_id, status) VALUES (?, 'pending')"; 
        KeyHolder keyHolder = new GeneratedKeyHolder();
    
        try {
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setInt(1, booking.getCustomerId());
                // Removed: show_id, seat_number, ticket_type, price
                return ps;
            }, keyHolder);
    
            Number key = keyHolder.getKey();
            return key != null ? key.intValue() : -1; // Return generated booking_id
    
        } catch (Exception e) {
            System.out.println("BookingDAO: Failed to create booking shell - " + e.getMessage());
            return -1;
        }
    }

    // Get bookings by customer ID (simplified structure)
    public List<Booking> getBookingsByCustomerId(int customerId) {
        String sql = "SELECT booking_id, customer_id, booking_datetime, status FROM booking WHERE customer_id = ?";
        return jdbcTemplate.query(sql, new Object[]{customerId}, (rs, rowNum) -> {
            Booking b = new Booking();
            b.setBookingId(rs.getInt("booking_id"));
            b.setCustomerId(rs.getInt("customer_id"));
            b.setBookingDatetime(rs.getTimestamp("booking_datetime"));
            b.setStatus(rs.getString("status"));
            // Removed: showId, seatNumber, ticketType, price, paymentId
            return b;
        });
    }

    // Get a booking by booking ID (simplified structure)
    public Booking getBookingById(int bookingId) {
        String sql = "SELECT booking_id, customer_id, booking_datetime, status FROM booking WHERE booking_id = ?";
        List<Booking> bookings = jdbcTemplate.query(sql, new Object[]{bookingId}, (rs, rowNum) -> {
            Booking b = new Booking();
            b.setBookingId(rs.getInt("booking_id"));
            b.setCustomerId(rs.getInt("customer_id"));
            b.setBookingDatetime(rs.getTimestamp("booking_datetime"));
            b.setStatus(rs.getString("status"));
            // Removed: showId, seatNumber, ticketType, price, paymentId
            return b;
        });
        return bookings.isEmpty() ? null : bookings.get(0);
    }

    // Delete booking by ID
    public boolean deleteBookingById(int bookingId) {
        // Note: Consider cascading delete for associated tickets or handle deletion in TicketDAO
        String sql = "DELETE FROM booking WHERE booking_id = ?";
        return jdbcTemplate.update(sql, bookingId) > 0;
    }

    // update booking status to confirmed (including email sending)
    public int updateBookingStatusToConfirmed(int bookingId) {
        String sql = "UPDATE booking SET status = 'confirmed' WHERE booking_id = ? AND status = 'pending'"; 
        try {
            int rowsAffected = jdbcTemplate.update(sql, bookingId);
            
            // If update was successful, send confirmation email
            if (rowsAffected > 0) {
                try {
                    // 1. Get Booking details (to find customerId)
                    Booking booking = getBookingById(bookingId); 
                    if (booking == null) {
                        System.out.println("BookingDAO: Cannot send email, booking not found after update: " + bookingId);
                        return rowsAffected; // Return success, but log the issue
                    }
                    
                    // 2. Get User email
                    User user = userDAO.getUserProfileById(booking.getCustomerId());
                    if (user == null || user.getEmail() == null) {
                        System.out.println("BookingDAO: Cannot send email, user or email not found for booking: " + bookingId);
                        return rowsAffected; // Return success, but log the issue
                    }
                    String userEmail = user.getEmail();
                    
                    // 3. Get Tickets for the booking
                    List<Ticket> tickets = ticketDAO.getTicketsByBookingId(bookingId);
                    if (tickets.isEmpty()) {
                        System.out.println("BookingDAO: Cannot send email, no tickets found for booking: " + bookingId);
                        // Proceed without tickets? Or consider it an error? Let's proceed for now.
                    }
                    
                    // 4. Send the email (passing the list of tickets)
                    emailService.sendOrderConfirm(userEmail, tickets);
                    System.out.println("BookingDAO: Order confirmation email initiated for booking ID: " + bookingId + " to " + userEmail);
                    
                } catch (Exception emailEx) {
                    // Log email sending error but don't fail the booking confirmation
                    System.err.println("BookingDAO: Error sending confirmation email for booking ID " + bookingId + ": " + emailEx.getMessage());
                    emailEx.printStackTrace();
                }
            }
            
            return rowsAffected; 
        } catch (Exception e) {
            System.out.println("BookingDAO: Failed to update booking status for ID " + bookingId + " - " + e.getMessage());
            e.printStackTrace(); // Print stack trace for DB errors
            return -1; // Return -1 in case of failure
        }
    }

    // Cancel pending bookings after 30 minutes (unchanged conceptually)
    public int cancelPendingBookingsAfter30Minutes() {
        System.out.println("Cancelling pending bookings");
        String sql = """
            UPDATE booking
            SET status = 'cancelled'
            WHERE status = 'pending'
              AND booking_datetime < NOW() - INTERVAL 30 MINUTE
        """;
    
        try {
            return jdbcTemplate.update(sql);
        } catch (Exception e) {
            System.out.println("BookingDAO: Failed to cancel pending bookings after 30 minutes - " + e.getMessage());
            return 0;
        }
    }
    
}
