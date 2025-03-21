package cinema;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "http://localhost:3000")
public class PromotionController {

    private final PromotionDAO promotionDAO;
    private final UserDAO userDAO;

    @Autowired
    public PromotionController(PromotionDAO promotionDAO, UserDAO userDAO) {
        this.promotionDAO = promotionDAO;
        this.userDAO = userDAO;
    }


    // DELETE promotion for active user
    @DeleteMapping("/delete")
    public ResponseEntity<?> deletePromotionForActiveUser() {
        try {
            boolean isDeleted = promotionDAO.deletePromotionByActiveUser();

            if (isDeleted) {
                return ResponseEntity.ok(Map.of("message", "Promotion deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "No promotion found to delete"));
            }
        } catch (Exception e) {
            System.out.println("PromotionController: Error deleting promotion: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting promotion: " + e.getMessage());
        }
    }

    // POST Add promotion to the active user
    @PostMapping("/add")
    public ResponseEntity<?> addPromotionToActiveUser() {
        try {
            // Add promotion to the active user
            boolean isAdded = promotionDAO.addPromotionToActiveUser();

            if (isAdded) {
                return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Promotion successfully added to active user."));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to add promotion to active user."));
            }
        } catch (Exception e) {
            System.out.println("PromotionController: Error adding promotion to active user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding promotion: " + e.getMessage());
        }
    }

    // GET promotion for the active user
    @GetMapping("/get")
    public ResponseEntity<?> getPromotionForActiveUser() {
        try {
            Promotion promotion = promotionDAO.getPromotionByActiveUserId();

            if (promotion != null) {
                return ResponseEntity.ok(Map.of("promotion", promotion));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No promotion found for active user"));
            }
        } catch (Exception e) {
            System.out.println("PromotionController: Error fetching promotion: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching promotion: " + e.getMessage());
        }
    }
}
