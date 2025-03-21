package cinema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PromotionDAO {

    private final JdbcTemplate jdbcTemplate;
    private final UserDAO userDAO;

    @Autowired
    public PromotionDAO(JdbcTemplate jdbcTemplate, UserDAO userDAO) {
        this.jdbcTemplate = jdbcTemplate;
        this.userDAO = userDAO;
    }

    // Fetch promotion for the active user (only one promotion)
    public Promotion getPromotionByActiveUserId() {
        try {
            // Get the active user ID
            Integer activeUserId = userDAO.getActiveUserId();

            if (activeUserId != null) {
                // Query to get the promotion for this active user
                String query = "SELECT * FROM promotion WHERE customer_id = ? LIMIT 1"; // Only expecting one promotion

                // Fetch and map the promotion
                return jdbcTemplate.queryForObject(
                    query,
                    (rs, rowNum) -> {
                        Promotion promotion = new Promotion();
                        promotion.setPromotionId(rs.getInt("promotion_id"));
                        promotion.setDiscountPercentage(rs.getDouble("discount_percentage"));
                        promotion.setDescription(rs.getString("description"));
                        promotion.setCustomerId(rs.getInt("customer_id"));
                        return promotion;
                    },
                    activeUserId
                );
            } else {
                System.out.println("No active user found.");
                return null;
            }
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error in getPromotionByActiveUserId: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean addPromotionToUser(String email) {
        try {
            // Get the active user ID
            User newUser = userDAO.getUserByEmail(email);
            int userId = newUser.getUserId();

            if (email != null) {
                // Hardcoded promotion values
                double discountPercentage = 15.0; // 15% discount
                String description = "Spring Special Offer: 15% Off!";

                // Insert the promotion into the database
                String query = "INSERT INTO promotion (discount_percentage, description, customer_id) VALUES (?, ?, ?)";

                // Execute the query to insert the promotion
                int rowsAffected = jdbcTemplate.update(query, discountPercentage, description, userId);

                if (rowsAffected > 0) {
                    System.out.println("Promotion successfully added to user with ID: " + userId);
                    return true;
                } else {
                    System.out.println("Failed to add promotion to user.");
                    return false;
                }
            } else {
                System.out.println("No active user found.");
                return false;
            }
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error in addPromotionToUser: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean deletePromotionByActiveUser() {
        try {
            // Get the active user ID
            Integer activeUserId = userDAO.getActiveUserId();

            if (activeUserId != null) {
                // Query to delete the promotion for this active user
                String query = "DELETE FROM promotion WHERE customer_id = ?"; // Only delete one promotion

                // Execute the delete query
                int rowsAffected = jdbcTemplate.update(query, activeUserId);

                if (rowsAffected > 0) {
                    System.out.println("Promotion successfully deleted for user with ID: " + activeUserId);
                    return true;
                } else {
                    System.out.println("No promotion found for user with ID: " + activeUserId);
                    return false;
                }
            } else {
                System.out.println("No active user found.");
                return false;
            }
        } catch (Exception e) {
            System.out.println("PromotionDAO: Error in deletePromotionByActiveUser: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean addPromotionToActiveUser() {
        try {
            // Get the active user ID
            Integer activeUserId = userDAO.getActiveUserId();
            double discountPercentage = 15.0; // 15% discount
            String description = "Spring Special Offer: 15% Off!";

            if (activeUserId != null) {
                // Insert the promotion for the active user
                String query = "INSERT INTO promotion (discount_percentage, description, customer_id) VALUES (?, ?, ?)";
                
                // Execute the insert query
                int rowsAffected = jdbcTemplate.update(query, discountPercentage, description, activeUserId);

                if (rowsAffected > 0) {
                    System.out.println("Promotion successfully added to user with ID: " + activeUserId);
                    return true;
                } else {
                    System.out.println("Failed to add promotion to user.");
                    return false;
                }
            } else {
                System.out.println("No active user found.");
                return false;
            }
        } catch (Exception e) {
            System.out.println("UserDAO: Error adding promotion to user: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

}

