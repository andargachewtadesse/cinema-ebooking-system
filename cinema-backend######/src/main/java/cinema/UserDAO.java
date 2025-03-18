package cinema;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

@Repository
public class UserDAO {
    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    public UserDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public List<User> getAllUser() {
        try {
            String query = "SELECT * FROM user";

            List<User> users = jdbcTemplate.query(
                query, 
                (rs, rowNum) -> {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setUsername(rs.getString("username"));
                    user.setPassword(rs.getString("password"));
                    user.setFirstName(rs.getString("first_name"));
                    user.setLastName(rs.getString("last_name"));
                    user.setEmail(rs.getString("email"));
                    user.setStatusId(rs.getInt("status_id"));
                    user.setPromotionSubscription(rs.getBoolean("promotion_subscription"));
                    return user;
                }
            );

            return users;
            
        } catch (Exception e) {
            System.out.println("UserDAO: Error in getAllUser: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch all users", e);
        }
    }

    public User getUserByEmail(String email) {
        try {
            String query = "SELECT * FROM user WHERE email = ?";
            
            List<User> users = jdbcTemplate.query(
                query, 
                (rs, rowNum) -> {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setUsername(rs.getString("username"));
                    user.setPassword(rs.getString("password"));
                    user.setFirstName(rs.getString("first_name"));
                    user.setLastName(rs.getString("last_name"));
                    user.setEmail(rs.getString("email"));
                    user.setStatusId(rs.getInt("status_id"));
                    user.setPromotionSubscription(rs.getBoolean("promotion_subscription"));
                    user.setVerificationCode(rs.getString("verification_code"));
                    return user;
                },
                email
            );
            
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            System.out.println("UserDAO: Error in getUserByEmail: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public int insertUser(User user) throws SQLException {
        // Debug 
        System.out.println("UserDAO: Inserting user with username: " + user.getUsername());
        
        // Generate verification code
        String verificationCode = UUID.randomUUID().toString();
        user.setVerificationCode(verificationCode);
        
        // Encrypt password
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        
        String sql = "INSERT INTO user (username, password, first_name, last_name, " +
                     "email, status_id, promotion_subscription, verification_code) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, encryptedPassword);
            ps.setString(3, user.getFirstName());
            ps.setString(4, user.getLastName());
            ps.setString(5, user.getEmail());
            ps.setInt(6, 2); // Status inactive until verified
            ps.setBoolean(7, user.getPromotionSubscription());
            ps.setString(8, verificationCode);
            
            return ps;
        }, keyHolder);
        
        int userId = keyHolder.getKey().intValue();
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);
        } catch (Exception e) {
            System.err.println("Warning: Failed to send verification email: " + e.getMessage());
            // Log but don't propagate the exception
        }
        
        return userId;
    }

    public boolean verifyUser(String email, String verificationCode) {
        try {
            String query = "SELECT * FROM user WHERE email = ? AND verification_code = ?";
            List<User> users = jdbcTemplate.query(
                query, 
                (rs, rowNum) -> {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    return user;
                },
                email, verificationCode
            );
            
            if (!users.isEmpty()) {
                // Update user status to active
                String updateQuery = "UPDATE user SET status_id = 1, verification_code = NULL WHERE email = ?";
                int rowsAffected = jdbcTemplate.update(updateQuery, email);
                return rowsAffected > 0;
            }
            return false;
        } catch (Exception e) {
            System.out.println("UserDAO: Error in verifyUser: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean resetPasswordRequest(String email) {
        try {
            User user = getUserByEmail(email);
            if (user != null) {
                // Generate reset token
                String resetToken = UUID.randomUUID().toString();
                
                // Update user with reset token
                String updateQuery = "UPDATE user SET verification_code = ? WHERE email = ?";
                int rowsAffected = jdbcTemplate.update(updateQuery, resetToken, email);
                
                if (rowsAffected > 0) {
                    // Send reset email
                    try {
                        emailService.sendPasswordResetEmail(email, resetToken);
                    } catch (Exception e) {
                        System.err.println("Warning: Failed to send password reset email: " + e.getMessage());
                        // Log but don't propagate the exception
                    }
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            System.out.println("UserDAO: Error in resetPasswordRequest: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean resetPassword(String email, String resetToken, String newPassword) {
        try {
            // Verify token
            String verifyQuery = "SELECT * FROM user WHERE email = ? AND verification_code = ?";
            List<User> users = jdbcTemplate.query(
                verifyQuery, 
                (rs, rowNum) -> {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    return user;
                },
                email, resetToken
            );
            
            if (!users.isEmpty()) {
                // Update password
                String encryptedPassword = passwordEncoder.encode(newPassword);
                String updateQuery = "UPDATE user SET password = ?, verification_code = NULL WHERE email = ?";
                int rowsAffected = jdbcTemplate.update(updateQuery, encryptedPassword, email);
                return rowsAffected > 0;
            }
            return false;
        } catch (Exception e) {
            System.out.println("UserDAO: Error in resetPassword: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteUser(int user_id) {
        try {
            String deleteMovieQuery = "DELETE FROM user WHERE user_id = ?";
            int rowsAffected = jdbcTemplate.update(deleteMovieQuery, user_id);
            System.out.println("UserDAO: Delete user query affected " + rowsAffected + " rows");
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error deleting user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete user with ID: " + user_id, e);
        }
    }

    public boolean updateUserEmail(int user_id, String newEmail) {
        try {
            // Debugging
            System.out.println("UserDAO: Updating email for user with ID: " + user_id);
    
            // SQL query to update email
            String updateQuery = "UPDATE user SET email = ? WHERE user_id = ?";
    
            // Executing the update query
            int rowsAffected = jdbcTemplate.update(updateQuery, newEmail, user_id);
    
            // Log the number of rows affected
            System.out.println("UserDAO: Update query affected " + rowsAffected + " rows");
    
            // Return true if the user was updated (i.e., at least one row was affected)
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error updating email for user with ID " + user_id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update email for user with ID: " + user_id, e);
        }
    }
    
    public boolean updateUserName(int user_id, String newFirstName, String newLastName) {
        try {
            // Debugging
            System.out.println("UserDAO: Updating first name and last name for user with ID: " + user_id);
    
            // SQL query to update first name and last name
            String updateQuery = "UPDATE user SET first_name = ?, last_name = ? WHERE user_id = ?";
    
            // Executing the update query
            int rowsAffected = jdbcTemplate.update(updateQuery, newFirstName, newLastName, user_id);
    
            // Log the number of rows affected
            System.out.println("UserDAO: Update query affected " + rowsAffected + " rows");
    
            // Return true if the user was updated (i.e., at least one row was affected)
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error updating first name and last name for user with ID " + user_id + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update first name and last name for user with ID: " + user_id, e);
        }
    }
    
    public boolean updateUserPassword(int userId, String currentPassword, String newPassword) {
        try {
            // Get current password from database
            String query = "SELECT password FROM user WHERE user_id = ?";
            String storedPassword = jdbcTemplate.queryForObject(query, String.class, userId);
            
            // Verify current password
            if (passwordEncoder.matches(currentPassword, storedPassword)) {
                // Encrypt new password
                String encryptedPassword = passwordEncoder.encode(newPassword);
                
                // Update password
                String updateQuery = "UPDATE user SET password = ? WHERE user_id = ?";
                int rowsAffected = jdbcTemplate.update(updateQuery, encryptedPassword, userId);
                
                return rowsAffected > 0;
            }
            return false;
        } catch (Exception e) {
            System.out.println("UserDAO: Error updating password: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean updatePromotionSubscription(int userId, boolean subscribe) {
        try {
            String updateQuery = "UPDATE user SET promotion_subscription = ? WHERE user_id = ?";
            int rowsAffected = jdbcTemplate.update(updateQuery, subscribe, userId);
            
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error updating promotion subscription: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // User Login validate
    public boolean validateUserLogin(String email, String password) {
        try {
            // Query to get the password from the database
            String query = "SELECT password, status_id FROM user WHERE email = ?";
            
            // Use queryForList instead of the deprecated query method
            List<Map<String, Object>> results = jdbcTemplate.queryForList(query, email);
            
            if (results.isEmpty()) {
                return false;
            }
            
            String storedPassword = (String) results.get(0).get("password");
            int statusId = ((Number) results.get(0).get("status_id")).intValue();
            
            // Check if user is active
            if (statusId != 1) {
                System.out.println("User account is not active");
                return false;
            }
            
            // Verify password using BCrypt
            boolean passwordMatches = passwordEncoder.matches(password, storedPassword);
            
            if (passwordMatches) {
                // Update user status to active
                query = "UPDATE user SET status_id = 1 WHERE email = ?";
                jdbcTemplate.update(query, email);
            }
            
            return passwordMatches;
        } catch (Exception e) {
            System.out.println("Error during login validation: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean hasActiveUser() {
        try {
            // Query to check if there are any active users (status_id = 1)
            String query = "SELECT COUNT(*) FROM user WHERE status_id = 1";
            
            // Get the count of active users
            int activeUserCount = jdbcTemplate.queryForObject(query, Integer.class);
    
            // If there is at least one active user, return true
            return activeUserCount > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error in hasActiveUser: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean logoutUser(String email) {
        try {
            // Update user status to inactive
            String query = "UPDATE user SET status_id = 2 WHERE email = ?";
            int rowsAffected = jdbcTemplate.update(query, email);
            
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error in logoutUser: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    public int countUserPaymentCards(int userId) {
        try {
            String query = "SELECT COUNT(*) FROM card WHERE customer_id = ?";
            Integer count = jdbcTemplate.queryForObject(query, Integer.class, userId);
            return count != null ? count : 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error counting payment cards: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }
}