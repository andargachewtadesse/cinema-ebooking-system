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
        String insertQuery = "INSERT INTO show_times (movie_id, showroom_id, show_date, show_time, available_seats, duration, price) " +
                             "VALUES (?, ?, ?, ?, ?, ?, ?)";
    
        String seatCountQuery = "SELECT seat_count FROM showroom WHERE showroom_id = ?";
    
        try {
            for (ShowTime newShowTime : showTimes) {
                // Check for overlapping showtime before inserting
                if (isOverlapping(newShowTime)) {
                    System.out.println("Insertion aborted: Showtime overlaps with an existing one: " + newShowTime);
                    return false;
                }
    
                // Get seat count from showroom table
                Integer seatCount = jdbcTemplate.queryForObject(seatCountQuery, Integer.class, newShowTime.getShowroomId());
    
                if (seatCount == null || seatCount <= 0) {
                    System.out.println("Invalid seat count for showroom_id: " + newShowTime.getShowroomId());
                    return false;
                }
    
                // Insert with fetched seat count as available seats
                int rowsAffected = jdbcTemplate.update(insertQuery,
                    newShowTime.getMovieId(),
                    newShowTime.getShowroomId(),
                    newShowTime.getShowDate(),
                    newShowTime.getShowTime(),
                    seatCount, // Use seat count from showroom as available seats
                    newShowTime.getDuration(),
                    newShowTime.getPrice()
                );
    
                if (rowsAffected <= 0) {
                    System.out.println("Insert failed for showtime: " + newShowTime);
                    return false;
                }
            }
    
            return true;
    
        } catch (Exception e) {
            System.out.println("ShowTimeDAO: Error in addShowTimes: " + e.getMessage());
            e.printStackTrace();
            return false;
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

    public List<ShowTime> getShowTimesByMovieId(int movieId) {
        String query = "SELECT * FROM show_times WHERE movie_id = ?";
    
        try {
            return jdbcTemplate.query(query, new Object[]{movieId}, (rs, rowNum) -> {
                ShowTime showTime = new ShowTime();
                showTime.setShowTimeId(rs.getInt("show_time_id"));
                showTime.setMovieId(rs.getInt("movie_id"));
                showTime.setShowroomId(rs.getInt("showroom_id"));
                showTime.setShowDate(rs.getDate("show_date"));
                showTime.setShowTime(rs.getTime("show_time"));
                showTime.setAvailableSeats(rs.getInt("available_seats"));
                showTime.setDuration(rs.getInt("duration"));
                showTime.setPrice(rs.getBigDecimal("price"));
                return showTime;
            });
        } catch (Exception e) {
            System.out.println("ShowTimeDAO: Error in getShowTimesByMovieId: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch showtimes for movie ID: " + movieId, e);
        }
    }
    
}
