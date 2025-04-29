package cinema;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class BookingDAO {

    private final JdbcTemplate jdbcTemplate;
    private final EmailService emailService;
    private final UserDAO userDAO;

    @Autowired
    public BookingDAO(JdbcTemplate jdbcTemplate, EmailService emailService, UserDAO userDAO) {
        this.jdbcTemplate = jdbcTemplate;
        this.emailService = emailService;
        this.userDAO = userDAO;
    }

    // Add multiple bookings
    public int addBookings(Booking booking) {
        String sql = "INSERT INTO booking (customer_id, booking_datetime) VALUES (?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
    
        try {
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setInt(1, booking.getCustomerId());
                ps.setTimestamp(2, booking.getBookingDatetime());
                return ps;
            }, keyHolder);
    
            Number key = keyHolder.getKey();
            return key != null ? key.intValue() : -1;
    
        } catch (Exception e) {
            System.out.println("BookingDAO: Failed to insert booking - " + e.getMessage());
            return -1;
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

    // update booking status to confirmed after confirmation page
    public int updateBookingStatusToConfirmed(int bookingId) {

        getMovieAndTicketTypesByBookingId(bookingId);

        String sql = "UPDATE booking SET status = 'confirmed' WHERE booking_id = ? AND status = 'pending'"; // Ensure only pending bookings are updated
        try {
            int rowsAffected = jdbcTemplate.update(sql, bookingId);
            return rowsAffected; // Returns the number of rows updated (1 if successful, 0 if booking not found or not in 'pending' status)
        } catch (Exception e) {
            System.out.println("BookingDAO: Failed to update booking status - " + e.getMessage());
            return -1; // Return -1 in case of failure
        }
    }

    public void getMovieAndTicketTypesByBookingId(int bookingId) {
        String sql = "SELECT m.title, t.ticket_type, t.price " +
                     "FROM ticket t " +
                     "JOIN show_times st ON t.show_id = st.show_time_id " +
                     "JOIN movies m ON st.movie_id = m.movie_id " +
                     "WHERE t.booking_id = ?";
    
        List<String> movieNames = new ArrayList<>();
        List<String> ticketTypes = new ArrayList<>();
        List<Double> prices = new ArrayList<>();
    
        try {
            jdbcTemplate.query(sql, new Object[]{bookingId}, (ResultSet resultSet) -> {
                while (resultSet.next()) {
                    movieNames.add(resultSet.getString("title"));
                    ticketTypes.add(resultSet.getString("ticket_type"));
                    prices.add(resultSet.getDouble("price"));
                }
            });
    
            // Get the user's email by booking ID
            String userEmail = userDAO.getUserEmailByStatusId();
    
            // Call the email confirmation function
            emailService.sendOrderConfirm(userEmail, bookingId, movieNames, ticketTypes, prices);
    
        } catch (Exception e) {
            System.out.println("BookingDAO: Failed to fetch movie names, ticket types, or prices - " + e.getMessage());
        }
    }
    
}
