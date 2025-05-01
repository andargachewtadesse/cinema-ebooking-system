package cinema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
   
    private BookingDAO bookingDAO;

    @Override
    public void run(String... args) throws Exception {

        updateUserStatusToInactive(); // Update user status
        bookingDAO.cancelPendingBookingsAfter30Minutes(); //cancle pending booking
        
    }

    public void updateUserStatusToInactive() {
        try {
            String updateQuery = "UPDATE user SET status_id = 2"; // 2 means Inactive
            int rowsUpdated = jdbcTemplate.update(updateQuery);
            System.out.println("Updated " + rowsUpdated + " users' status to Inactive.");
        } catch (Exception e) {
            System.out.println("Error updating user status to Inactive: " + e.getMessage());
            e.printStackTrace();
        }
    }
}