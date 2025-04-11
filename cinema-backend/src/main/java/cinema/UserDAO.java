package cinema;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
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
                    
                    user.setAdmin(rs.getBoolean("is_admin"));
                    
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

    public boolean changePassword(int userId, String currentPassword, String newPassword) {
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
    public Map<String, Object> validateUserLogin(String email, String password) {
        try {
            Map<String, Object> result = new HashMap<>();
            result.put("isValid", false);
            
            // Query to get the password, is_admin, and status_id from the database
            String query = "SELECT password, is_admin, status_id FROM user WHERE email = ?";
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(query, email);
            
            if (!results.isEmpty()) {
                String storedPassword = (String) results.get(0).get("password");
                boolean isAdmin = (boolean) results.get(0).get("is_admin");
                
                // Verify password using BCrypt
                boolean passwordMatches = passwordEncoder.matches(password, storedPassword);
                
                if (passwordMatches) {
                    result.put("isValid", true);
                    result.put("isAdmin", isAdmin);
                    
                    // Only update status if this is a normal login (not during admin account creation)
                    // This update happens for real users logging in, not during account creation
                    query = "UPDATE user SET status_id = 1 WHERE email = ?";
                    jdbcTemplate.update(query, email);
                }
            }
            
            return result;
        } catch (Exception e) {
            System.out.println("Error during login validation: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> result = new HashMap<>();
            result.put("isValid", false);
            return result;
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

    // Method to create initial admin account (to be called from a command line runner)
    public void createInitialAdminAccount(String email, String password, String firstName, String lastName) {
        try {
            // Check if admin already exists
            String query = "SELECT COUNT(*) FROM user WHERE is_admin = TRUE";
            int adminCount = jdbcTemplate.queryForObject(query, Integer.class);
            
            if (adminCount == 0) {
                // No admin exists, create one
                String encryptedPassword = passwordEncoder.encode(password);
                
                String insertSql = "INSERT INTO user (password, first_name, last_name, email, status_id, is_admin) " +
                                   "VALUES (?, ?, ?, ?, 1, TRUE)";
                
                jdbcTemplate.update(insertSql, encryptedPassword, firstName, lastName, email);
                
                System.out.println("Initial admin account created with email: " + email);
            } else {
                System.out.println("Admin account already exists, skipping creation.");
            }
        } catch (Exception e) {
            System.out.println("Error creating initial admin account: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Method to get user with admin flag
    public User getUserByEmailWithAdminStatus(String email) {
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
                    user.setAdmin(rs.getBoolean("is_admin"));
                    
                    // Get address fields
                    user.setStreetAddress(rs.getString("street_address"));
                    user.setCity(rs.getString("city"));
                    user.setState(rs.getString("state"));
                    user.setZipCode(rs.getString("zip_code"));
                    
                    return user;
                },
                email
            );
            
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            System.out.println("UserDAO: Error in getUserByEmailWithAdminStatus: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // Method to create a new admin account
    public boolean createAdminAccount(User user) {
        try {
            // Encrypt password
            String encryptedPassword = passwordEncoder.encode(user.getPassword());
            
            // Debug message to check what we're about to do
            System.out.println("UserDAO: Creating admin account with email: " + user.getEmail() + 
                               " and explicitly setting status_id=2");
            

            String sql = "INSERT INTO user (password, first_name, last_name, email, status_id, is_admin) " +
                         "VALUES (?, ?, ?, ?, 2, TRUE)";
            
            // Execute the update with only the parameters that should be bound
            int result = jdbcTemplate.update(
                sql,
                encryptedPassword,
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
            );
            
            // Print confirmation of success
            if (result > 0) {
                System.out.println("UserDAO: Successfully created admin account with status_id=2");
                
                // Double check what got inserted
                String checkSql = "SELECT status_id FROM user WHERE email = ?";
                Integer statusId = jdbcTemplate.queryForObject(checkSql, Integer.class, user.getEmail());
                System.out.println("UserDAO: Verified new admin account has status_id=" + statusId);
            }
            
            return result > 0;
        } catch (Exception e) {
            System.out.println("UserDAO: Error creating admin account: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // Get all admin accounts
    public List<User> getAllAdmins() {
        try {
            String query = "SELECT * FROM user WHERE is_admin = TRUE";

            List<User> admins = jdbcTemplate.query(
                query, 
                (rs, rowNum) -> {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setFirstName(rs.getString("first_name"));
                    user.setLastName(rs.getString("last_name"));
                    user.setEmail(rs.getString("email"));
                    user.setStatusId(rs.getInt("status_id"));
                    user.setAdmin(true);
                    return user;
                }
            );

            return admins;
            
        } catch (Exception e) {
            System.out.println("UserDAO: Error getting all admins: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }
    
    // Get all users who have subscribed to promotions
    public List<User> getSubscribedUsers() {
        try {
            String query = "SELECT * FROM user WHERE promotion_subscription = TRUE";
            
            return jdbcTemplate.query(
                query, 
                (rs, rowNum) -> {
                    User user = new User();
                    user.setUserId(rs.getInt("user_id"));
                    user.setFirstName(rs.getString("first_name"));
                    user.setLastName(rs.getString("last_name"));
                    user.setEmail(rs.getString("email"));
                    user.setStatusId(rs.getInt("status_id"));
                    user.setPromotionSubscription(true);
                    return user;
                }
            );
        } catch (Exception e) {
            System.out.println("UserDAO: Error in getSubscribedUsers: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}