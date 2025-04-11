package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class BookingDAO {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public BookingDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Add multiple bookings
    public boolean addBookings(List<Booking> bookings) {
        String sql = "INSERT INTO booking (customer_id, booking_datetime, status) VALUES (?, ?, ?)";
        try {
            for (Booking b : bookings) {
                jdbcTemplate.update(sql, b.getCustomerId(), b.getBookingDatetime(), b.getStatus());
            }
            return true;
        } catch (Exception e) {
            System.out.println("BookingDAO: Failed to insert bookings - " + e.getMessage());
            return false;
        }
    }

    // Get bookings by customer ID
    public List<Booking> getBookingsByCustomerId(int customerId) {
        String sql = "SELECT * FROM booking WHERE customer_id = ?";
        return jdbcTemplate.query(sql, new Object[]{customerId}, (rs, rowNum) -> {
            Booking b = new Booking();
            b.setBookingId(rs.getInt("booking_id"));
            b.setCustomerId(rs.getInt("customer_id"));
            b.setBookingDatetime(rs.getTimestamp("booking_datetime"));
            b.setStatus(rs.getString("status"));
            return b;
        });
    }

    // Get a booking by booking ID
    public Booking getBookingById(int bookingId) {
        String sql = "SELECT * FROM booking WHERE booking_id = ?";
        List<Booking> bookings = jdbcTemplate.query(sql, new Object[]{bookingId}, (rs, rowNum) -> {
            Booking b = new Booking();
            b.setBookingId(rs.getInt("booking_id"));
            b.setCustomerId(rs.getInt("customer_id"));
            b.setBookingDatetime(rs.getTimestamp("booking_datetime"));
            b.setStatus(rs.getString("status"));
            return b;
        });
        return bookings.isEmpty() ? null : bookings.get(0);
    }

    // Delete booking by ID
    public boolean deleteBookingById(int bookingId) {
        String sql = "DELETE FROM booking WHERE booking_id = ?";
        return jdbcTemplate.update(sql, bookingId) > 0;
    }
}
