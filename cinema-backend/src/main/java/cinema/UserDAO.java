package cinema;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

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

    public boolean deleteMovie(int user_id) {
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
}
