package cinema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.io.PrintWriter;
import java.io.StringWriter;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "http://localhost:3000")
public class MovieController {
    private final MovieDAO movieDAO;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public MovieController(MovieDAO movieDAO, JdbcTemplate jdbcTemplate) {
        this.movieDAO = movieDAO;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping
    public ResponseEntity<?> createMovie(@RequestBody Movie movie) {
        try {
            // Debug 
            System.out.println("MovieController: Received movie with title: " + movie.getTitle());
            System.out.println("MovieController: MPAA Rating: " + movie.getMpaaRating());
            System.out.println("MovieController: Status: " + movie.getStatus());
            
            // set a default
            if (movie.getMpaaRating() == null) {
                System.out.println("MovieController: Setting default MPAA rating");
                movie.setMpaaRating("PG");
            }
            
            //set a default
            if (movie.getStatus() == null) {
                System.out.println("MovieController: Setting default status");
                movie.setStatus("Coming Soon");
            }
            
            int movieId = movieDAO.insertMovie(movie);
            movie.setMovieId(movieId);
            return ResponseEntity.ok(movie);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create movie: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        try {
            System.out.println("MovieController: Fetching all movies");
            List<Movie> movies = movieDAO.getAllMovies();
            System.out.println("MovieController: Found " + movies.size() + " movies");
            return ResponseEntity.ok(movies);
        } catch (Exception e) {
            System.out.println("MovieController: Error fetching movies: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable String id) {
        try {
            System.out.println("MovieController: Received request for movie ID: " + id);
            int movieId = Integer.parseInt(id);
            Movie movie = movieDAO.getMovieById(movieId);
            
            if (movie != null) {
                System.out.println("MovieController: Successfully found movie: " + movie.getTitle());
                return ResponseEntity.ok(movie);
            } else {
                System.out.println("MovieController: No movie found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (NumberFormatException e) {
            System.out.println("MovieController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid movie ID format");
        } catch (Exception e) {
            System.out.println("MovieController: Error processing request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error processing request: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable String id) {
        try {
            System.out.println("MovieController: Received DELETE request for movie ID: " + id);
            int movieId = Integer.parseInt(id);
            
            
            try {
                String deleteQuery = "DELETE FROM movies WHERE movie_id = ?";
                int rowsAffected = jdbcTemplate.update(deleteQuery, movieId);
                
                if (rowsAffected > 0) {
                    System.out.println("MovieController: Successfully deleted movie with ID: " + id);
                    return ResponseEntity.ok().build();
                } else {
                    System.out.println("MovieController: No movie found with ID: " + id);
                    return ResponseEntity.notFound().build();
                }
            } catch (Exception e) {
                System.out.println("MovieController: Database error: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Database error: " + e.getMessage());
            }
        } catch (NumberFormatException e) {
            System.out.println("MovieController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid movie ID format");
        } catch (Exception e) {
            System.out.println("MovieController: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/showtimes")
    public ResponseEntity<?> addShowTime(@PathVariable String id, @RequestBody ShowTime showTime) {
        try {
            System.out.println("MovieController: Adding showtime for movie ID: " + id);
            int movieId = Integer.parseInt(id);
            
            // Set the movie ID in the showtime object
            showTime.setMovieId(movieId);
            
            // Add the showtime
            movieDAO.addShowTimeForMovie(movieId, showTime);
            
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (NumberFormatException e) {
            System.out.println("MovieController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid movie ID format");
        } catch (Exception e) {
            System.out.println("MovieController: Error adding showtime: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error adding showtime: " + e.getMessage());
        }
    }

    private String getStackTraceAsString(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }

    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("MovieController is working!");
    }

    @GetMapping("/db-health")
    public ResponseEntity<String> checkDatabaseConnection() {
        try {
            
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return ResponseEntity.ok("Database connection is working. Result: " + result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Database connection error: " + e.getMessage());
        }
    }
} 