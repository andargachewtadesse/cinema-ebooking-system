package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import org.springframework.jdbc.core.RowMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalTime;


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
                if (isOverlapping(newShowTime)) {
                    System.out.println("Insertion aborted: Showtime overlaps with an existing one: " + newShowTime);
                    return false;
                }
    
                Integer seatCount = jdbcTemplate.queryForObject(seatCountQuery, Integer.class, newShowTime.getShowroomId());
    
                if (seatCount == null || seatCount <= 0) {
                    System.out.println("Invalid seat count for showroom_id: " + newShowTime.getShowroomId());
                    return false;
                }
    
                int rowsAffected = jdbcTemplate.update(insertQuery,
                    newShowTime.getMovieId(),
                    newShowTime.getShowroomId(),
                    newShowTime.getShowDate(),
                    newShowTime.getShowTime(),
                    seatCount,
                    newShowTime.getDuration(),
                    newShowTime.getPrice()
                );
    
                if (rowsAffected <= 0) {
                    System.out.println("Insert failed for showtime (rowsAffected=0): " + newShowTime);
                    return false;
                }
            }
    
            return true;
    
        } catch (DataAccessException e) {
            System.out.println("ShowTimeDAO: Database error in addShowTimes: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to add showtimes due to database error: " + e.getMostSpecificCause().getMessage(), e);
        } catch (Exception e) {
            System.out.println("ShowTimeDAO: Unexpected error in addShowTimes: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Unexpected error occurred while adding showtimes", e);
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
                show.setShowTime(rs.getObject("show_time", LocalTime.class));
                show.setDuration(rs.getInt("duration"));
                return show;
            }
        });

        if (newShowTime.getShowTime() == null) {
             System.err.println("Warning: newShowTime has null showTime during overlap check.");
             return false;
        }

        for (ShowTime existing : existingShowTimes) {
             if (existing.getShowTime() == null) {
                 System.err.println("Warning: existing ShowTime has null showTime during overlap check.");
                 continue;
             }
            LocalTime existingEndTime = existing.getShowTime().plusMinutes(existing.getDuration());
            LocalTime newStartTime = newShowTime.getShowTime();
            LocalTime newEndTime = newStartTime.plusMinutes(newShowTime.getDuration());

            if (newStartTime.isBefore(existingEndTime) && newEndTime.isAfter(existing.getShowTime())) {
                 System.out.println("Overlap detected: New " + newStartTime + "-" + newEndTime + " overlaps with Existing " + existing.getShowTime() + "-" + existingEndTime);
                return true;
            }
        }

        return false;
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
                showTime.setShowTime(rs.getObject("show_time", LocalTime.class));
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
