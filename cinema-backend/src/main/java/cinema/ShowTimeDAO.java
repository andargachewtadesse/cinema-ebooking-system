package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ShowTimeDAO {
    private final JdbcTemplate jdbcTemplate;
    private final ShowTime showTime;
    

    @Autowired
    public ShowTimeDAO(JdbcTemplate jdbcTemplate, ShowTime showTime) {
        this.jdbcTemplate = jdbcTemplate;
        this.showTime = showTime;
    }


    public boolean addShowTimes(List<ShowTime> showTimes) {
        String query = "INSERT INTO show_times (movie_id, showroom_id, show_date, show_time, available_seats, duration, price) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?)";
    
        try {
            
            int rowsAffected = 0;
    
            for (ShowTime showTime : showTimes) {
                    rowsAffected = jdbcTemplate.update(query, 
                    showTime.getMovieId(),
                    showTime.getShowroomId(),
                    showTime.getShowDate(),
                    showTime.getShowTime(),
                    showTime.getAvailableSeats(),
                    showTime.getDuration(),
                    showTime.getPrice()
                );
                    
            }
    
            return (rowsAffected <= 0);
    
        } catch (Exception e) {
            System.out.println("ShowTimeDAO: Error in addShowTimes: " + e.getMessage());
            e.printStackTrace();
            return false; // Return false if an exception occurs
        }
    }
    
    
}
