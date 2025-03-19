package cinema;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MovieDAO movieDAO;

    @Override
    public void run(String... args) throws Exception {

        updateUserStatusToInactive(); // Update user status

        System.out.println("DataInitializer: Starting to populate showtimes...");
        
        // Get all movies
        List<Movie> movies = movieDAO.getAllMovies();
        
        if (movies.isEmpty()) {
            System.out.println("No movies found to add showtimes to");
            return;
        }
        
        // For each movie, check if it has showtimes
        for (Movie movie : movies) {
            List<ShowTime> existingShowTimes = movie.getShowTimes();
            
            if (existingShowTimes == null || existingShowTimes.isEmpty()) {
                System.out.println("Adding showtimes for movie: " + movie.getTitle());
                
                // Add 3 showtimes for this movie
                LocalDate today = LocalDate.now();
                
                for (int i = 0; i < 3; i++) {
                    ShowTime showTime = new ShowTime();
                    showTime.setMovieId(movie.getMovieId());
                    showTime.setShowDate(Date.valueOf(today.plusDays(i)));
                    showTime.setShowTime(Time.valueOf(LocalTime.of(12 + (i * 3), 0, 0)));
                    showTime.setScreenNumber(i + 1);
                    showTime.setAvailableSeats(80);
                    showTime.setPrice(new BigDecimal("12.99"));
                    
                    movieDAO.addShowTimeForMovie(movie.getMovieId(), showTime);
                }
            } else {
                System.out.println("Movie already has " + existingShowTimes.size() + " showtimes: " + movie.getTitle());
            }
        }
    }

    public void updateUserStatusToInactive() {
        try {
            String updateQuery = "UPDATE user SET status_id = 2"; // Assuming 2 means Inactive
            int rowsUpdated = jdbcTemplate.update(updateQuery);
            System.out.println("Updated " + rowsUpdated + " users' status to Inactive.");
        } catch (Exception e) {
            System.out.println("Error updating user status to Inactive: " + e.getMessage());
            e.printStackTrace();
        }
    }
}