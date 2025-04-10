package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ShowroomDAO {
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public ShowroomDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
     
    //Get all showrooms in admin page for scheduling movie
    public List<Showroom> getAllShowrooms() {
        try {
            String query = "SELECT * FROM showroom";

            return jdbcTemplate.query(
                query,
                (rs, rowNum) -> {
                    Showroom showroom = new Showroom();
                    showroom.setShowroomId(rs.getInt("showroom_id"));
                    showroom.setTheatreId(rs.getInt("theatre_id"));
                    showroom.setShowroomName(rs.getString("showroom_name"));
                    showroom.setSeatCount(rs.getInt("seat_count"));
                    return showroom;
                }
            );

        } catch (Exception e) {
            System.out.println("ShowroomDAO: Error in getAllShowrooms: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch all showrooms", e);
        }
    }
    
    //getting showroom info by id, used in booking
    public Showroom getShowroomById(int showroomId) {
        try {
            String query = "SELECT * FROM showroom WHERE showroom_id = ?";

            return jdbcTemplate.queryForObject(
                query,
                (rs, rowNum) -> {
                    Showroom showroom = new Showroom();
                    showroom.setShowroomId(rs.getInt("showroom_id"));
                    showroom.setTheatreId(rs.getInt("theatre_id"));
                    showroom.setShowroomName(rs.getString("showroom_name"));
                    showroom.setSeatCount(rs.getInt("seat_count"));
                    return showroom;
                },
                showroomId
            );

        } catch (EmptyResultDataAccessException e) {
            System.out.println("No showroom found with ID: " + showroomId);
            return null; // or throw custom NotFoundException if preferred
        } catch (Exception e) {
            System.out.println("ShowroomDAO: Error in getShowroomById: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch showroom with ID " + showroomId, e);
        }
    }

}
