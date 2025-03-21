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

    public String getUserEmailByStatusId() {
        try {
            // Query to get the email of the user whose status_id is 1 (active)
            String query = "SELECT email FROM user WHERE status_id = 1";
            return jdbcTemplate.queryForObject(query, String.class);
        } catch (Exception e) {
            System.out.println("UserDAO: Error retrieving email where status_id = 1: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    

    public User getUserProfileById(Integer id) {
        try {
            String query = "SELECT * FROM user WHERE user_id = ?";
            
            List<User> users = jdbcTemplate.query(
                query, 
                (rs, rowNum) -> {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setPassword(rs.getString("password"));
                    user.setFirstName(rs.getString("first_name"));
                    user.setLastName(rs.getString("last_name"));
                    user.setEmail(rs.getString("email"));
                    user.setStatusId(rs.getInt("status_id"));
                    user.setPromotionSubscription(rs.getBoolean("promotion_subscription"));
                    user.setVerificationCode(rs.getString("verification_code"));
                    
                    // Get address fields
                    user.setStreetAddress(rs.getString("street_address"));
                    user.setCity(rs.getString("city"));
                    user.setState(rs.getString("state"));
                    user.setZipCode(rs.getString("zip_code"));
                    
                    return user;
                },
                id
            );
            
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            System.out.println("UserDAO: Error in getUserByEmail: " + e.getMessage());
            e.printStackTrace();
            return null;
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
        System.out.println("UserDAO: Inserting user with Email: " + user.getEmail());
        
        // Generate verification code
        String verificationCode = UUID.randomUUID().toString();
        user.setVerificationCode(verificationCode);
        
        // Encrypt password
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        
        String sql = "INSERT INTO user (password, first_name, last_name, " +
                     "email, status_id, promotion_subscription, verification_code, " +
                     "street_address, city, state, zip_code) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            
            // Remove username parameter and adjust all indexes
            ps.setString(1, encryptedPassword);
            ps.setString(2, user.getFirstName());
            ps.setString(3, user.getLastName());
            ps.setString(4, user.getEmail());
            ps.setInt(5, 2); // Status inactive until verified
            ps.setBoolean(6, user.getPromotionSubscription());
            ps.setString(7, verificationCode);
            
            // Address fields (can be null)
            ps.setString(8, user.getStreetAddress());
            ps.setString(9, user.getCity());
            ps.setString(10, user.getState());
            ps.setString(11, user.getZipCode());
            
            return ps;
        }, keyHolder);
        
        int userId = keyHolder.getKey().intValue();
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);
        } catch (Exception e) {
            System.err.println("Warning: Failed to send verification email: " + e.getMessage());
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

    public boolean updateUserDetails(String email, String newFirstName, String newLastName, Boolean promotionSubscription) {
        try {
            // Fetch the user by email
            User user = getUserByEmail(email);
            
            // Check if the user exists
            if (user != null) {
                // Prepare the SQL update query
                String updateQuery = "UPDATE user SET first_name = ?, last_name = ?, promotion_subscription = ? WHERE email = ?";
                
                // Execute the update query
                int rowsAffected = jdbcTemplate.update(updateQuery, newFirstName, newLastName, promotionSubscription, email);
                
                // Check if the update was successful
                if (rowsAffected > 0) {
                    return true; // Successfully updated
                } else {
                    return false; // No rows affected, something went wrong
                }
            }
            
            // If user is not found, return false
            return false;
        } catch (Exception e) {
            // Log the error and print stack trace
            System.out.println("UserDAO: Error in updateUserDetails: " + e.getMessage());
            e.printStackTrace();
            return false; // Return false if an exception occurs
        }
    }
    

    public boolean changePassword(String email, String oldPassword, String newPassword) {
        try {

            String verifyQuery = "SELECT password FROM user WHERE email = ?";
            List<String> passwords = jdbcTemplate.query(
                verifyQuery, 
                (rs, rowNum) -> rs.getString("password"),
                email
            );
            
            if (!passwords.isEmpty()) {
                String storedPassword = passwords.get(0);
    
                // Verify that the old password matches the stored password (use passwordEncoder for comparison)
                if (passwordEncoder.matches(oldPassword, storedPassword)) {
                    // Encrypt the new password
                    String encryptedPassword = passwordEncoder.encode(newPassword);
                    
                    // Update the password
                    String updateQuery = "UPDATE user SET password = ? WHERE email = ?";
                    int rowsAffected = jdbcTemplate.update(updateQuery, encryptedPassword, email);
                    
                    return rowsAffected > 0; // Return true if the password was successfully updated
                } else {
                    return false; // Old password doesn't match
                }
            }
            return false; // User not found
        } catch (Exception e) {
            System.out.println("UserDAO: Error in changePassword: " + e.getMessage());
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
            String query = "SELECT password FROM user WHERE email = ?";
            
            // Use queryForList instead of the deprecated query method
            List<Map<String, Object>> results = jdbcTemplate.queryForList(query, email);
            
            if (results.isEmpty()) {
                return false;
            }
            
            String storedPassword = (String) results.get(0).get("password");
            
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

    public Integer getActiveUserId() {
        try {
          
            String query = "SELECT user_id FROM user WHERE status_id = 1";  
            
            // Assuming you execute the query and get the user ID
            return jdbcTemplate.queryForObject(query, Integer.class);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
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
    
    public boolean updateUserAddress(int userId, String streetAddress, String city, String state, String zipCode) {
        try {
            String query = "UPDATE user SET street_address = ?, city = ?, state = ?, zip_code = ? WHERE user_id = ?";
            
            int rowsAffected = jdbcTemplate.update(
                query,
                streetAddress,
                city,
                state,
                zipCode,
                userId
            );
            
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error updating user address: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean verifyPasswordResetCode(String email, String verificationCode) {
        try {
            String query = "SELECT * FROM user WHERE email = ? AND verification_code = ?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(query, email, verificationCode);
            
            return !results.isEmpty();
        } catch (Exception e) {
            System.out.println("UserDAO: Error in verifyPasswordResetCode: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean updatePasswordAfterReset(String email, String newPassword) {
        try {
            // Encrypt the new password
            String encryptedPassword = passwordEncoder.encode(newPassword);
            
            // Update the password and clear the verification code
            String updateQuery = "UPDATE user SET password = ?, verification_code = NULL WHERE email = ?";
            int rowsAffected = jdbcTemplate.update(updateQuery, encryptedPassword, email);
            
            return rowsAffected > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error in updatePasswordAfterReset: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}