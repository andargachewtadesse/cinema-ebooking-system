package cinema;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

@Repository
public class CardDAO {

    private final UserDAO userDAO;
    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public CardDAO(JdbcTemplate jdbcTemplate, UserDAO userDAO) {
        this.jdbcTemplate = jdbcTemplate;
        this.userDAO = userDAO;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Add a new card
    public int insertCard(Card card) throws SQLException {
        // Debugging log
        System.out.println("CardDAO: Inserting card for cardholder: " + card.getCardholderName());

        String encryptedCardNumber = passwordEncoder.encode(card.getCardNumber());
        String encryptedCvv = passwordEncoder.encode(card.getCvv());

        String sql = "INSERT INTO card (cardholder_name, card_number, cvv, card_address, expiration_date, customer_id) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, card.getCardholderName());
            ps.setString(2, encryptedCardNumber);
            ps.setString(3, encryptedCvv);
            ps.setString(4, card.getCardAddress());
            ps.setString(5, card.getExpirationDate());
            ps.setInt(6, userDAO.getActiveUserId());
            return ps;
        }, keyHolder);

        return keyHolder.getKey().intValue();  // Return the generated card ID
    }

    // Get all cards
    public List<Card> getAllCards() {
        try {
            String query = "SELECT * FROM card";

            return jdbcTemplate.query(query, (rs, rowNum) -> {
                Card card = new Card();
                card.setId(rs.getInt("id"));
                card.setCardholderName(rs.getString("cardholderName"));
                card.setCardNumber(maskCardNumber(rs.getString("cardNumber"))); // Mask card number
                card.setCvv("***"); // Mask CVV
                card.setCardAddress(rs.getString("card_address"));
                card.setCustomerId(rs.getInt("customerId"));
                return card;
            });

        } catch (Exception e) {
            System.out.println("CardDAO: Error in getAllCards: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch all cards", e);
        }
    }

    // Get all cards for the active user
    public List<Card> getAllCardsForActiveUser() {
        try {
            // Get the active user ID
            Integer activeUserId = userDAO.getActiveUserId();
            
            if (activeUserId == null) {
                System.out.println("No active user found");
                return Collections.emptyList(); // Return an empty list if no active user is found
            }
            
            // Query to get all cards for the active user
            String query = "SELECT * FROM card WHERE customer_id = ?";
            
            // Use query method with a lambda expression for the row mapper
            List<Card> cards = jdbcTemplate.query(query, 
                new Object[]{activeUserId}, 
                (rs, rowNum) -> {
                    // Create new Card object and map the result set to its fields
                    Card card = new Card();
                    card.setId(rs.getInt("id"));
                    card.setCardholderName(rs.getString("cardholder_name"));
                    card.setCardNumber(rs.getString("card_number"));
                    card.setCardAddress(rs.getString("card_address"));
                    card.setExpirationDate(rs.getString("expiration_date"));
                    card.setCustomerId(rs.getInt("customer_id"));
                    
                    return card;
                });

            return cards;
        
        } catch (Exception e) {
            System.out.println("CardDAO: Error in getAllCardsForActiveUser: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch cards for active user", e);
        }
    }

    // Delete a card by card ID
    public boolean deleteCard(String cardNum) {
        try {
            String deleteQuery = "DELETE FROM card WHERE cardNumber = ?";
            int rowsAffected = jdbcTemplate.update(deleteQuery, cardNum);
            System.out.println("CardDAO: Delete card query affected " + rowsAffected + " rows");
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("CardDAO: Error deleting card: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete card with cardNumber: " + cardNum, e);
        }
    }

    public boolean updateCardAddress(String cardNum, String newAddress) {
        try {
            String updateQuery = "UPDATE card SET cardAddress = ? WHERE cardNumber = ?";
            int rowsAffected = jdbcTemplate.update(updateQuery, newAddress, cardNum);
            System.out.println("CardDAO: Update card address affected " + rowsAffected + " rows");
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("CardDAO: Error updating card address: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update address for card with cardNumber: " + cardNum, e);
        }
    }
    

    // Utility method to mask card number (Show only last 4 digits)
    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }

    public boolean countCard(){
        Integer actUserId = userDAO.getActiveUserId();

        try {
            String query = "SELECT COUNT(*) FROM card WHERE customer_id = ?";
            Integer count = jdbcTemplate.queryForObject(query, Integer.class, actUserId);
            
            return count < 3;  // Changed from <= 3 to < 3 to allow up to 3 cards
            
        } catch (Exception e) {
            System.out.println("CardDAO: Error counting payment cards: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // Add a new card with specific user ID
    public int insertCardWithUserId(Card card, Integer userId) throws SQLException {
        // Debugging log
        System.out.println("CardDAO: Inserting card for cardholder: " + card.getCardholderName() + " with user ID: " + userId);

        String encryptedCardNumber = passwordEncoder.encode(card.getCardNumber());
        String encryptedCvv = passwordEncoder.encode(card.getCvv());

        String sql = "INSERT INTO card (cardholder_name, card_number, cvv, card_address, expiration_date, customer_id) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, card.getCardholderName());
            ps.setString(2, encryptedCardNumber);
            ps.setString(3, encryptedCvv);
            ps.setString(4, card.getCardAddress());
            ps.setString(5, card.getExpirationDate());
            ps.setInt(6, userId);
            return ps;
        }, keyHolder);

        return keyHolder.getKey().intValue();  // Return the generated card ID
    }

}
