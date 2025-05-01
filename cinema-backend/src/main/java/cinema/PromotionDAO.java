package cinema;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Repository;

@Repository
public class PromotionDAO {

    private final JdbcTemplate jdbcTemplate;
    private final UserDAO userDAO;
    private final EmailService emailService;

    @Autowired
    public PromotionDAO(JdbcTemplate jdbcTemplate, UserDAO userDAO, EmailService emailService) {
        this.jdbcTemplate = jdbcTemplate;
        this.userDAO = userDAO;
        this.emailService = emailService;
    }
    
    // Get all promotions (for admin)
    public List<Promotion> getAllPromotions() {
        try {
            String query = "SELECT * FROM promotion ORDER BY creation_date DESC";
            
            return jdbcTemplate.query(query, (rs, rowNum) -> {
                Promotion promo = new Promotion();
                promo.setPromotionId(rs.getInt("promotion_id"));
                promo.setCode(rs.getString("code"));
                promo.setDiscountPercentage(rs.getDouble("discount_percentage"));
                promo.setDescription(rs.getString("description"));
                promo.setCreationDate(rs.getTimestamp("creation_date"));
                promo.setSent(rs.getBoolean("is_sent"));
                return promo;
            });
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error in getAllPromotions: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    // Create a new promotion (from admin)
    public int createPromotion(Promotion promotion) {
        try {
            // Don't include promotion_id in the column list since it's auto-increment
            String sql = "INSERT INTO promotion (code, discount_percentage, description, creation_date, is_sent) " +
                         "VALUES (?, ?, ?, ?, ?)";
            
            KeyHolder keyHolder = new GeneratedKeyHolder();
            
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, promotion.getCode());
                ps.setDouble(2, promotion.getDiscountPercentage());
                ps.setString(3, promotion.getDescription());
                ps.setTimestamp(4, new java.sql.Timestamp(promotion.getCreationDate().getTime()));
                ps.setBoolean(5, promotion.isSent());
                return ps;
            }, keyHolder);
            
            return keyHolder.getKey().intValue();
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error creating promotion: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create promotion", e);
        }
    }
    
    // Get promotion by ID
    public Promotion getPromotionById(int promotionId) {
        try {
            String query = "SELECT * FROM promotion WHERE promotion_id = ?";
            
            List<Promotion> promotions = jdbcTemplate.query(
                query, 
                new Object[] { promotionId },
                (rs, rowNum) -> {
                    Promotion promo = new Promotion();
                    promo.setPromotionId(rs.getInt("promotion_id"));
                    promo.setCode(rs.getString("code"));
                    promo.setDiscountPercentage(rs.getDouble("discount_percentage"));
                    promo.setDescription(rs.getString("description"));
                    promo.setCreationDate(rs.getTimestamp("creation_date"));
                    promo.setSent(rs.getBoolean("is_sent"));
                    return promo;
                }
            );
            
            return promotions.isEmpty() ? null : promotions.get(0);
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error in getPromotionById: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    // Validate a promotion code
    public Double validatePromotionCode(String code) {
        try {
            String query = "SELECT discount_percentage FROM promotion WHERE code = ? AND is_sent = TRUE";
            
            // Use queryForObject, expecting one result or throwing an exception
            Double discount = jdbcTemplate.queryForObject(
                query, 
                new Object[] { code },
                Double.class
            );
            
            System.out.println("PromotionDAO: Validated code '" + code + "' with discount: " + discount);
            return discount;
            
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            // Code doesn't exist or hasn't been sent
            System.out.println("PromotionDAO: Invalid or not sent promotion code: " + code);
            return null; 
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error validating promotion code '" + code + "': " + e.getMessage());
            e.printStackTrace();
            return null; // Indicate error
        }
    }
    
    // Delete a promotion by ID
    public boolean deletePromotion(int promotionId) {
        try {
            String sql = "DELETE FROM promotion WHERE promotion_id = ?";
            int rowsAffected = jdbcTemplate.update(sql, promotionId);
            
            if (rowsAffected > 0) {
                System.out.println("PromotionDAO: Successfully deleted promotion with ID: " + promotionId);
                return true;
            } else {
                System.out.println("PromotionDAO: No promotion found to delete with ID: " + promotionId);
                return false; // No promotion found with that ID
            }
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error deleting promotion: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // Send promotion to all subscribed users
    public boolean sendPromotionToSubscribers(int promotionId) {
        try {

            Promotion promotion = getPromotionById(promotionId);
            if (promotion == null) {
                System.out.println("PromotionDAO: Promotion not found with ID: " + promotionId);
                return false;
            }
            
            if (promotion.isSent()) {
                System.out.println("PromotionDAO: Promotion already sent, ID: " + promotionId);
                return false;
            }
            
            // Get all users who have subscribed to promotions
            List<User> subscribedUsers = userDAO.getSubscribedUsers();
            if (subscribedUsers.isEmpty()) {
                System.out.println("PromotionDAO: No users subscribed to promotions");
                return false;
            }
            
            System.out.println("PromotionDAO: Starting to send promotion to " + subscribedUsers.size() + " users");
            
            // Extract just the email addresses from the users
            List<String> emailAddresses = subscribedUsers.stream()
                .map(User::getEmail)
                .collect(java.util.stream.Collectors.toList());
            
            // Mark the promotion as sent
            String updateSql = "UPDATE promotion SET is_sent = TRUE WHERE promotion_id = ?";
            jdbcTemplate.update(updateSql, promotionId);
            
            // Send bulk email in separate thread
            new Thread(() -> {
                try {
                    // Send one email with all recipients as BCC
                    emailService.sendPromotionEmailBulk(emailAddresses, promotion);
                    System.out.println("PromotionDAO: Completed sending bulk promotion email to " + emailAddresses.size() + " users");
                } catch (Exception e) {
                    System.out.println("PromotionDAO: Error in email sending thread: " + e.getMessage());
                    e.printStackTrace();
                }
            }).start();
            
            // Return true immediately since we've started the process
            return true;
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error sending promotion: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}