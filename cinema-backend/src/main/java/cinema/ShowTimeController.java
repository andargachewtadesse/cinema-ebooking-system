package cinema;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
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
            System.out.println("ShowTimeController: Received showtimes data: " + showTimes);
            boolean success = showTimeDAO.addShowTimes(showTimes);

            if (success) {
                System.out.println("ShowTimeController: Successfully added showtimes (DAO returned true).");
                return ResponseEntity.ok("Showtimes added successfully!");
            } else {
                System.out.println("ShowTimeController: Failed to add showtimes (DAO returned false, possibly overlap).");
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Failed to add showtime. Possible overlap or invalid data.");
            }
        } catch (RuntimeException e) {
            System.out.println("ShowTimeController: Error adding showtimes: " + e.getMessage());
            e.printStackTrace();
            if (e.getCause() instanceof DataAccessException) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Database error adding showtime: " + e.getMessage());
            }
            if (e.getMessage() != null && e.getMessage().contains("overlap")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing showtime request: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("ShowTimeController: Unexpected error adding showtimes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> fetchShowTimesForMovie(@PathVariable int movieId) {
        try {
            System.out.println("ShowTimeController: Fetching showtimes for movie ID " + movieId);
            List<ShowTime> showTimes = showTimeDAO.getShowTimesByMovieId(movieId);

            return ResponseEntity.ok(showTimes);
        } catch (RuntimeException e) {
            System.out.println("ShowTimeController: Error fetching showtimes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching showtimes: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("ShowTimeController: Unexpected error fetching showtimes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

}
