package cinema;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Admin endpoint to create a new promotion
    @PostMapping("/admin/create")
    public ResponseEntity<?> createPromotion(@RequestBody Promotion promotion) {
        try {
            System.out.println("PromotionController: Creating new promotion with discount: " + 
                              promotion.getDiscountPercentage() + "%, description: " + promotion.getDescription());
            
            // Set default values for new promotions
            promotion.setCreationDate(new java.util.Date());
            promotion.setSent(false);
            
            int promotionId = promotionDAO.createPromotion(promotion);
            promotion.setPromotionId(promotionId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Promotion created successfully",
                "promotion", promotion
            ));
        } catch (Exception e) {
            System.out.println("PromotionController: Error creating promotion: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create promotion: " + e.getMessage()));
        }
    }
    
    // Admin endpoint to get all promotions
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllPromotions() {
        try {
            List<Promotion> promotions = promotionDAO.getAllPromotions();
            return ResponseEntity.ok(promotions);
        } catch (Exception e) {
            System.out.println("PromotionController: Error fetching promotions: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch promotions: " + e.getMessage()));
        }
    }
    
    // Admin endpoint to send a promotion to all subscribed users
    @PostMapping("/admin/send/{id}")
    public ResponseEntity<?> sendPromotionToUsers(@PathVariable int id) {
        try {
            boolean sent = promotionDAO.sendPromotionToSubscribers(id);
            
            if (sent) {
                return ResponseEntity.ok(Map.of("message", "Promotion successfully sent to all subscribed users"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to send promotion. It may not exist, already been sent, or there are no subscribed users."));
            }
        } catch (Exception e) {
            System.out.println("PromotionController: Error sending promotion: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send promotion: " + e.getMessage()));
        }
    }
}