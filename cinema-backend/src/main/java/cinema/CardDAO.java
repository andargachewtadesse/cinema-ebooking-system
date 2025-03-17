package cinema;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class CardDAO {

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public CardDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Add a new card
    public int insertCard(Card card) throws SQLException {
        // Debug
        System.out.println("CardDAO: Inserting card with cardholder name: " + card.getCardholderName());

        String sql = "INSERT INTO card (cardholder_name, card_number, cvv, card_address, customer_id) " +
                     "VALUES (?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, card.getCardholderName());
            ps.setString(2, card.getCardNumber());
            ps.setString(3, card.getCvv());
            ps.setString(4, card.getCardAddress());
            ps.setInt(5, card.getCustomerId());

            return ps;

        }, keyHolder);

        return keyHolder.getKey().intValue();  // Return the auto-generated card ID
    }

    // Get all cards
    public List<Card> getAllCards() {
        try {
            String query = "SELECT * FROM card";

            List<Card> cards = jdbcTemplate.query(query, (rs, rowNum) -> {
                Card card = new Card();
                card.setId(rs.getInt("id"));
                card.setCardholderName(rs.getString("cardholder_name"));
                card.setCardNumber(rs.getString("card_number"));
                card.setCvv(rs.getString("cvv"));
                card.setCardAddress(rs.getString("card_address"));
                card.setCustomerId(rs.getInt("customer_id"));

                return card;
            });

            return cards;

        } catch (Exception e) {
            System.out.println("CardDAO: Error in getAllCards: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch all cards", e);
        }
    }

    // Delete a card by card ID
    public boolean deleteCard(int cardId) {
        try {
            String deleteQuery = "DELETE FROM card WHERE id = ?";
            int rowsAffected = jdbcTemplate.update(deleteQuery, cardId);
            System.out.println("CardDAO: Delete card query affected " + rowsAffected + " rows");
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("CardDAO: Error deleting card: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete card with ID: " + cardId, e);
        }
    }
}
