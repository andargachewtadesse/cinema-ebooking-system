package cinema;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class BookingDAO {

    private final JdbcTemplate jdbcTemplate;
    private final UserDAO userDAO;

    @Autowired
    public BookingDAO(JdbcTemplate jdbcTemplate, UserDAO userDAO) {
        this.jdbcTemplate = jdbcTemplate;
        this.userDAO = userDAO;
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

    // update booking status to confirmed (no email logic)
    public int updateBookingStatusToConfirmed(int bookingId) {
        String sql = "UPDATE booking SET status = 'confirmed' WHERE booking_id = ? AND status = 'pending'"; 
        try {
            int rowsAffected = jdbcTemplate.update(sql, bookingId);
            // Removed email sending logic
            return rowsAffected; 
        } catch (Exception e) {
            System.out.println("BookingDAO: Failed to update booking status for ID " + bookingId + " - " + e.getMessage());
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
