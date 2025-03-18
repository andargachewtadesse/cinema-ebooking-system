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
public class UserDAO {
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public UserDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<User> getAllUser() {
        try {
            String query = "SELECT * FROM user";

            List<User> users = jdbcTemplate.query(query, (rs, rowNum) -> {
                
                User user = new User();

                user.setUserId(rs.getInt("user_id"));
                user.setUsername(rs.getString("username"));
                user.setPassword(rs.getString("password"));
                user.setFirstName(rs.getString("first_name"));
                user.setLastName(rs.getString("last_name"));
                user.setEmail(rs.getString("email"));
                
                return user;
            });

            return users;
            
        } catch (Exception e) {
            System.out.println("UserDAO: Error in getAllUser: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch all users", e);
        }
    }


    public int insertUser(User user) throws SQLException {
        // Debug 
        System.out.println("UserDAO: Inserting user with username: " + user.getUsername());
        
        String sql = "INSERT INTO user (username, password, first_name, last_name, " +
                     "email) " +
                     "VALUES (?, ?, ?, ?, ?)";
        
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getPassword());
            ps.setString(3, user.getFirstName());
            ps.setString(4, user.getLastName());
            ps.setString(5, user.getEmail());
            
            return ps;

        }, keyHolder);
        
        return keyHolder.getKey().intValue();
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
    
    // User Login validate
    public boolean validateUserLogin(String email, String password) {
        try {
            // Query to get the password from the database
            String query = "SELECT password FROM user WHERE email = ?";
            String storedPassword = jdbcTemplate.queryForObject(query, String.class, email);

<<<<<<< HEAD
            // Compare the provided password with the stored password
            
            if (password.equals(storedPassword)){ //Change user status to active with if login successful
                query = "UPDATE user SET status_id = 1 WHERE email = ?";
                jdbcTemplate.update(query, email);
            }
            
=======
            System.out.println("DDDDDDDDDDDD"+ storedPassword);
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
            // Compare the provided password with the stored password
            return password.equals(storedPassword);

        } catch (Exception e) {
            System.out.println("Error during login validation: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

<<<<<<< HEAD
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

=======
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
}
