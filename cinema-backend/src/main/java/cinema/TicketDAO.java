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

@Repository
public class TicketDAO {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public TicketDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Add a new ticket
    public int addTicket(Ticket ticket) {
        try {
            // Get the price from the show_time table
            String priceQuery = "SELECT price FROM show_time WHERE show_time_id = ?";
            BigDecimal price = jdbcTemplate.queryForObject(priceQuery, new Object[]{ticket.getShowId()}, BigDecimal.class);

            // Insert a new ticket with the fetched price
            String sql = "INSERT INTO ticket (booking_id, show_id, ticket_type, price, seat_number) " +
                         "VALUES (?, ?, ?, ?, ?)";
            
            KeyHolder keyHolder = new GeneratedKeyHolder();
            
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setInt(1, ticket.getBookingId());
                ps.setInt(2, ticket.getShowId());
                ps.setString(3, ticket.getTicketType());
                ps.setBigDecimal(4, price);
                ps.setString(5, ticket.getSeatNumber());
                return ps;
            }, keyHolder);
            
            return keyHolder.getKey().intValue();
        } catch (Exception e) {
            System.out.println("TicketDAO: Error adding ticket: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to add ticket", e);
        }
    }

    // Delete a ticket
    public boolean deleteTicket(int ticketId) {
        try {
            String sql = "DELETE FROM ticket WHERE ticket_id = ?";
            int rowsAffected = jdbcTemplate.update(sql, ticketId);
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("TicketDAO: Error deleting ticket: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // Get all tickets for a booking (Optional method)
    public List<Ticket> getTicketsByBookingId(int bookingId) {
        try {
            String query = "SELECT * FROM ticket WHERE booking_id = ?";
            return jdbcTemplate.query(query, new Object[]{bookingId}, (rs, rowNum) -> {
                Ticket ticket = new Ticket();
                ticket.setTicketId(rs.getInt("ticket_id"));
                ticket.setBookingId(rs.getInt("booking_id"));
                ticket.setShowId(rs.getInt("show_id"));
                ticket.setTicketType(rs.getString("ticket_type"));
                ticket.setPrice(rs.getBigDecimal("price"));
                ticket.setSeatNumber(rs.getString("seat_number"));
                return ticket;
            });
        } catch (Exception e) {
            System.out.println("TicketDAO: Error getting tickets by booking ID: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // Get ticket by ID (Optional method)
    public Ticket getTicketById(int ticketId) {
        try {
            String query = "SELECT * FROM ticket WHERE ticket_id = ?";
            List<Ticket> tickets = jdbcTemplate.query(query, new Object[]{ticketId}, (rs, rowNum) -> {
                Ticket ticket = new Ticket();
                ticket.setTicketId(rs.getInt("ticket_id"));
                ticket.setBookingId(rs.getInt("booking_id"));
                ticket.setShowId(rs.getInt("show_id"));
                ticket.setTicketType(rs.getString("ticket_type"));
                ticket.setPrice(rs.getBigDecimal("price"));
                ticket.setSeatNumber(rs.getString("seat_number"));
                return ticket;
            });
            return tickets.isEmpty() ? null : tickets.get(0);
        } catch (Exception e) {
            System.out.println("TicketDAO: Error getting ticket by ID: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
