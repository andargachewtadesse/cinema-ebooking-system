package cinema;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:3000")
public class CardController {

    private final CardDAO cardDAO;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public CardController(CardDAO cardDAO, JdbcTemplate jdbcTemplate) {
        this.cardDAO = cardDAO;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Add a new card
    @PostMapping("/add")
    public ResponseEntity<?> addCard(@RequestBody Card card) {
        try {
    
            if(cardDAO.countCard() == false){
                return ResponseEntity.badRequest().body("Can't have more than 3 card");
            }

            System.out.println("CardController: Received card with cardholder name: " + card.getCardholderName());

            // Insert the card
            int cardId = cardDAO.insertCard(card);
            card.setId(cardId);
            return ResponseEntity.status(HttpStatus.CREATED).body(card);  // Return the card object with generated ID
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to add card: " + e.getMessage());
        }
    }

    // Get all cards
    @GetMapping("/activeCards")
    public ResponseEntity<List<Card>> getAllActiveCards() {
        try {
            List<Card> cards = cardDAO.getAllCardsForActiveUser();

            if (cards.isEmpty()) {
                return ResponseEntity.noContent().build(); // Return 204 if no cards are found
            }
        
            return ResponseEntity.ok(cards);  // Return list of cards if found
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



    // Delete a card by card ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCard(@PathVariable String id) {
        try {
            System.out.println("CardController: Received DELETE request for card ID: " + id);
            int cardId = Integer.parseInt(id);

            boolean isDeleted = cardDAO.deleteCard(cardId);

            if (isDeleted) {
                System.out.println("CardController: Successfully deleted card with ID: " + id);
                return ResponseEntity.ok().build();
            } else {
                System.out.println("CardController: No card found with ID: " + id);
                return ResponseEntity.notFound().build();
            }

        } catch (NumberFormatException e) {
            System.out.println("CardController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid card ID format");
        } catch (Exception e) {
            System.out.println("CardController: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("CardController is working!");
    }

    // Database health check
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

    // Utility method to get stack trace as a string
    private String getStackTraceAsString(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }
}
