package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "http://localhost:3000")
public class ShowTimeController {
    
    private final ShowTimeDAO showTimeDAO;

    @Autowired
    public ShowTimeController(ShowTimeDAO showTimeDAO) {
        this.showTimeDAO = showTimeDAO;
    }

    // Add multiple showtimes
    @PostMapping("/add")
    public ResponseEntity<String> addShowTimes(@RequestBody List<ShowTime> showTimes) {
        try {
            System.out.println("ShowTimeController: Adding showtimes...");
            boolean success = showTimeDAO.addShowTimes(showTimes);

            if (success) {
                System.out.println("ShowTimeController: Successfully added showtimes.");
                return ResponseEntity.ok("Showtimes added successfully!");
            } else {
                System.out.println("ShowTimeController: Failed to add some showtimes.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add showtimes.");
            }
        } catch (Exception e) {
            System.out.println("ShowTimeController: Error adding showtimes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error while adding showtimes.");
        }
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowTime>> fetchShowTimesForMovie(@PathVariable int movieId) {
        try {
            System.out.println("ShowTimeController: Fetching showtimes for movie ID " + movieId);
            List<ShowTime> showTimes = showTimeDAO.getShowTimesByMovieId(movieId);

            if (showTimes.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            return ResponseEntity.ok(showTimes);
        } catch (Exception e) {
            System.out.println("ShowTimeController: Error fetching showtimes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
