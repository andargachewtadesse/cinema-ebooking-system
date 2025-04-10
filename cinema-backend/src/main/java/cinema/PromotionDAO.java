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
            String sql = "INSERT INTO promotion (discount_percentage, description, creation_date, is_sent) " +
                         "VALUES (?, ?, ?, ?)";
            
            KeyHolder keyHolder = new GeneratedKeyHolder();
            
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setDouble(1, promotion.getDiscountPercentage());
                ps.setString(2, promotion.getDescription());
                ps.setTimestamp(3, new java.sql.Timestamp(promotion.getCreationDate().getTime()));
                ps.setBoolean(4, promotion.isSent());
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
    
    // Send promotion to all subscribed users
    public boolean sendPromotionToSubscribers(int promotionId) {
        try {
            // First, check if the promotion exists and hasn't been sent yet
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
            
            // Send email to each subscribed user
            for (User user : subscribedUsers) {
                sendPromotionEmail(user.getEmail(), promotion);
            }
            
            // Mark the promotion as sent
            String updateSql = "UPDATE promotion SET is_sent = TRUE WHERE promotion_id = ?";
            jdbcTemplate.update(updateSql, promotionId);
            
            System.out.println("PromotionDAO: Successfully sent promotion to " + subscribedUsers.size() + " users");
            return true;
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error sending promotion: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // Helper method to send promotion email
    private void sendPromotionEmail(String email, Promotion promotion) {
        try {
            // Create a message for the promotion email
            String subject = "Special Promotion: " + promotion.getDescription();
            String message = "Dear Valued Customer,\n\n" +
                            "We're excited to offer you a special promotion!\n\n" +
                            promotion.getDescription() + "\n\n" +
                            "Discount: " + promotion.getDiscountPercentage() + "% off your next purchase!\n\n" +
                            "Sincerely,\nCinema E-Booking Team";
                            
            // Send the email using EmailService
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(email);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            
            emailService.sendPromotionEmail(email, promotion);
            
            System.out.println("PromotionDAO: Sent promotion email to: " + email);
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error sending promotion email to " + email + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}