package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
}
