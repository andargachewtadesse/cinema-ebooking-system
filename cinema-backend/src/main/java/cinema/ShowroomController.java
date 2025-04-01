package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/showrooms")
@CrossOrigin(origins = "http://localhost:3000")
public class ShowroomController {
    private final ShowroomDAO showroomDAO;

    @Autowired
    public ShowroomController(ShowroomDAO showroomDAO) {
        this.showroomDAO = showroomDAO;
    }

    //Get all showrooms
    @GetMapping
    public ResponseEntity<List<Showroom>> getShowrooms() {
        try {
            System.out.println("ShowroomController: Fetching all showrooms");
            List<Showroom> showrooms = showroomDAO.getAllShowrooms();
            System.out.println("ShowroomController: Found " + showrooms.size() + " showrooms");
            return ResponseEntity.ok(showrooms);
        } catch (Exception e) {
            System.out.println("ShowroomController: Error fetching showrooms: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
