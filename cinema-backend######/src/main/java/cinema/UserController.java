package cinema;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserDAO userDAO;
    private final EmailService emailService;
    
    @Autowired
    public UserController(UserDAO userDAO, EmailService emailService) {
        this.userDAO = userDAO;
        this.emailService = emailService;
    }

    // CREATE User
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            System.out.println("UserController: Received request to register user with username: " + user.getUsername());
            
            // Check if email already exists
            User existingUser = userDAO.getUserByEmail(user.getEmail());
            if (existingUser != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
            }
            
            // Insert user using UserDAO
            int userId = userDAO.insertUser(user);
            user.setUserId(userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Registration successful. Please check your email for verification.",
                "userId", userId
            ));
        } catch (Exception e) {
            System.out.println("UserController: Error registering user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to register user: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyUser(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String verificationCode = payload.get("verificationCode");
            
            boolean verified = userDAO.verifyUser(email, verificationCode);
            
            if (verified) {
                return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now login."));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid verification code"));
            }
        } catch (Exception e) {
            System.out.println("UserController: Error verifying user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to verify user: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            
            boolean requestSent = userDAO.resetPasswordRequest(email);
            
            if (requestSent) {
                return ResponseEntity.ok(Map.of("message", "Password reset instructions sent to your email"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Email not found"));
            }
        } catch (Exception e) {
            System.out.println("UserController: Error processing forgot password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to process request: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String resetToken = payload.get("resetToken");
            String newPassword = payload.get("newPassword");
            
            boolean resetSuccessful = userDAO.resetPassword(email, resetToken, newPassword);
            
            if (resetSuccessful) {
                return ResponseEntity.ok(Map.of("message", "Password reset successful"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid reset token"));
            }
        } catch (Exception e) {
            System.out.println("UserController: Error resetting password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to reset password: " + e.getMessage());
        }
    }

    // GET all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            System.out.println("UserController: Fetching all users");
            List<User> users = userDAO.getAllUser();
            System.out.println("UserController: Found " + users.size() + " users");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.out.println("UserController: Error fetching users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            System.out.println("UserController: Received request for user ID: " + id);
            int userId = Integer.parseInt(id);
            List<User> users = userDAO.getAllUser();
            User user = users.stream()
                .filter(u -> u.getUserId() == userId)
                .findFirst()
                .orElse(null);
            
            if (user != null) {
                System.out.println("UserController: Found user: " + user.getUsername());
                return ResponseEntity.ok(user);
            } else {
                System.out.println("UserController: No user found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (NumberFormatException e) {
            System.out.println("UserController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            System.out.println("UserController: Error processing request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error processing request: " + e.getMessage());
        }
    }

    // DELETE user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            System.out.println("UserController: Received DELETE request for user ID: " + id);
            int userId = Integer.parseInt(id);
            
            boolean isDeleted = userDAO.deleteUser(userId);  // Call delete method from UserDAO
            if (isDeleted) {
                System.out.println("UserController: Successfully deleted user with ID: " + id);
                return ResponseEntity.ok().build();
            } else {
                System.out.println("UserController: No user found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (NumberFormatException e) {
            System.out.println("UserController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            System.out.println("UserController: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    // PUT update user name
    @PutMapping("/{id}/name")
    public ResponseEntity<?> updateUserName(@PathVariable String id, @RequestBody User user) {
        try {
            System.out.println("UserController: Received PUT request to update name for user ID: " + id);
            int userId = Integer.parseInt(id);
        
            boolean success = userDAO.updateUserName(userId, user.getFirstName(), user.getLastName());
            
            if (success) {
                System.out.println("UserController: Successfully updated name for user with ID: " + id);
                
                // Send profile update email (optional bonus)
                User updatedUser = userDAO.getAllUser().stream()
                    .filter(u -> u.getUserId() == userId)
                    .findFirst()
                    .orElse(null);
                    
                if (updatedUser != null) {
                    emailService.sendProfileUpdateEmail(updatedUser.getEmail());
                }
                
                return ResponseEntity.ok().build();
            } else {
                System.out.println("UserController: No user found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (NumberFormatException e) {
            System.out.println("UserController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            System.out.println("UserController: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }
    
    // PUT update user password
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updateUserPassword(@PathVariable String id, @RequestBody Map<String, String> passwords) {
        try {
            System.out.println("UserController: Received PUT request to update password for user ID: " + id);
            int userId = Integer.parseInt(id);
            
            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Both current and new passwords are required");
            }
            
            boolean success = userDAO.updateUserPassword(userId, currentPassword, newPassword);
            
            if (success) {
                System.out.println("UserController: Successfully updated password for user with ID: " + id);
                
                // Send profile update email (optional bonus)
                User updatedUser = userDAO.getAllUser().stream()
                    .filter(u -> u.getUserId() == userId)
                    .findFirst()
                    .orElse(null);
                    
                if (updatedUser != null) {
                    emailService.sendProfileUpdateEmail(updatedUser.getEmail());
                }
                
                return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
            } else {
                System.out.println("UserController: Invalid current password or user not found");
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid current password"));
            }
        } catch (NumberFormatException e) {
            System.out.println("UserController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            System.out.println("UserController: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }
    
    // PUT update promotion subscription
    @PutMapping("/{id}/promotion")
    public ResponseEntity<?> updatePromotionSubscription(@PathVariable String id, @RequestBody Map<String, Boolean> payload) {
        try {
            System.out.println("UserController: Received PUT request to update promotion subscription for user ID: " + id);
            int userId = Integer.parseInt(id);
            
            Boolean subscribe = payload.get("subscribe");
            
            if (subscribe == null) {
                return ResponseEntity.badRequest().body("Subscribe parameter is required");
            }
            
            boolean success = userDAO.updatePromotionSubscription(userId, subscribe);
            
            if (success) {
                System.out.println("UserController: Successfully updated promotion subscription for user with ID: " + id);
                return ResponseEntity.ok(Map.of("message", "Promotion subscription updated successfully"));
            } else {
                System.out.println("UserController: No user found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (NumberFormatException e) {
            System.out.println("UserController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            System.out.println("UserController: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    // User Login function
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();
    
        boolean isValid = userDAO.validateUserLogin(email, password);

        if (isValid) {
            // Get user details
            User user = userDAO.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "User not found after successful login"));
            }
            
            // Return JSON response with a success message and user info
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("userId", user.getUserId());
            response.put("email", email);
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("isAdmin", false); // Implement admin check logic if needed

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password"));
        }
    }
    
    // User Logout function
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        
        if (email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        
        boolean success = userDAO.logoutUser(email);
        
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Logout successful"));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to logout user"));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> checkActiveUser() {
        try {
            // Call the method from UserDAO to check if there are active users
            boolean hasActiveUsers = userDAO.hasActiveUser();
        
            Map<String, Object> response = new HashMap<>();
            response.put("hasActiveUsers", hasActiveUsers);
        
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("UserController: Error checking for active users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(Map.of("error", "Error checking for active users"));
        }
    }
    
    // GET card count for user
    @GetMapping("/{id}/cards/count")
    public ResponseEntity<?> getCardCount(@PathVariable String id) {
        try {
            int userId = Integer.parseInt(id);
            int cardCount = userDAO.countUserPaymentCards(userId);
            
            return ResponseEntity.ok(Map.of("count", cardCount));
        } catch (NumberFormatException e) {
            System.out.println("UserController: Invalid ID format: " + id);
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            System.out.println("UserController: Error counting cards: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error counting cards"));
        }
    }

    // Health check for UserController
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("UserController is working!");
    }
}