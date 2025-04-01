package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;


@Repository
public class ShowTimeDAO {
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public ShowTimeDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean addShowTimes(List<ShowTime> showTimes) {
        String query = "INSERT INTO show_times (movie_id, showroom_id, show_date, show_time, available_seats, duration, price) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try {
            for (ShowTime newShowTime : showTimes) {
                // Check for overlapping showtime before inserting
                if (isOverlapping(newShowTime)) {
                    System.out.println("Insertion aborted: Showtime overlaps with an existing one.");
                    return false; // Abort insertion
                }

                // Insert if no overlap
                int rowsAffected = jdbcTemplate.update(query,
                    newShowTime.getMovieId(),
                    newShowTime.getShowroomId(),
                    newShowTime.getShowDate(),
                    newShowTime.getShowTime(),
                    newShowTime.getAvailableSeats(),
                    newShowTime.getDuration(),
                    newShowTime.getPrice()
                );

                if (rowsAffected <= 0) {
                    return false; // Abort if insert fails
                }
            }

            return true; // Successfully inserted all showtimes

        } catch (Exception e) {
            System.out.println("ShowTimeDAO: Error in addShowTimes: " + e.getMessage());
            e.printStackTrace();
            return false; // Return false if an exception occurs
        }
    }

    private boolean isOverlapping(ShowTime newShowTime) {
        String checkQuery = "SELECT show_time, duration FROM show_times WHERE showroom_id = ? AND show_date = ?";

        List<ShowTime> existingShowTimes = jdbcTemplate.query(checkQuery, new Object[]{
            newShowTime.getShowroomId(), newShowTime.getShowDate()
        }, new RowMapper<ShowTime>() {
            @Override
            public ShowTime mapRow(ResultSet rs, int rowNum) throws SQLException {
                ShowTime show = new ShowTime();
                show.setShowTime(rs.getTime("show_time"));
                show.setDuration(rs.getInt("duration"));
                return show;
            }
        });

        for (ShowTime existing : existingShowTimes) {
            // Calculate existing showtime end time
            long existingEndTime = existing.getShowTime().getTime() + (existing.getDuration() * 60 * 1000);
            long newStartTime = newShowTime.getShowTime().getTime();
            long newEndTime = newStartTime + (newShowTime.getDuration() * 60 * 1000);

            // Overlap condition: newStartTime < existingEndTime AND newEndTime > existingStartTime
            if (newStartTime < existingEndTime && newEndTime > existing.getShowTime().getTime()) {
                return true; // Overlap found
            }
        }

        return false; // No overlap
    }
}
