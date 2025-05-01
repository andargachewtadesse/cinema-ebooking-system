package cinema;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.EmptyResultDataAccessException;

@Repository
public class TicketDAO {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public TicketDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Add a new ticket
    public int addTicket(Ticket ticket) {
        String sql = "INSERT INTO ticket (booking_id, show_id, movie_title, ticket_type, price, seat_number) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        try {
            // Basic null checks for required fields before attempting insert
            if (ticket == null || ticket.getPrice() == null || ticket.getTicketType() == null || ticket.getSeatNumber() == null || ticket.getBookingId() <= 0 || ticket.getShowId() <= 0) {
                 System.err.println("TicketDAO: Attempted to add ticket with invalid/null fields: " + ticket);
                 return -1;
            }

            String lookedUpMovieTitle;
            try {
                String titleSql = """
                    SELECT m.title
                    FROM movies m
                    JOIN show_times st ON m.movie_id = st.movie_id
                    WHERE st.show_time_id = ?
                    """;
                lookedUpMovieTitle = jdbcTemplate.queryForObject(titleSql, String.class, ticket.getShowId());
            } catch (EmptyResultDataAccessException e) {
                System.err.println("TicketDAO: Could not find movie title for show_id: " + ticket.getShowId());
                return -1;
            } catch (DataAccessException e) {
                System.err.println("TicketDAO: Database error looking up movie title for show_id " + ticket.getShowId() + ": " + e.getMessage());
                e.printStackTrace();
                return -1;
            }

            final String finalMovieTitle = lookedUpMovieTitle;
            final BigDecimal price = ticket.getPrice();
            final String seatNumber = ticket.getSeatNumber();
            final String ticketTypeLower = ticket.getTicketType().toLowerCase();
            final int bookingId = ticket.getBookingId();
            final int showId = ticket.getShowId();

            int rowsAffected = jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setInt(1, bookingId);
                ps.setInt(2, showId);
                ps.setString(3, finalMovieTitle);
                ps.setString(4, ticketTypeLower);
                ps.setBigDecimal(5, price);
                ps.setString(6, seatNumber);
                return ps;
            }, keyHolder);

            if (rowsAffected == 0) {
                // Insert failed, but no exception was thrown (less common)
                System.err.println("TicketDAO: Insert query affected 0 rows. Ticket not added.");
                return -1;
            }

            Number key = keyHolder.getKey();
            // Check if key is null (could happen if insertion failed in some DBs or config issues)
            if (key == null) {
                System.err.println("TicketDAO: Generated key was null after insert. Ticket may not have been added correctly.");
                return -1;
            }
            return key.intValue(); // Return generated ID

        } catch (DataAccessException e) { // Catch specific Spring JDBC exceptions first
            System.err.println("TicketDAO: Database error adding ticket for booking_id=" + ticket.getBookingId() + ", show_id=" + ticket.getShowId() + " - Error: " + e.getMessage());
            // Log the root cause, often the SQLException with constraint details
            if (e.getRootCause() != null) {
                 System.err.println("TicketDAO: Root Cause: " + e.getRootCause().getMessage());
            }
            // Print stack trace for full context
            e.printStackTrace();
            return -1; // Indicate failure
        } catch (Exception e) { // Catch any other unexpected exceptions
             System.err.println("TicketDAO: Unexpected error adding ticket: " + e.getClass().getName() + " - " + e.getMessage());
             e.printStackTrace();
             return -1;
        }
    }

    // Delete a ticket
    public boolean deleteTicket(int ticketId) {
        try {
            String sql = "DELETE FROM ticket WHERE ticket_id = ?";
            int rowsAffected = jdbcTemplate.update(sql, ticketId);
            return rowsAffected > 0;
        } catch (DataAccessException e) { // Catch DB errors
            System.err.println("TicketDAO: Error deleting ticket ID " + ticketId + ": " + e.getMessage());
            if (e.getRootCause() != null) {
                System.err.println("TicketDAO: Root Cause: " + e.getRootCause().getMessage());
            }
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("TicketDAO: Unexpected error deleting ticket: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // Get all tickets for a booking
    public List<Ticket> getTicketsByBookingId(int bookingId) {
        try {
            String query = "SELECT ticket_id, booking_id, show_id, movie_title, ticket_type, price, seat_number FROM ticket WHERE booking_id = ?";
            return jdbcTemplate.query(query, new Object[]{bookingId}, (rs, rowNum) -> {
                Ticket ticket = new Ticket();
                ticket.setTicketId(rs.getInt("ticket_id"));
                ticket.setBookingId(rs.getInt("booking_id"));
                ticket.setShowId(rs.getInt("show_id"));
                ticket.setMovieTitle(rs.getString("movie_title"));
                ticket.setTicketType(rs.getString("ticket_type"));
                ticket.setPrice(rs.getBigDecimal("price"));
                ticket.setSeatNumber(rs.getString("seat_number"));
                return ticket;
            });
        } catch (DataAccessException e) { // Catch DB errors
            System.err.println("TicketDAO: Error getting tickets by booking ID " + bookingId + ": " + e.getMessage());
            if (e.getRootCause() != null) {
                System.err.println("TicketDAO: Root Cause: " + e.getRootCause().getMessage());
            }
            e.printStackTrace();
            return null; // Or return empty list: return Collections.emptyList();
        } catch (Exception e) {
             System.err.println("TicketDAO: Unexpected error getting tickets by booking ID: " + e.getClass().getName() + " - " + e.getMessage());
             e.printStackTrace();
             return null;
        }
    }

    // Get ticket by ID
    public Ticket getTicketById(int ticketId) {
        try {
            String query = "SELECT ticket_id, booking_id, show_id, movie_title, ticket_type, price, seat_number FROM ticket WHERE ticket_id = ?";
            // Use queryForObject for single result or handle EmptyResultDataAccessException
             return jdbcTemplate.queryForObject(query, new Object[]{ticketId}, (rs, rowNum) -> {
                Ticket ticket = new Ticket();
                ticket.setTicketId(rs.getInt("ticket_id"));
                ticket.setBookingId(rs.getInt("booking_id"));
                ticket.setShowId(rs.getInt("show_id"));
                ticket.setMovieTitle(rs.getString("movie_title"));
                ticket.setTicketType(rs.getString("ticket_type"));
                ticket.setPrice(rs.getBigDecimal("price"));
                ticket.setSeatNumber(rs.getString("seat_number"));
                return ticket;
            });
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
             System.out.println("TicketDAO: No ticket found for ID " + ticketId);
             return null;
        } catch (DataAccessException e) { // Catch other DB errors
            System.err.println("TicketDAO: Error getting ticket by ID " + ticketId + ": " + e.getMessage());
             if (e.getRootCause() != null) {
                 System.err.println("TicketDAO: Root Cause: " + e.getRootCause().getMessage());
             }
            e.printStackTrace();
            return null;
        } catch (Exception e) {
              System.err.println("TicketDAO: Unexpected error getting ticket by ID: " + e.getClass().getName() + " - " + e.getMessage());
              e.printStackTrace();
              return null;
        }
    }

    // Get a list of seat numbers for a specific show ID
    public List<String> getSeatNumbersByShowId(int showId) {
        try {
            String query = "SELECT seat_number FROM ticket WHERE show_id = ?";
            return jdbcTemplate.query(query, new Object[]{showId}, (rs, rowNum) -> rs.getString("seat_number"));
        } catch (DataAccessException e) { // Catch DB errors
            System.err.println("TicketDAO: Error getting seat numbers by show ID " + showId + ": " + e.getMessage());
             if (e.getRootCause() != null) {
                 System.err.println("TicketDAO: Root Cause: " + e.getRootCause().getMessage());
             }
            e.printStackTrace();
            return null; // Or return empty list: return Collections.emptyList();
        } catch (Exception e) {
             System.err.println("TicketDAO: Unexpected error getting seat numbers by show ID: " + e.getClass().getName() + " - " + e.getMessage());
             e.printStackTrace();
             return null;
        }
    }

}
