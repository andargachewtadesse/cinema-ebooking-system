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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
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
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> userData) {
        try {
            System.out.println("UserController: Received request to register user");
            
            // Extract user data
            User user = new User();
            user.setFirstName((String) userData.get("firstName"));
            user.setLastName((String) userData.get("lastName"));
            user.setEmail((String) userData.get("email"));
            user.setPassword((String) userData.get("password"));
            user.setPromotionSubscription((Boolean) userData.getOrDefault("promotionSubscription", false));
            
            // Check if email already exists
            User existingUser = userDAO.getUserByEmail(user.getEmail());
            if (existingUser != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
            }
            
            // Extract address data if present
            Map<String, Object> addressData = (Map<String, Object>) userData.get("address");
            if (addressData != null) {
                user.setStreetAddress((String) addressData.get("street"));
                user.setCity((String) addressData.get("city"));
                user.setState((String) addressData.get("state"));
                user.setZipCode((String) addressData.get("zipCode"));
            }
            
            // Insert user
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

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> payload) {
        try {
            int userId = userDAO.getActiveUserId();
            String oldPassword = payload.get("oldPassword");
            String newPassword = payload.get("newPassword");
            System.out.println("+++++++++++++++++" + oldPassword + "+++++++++++++++++++++");
            // Validate the old password and update with the new password
            boolean passwordChanged = userDAO.changePassword(userId, oldPassword, newPassword);
            
            if (passwordChanged) {
                return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Incorrect old password"));
            }
        } catch (Exception e) {
            System.out.println("UserController: Error changing password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to change password: " + e.getMessage());
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
                System.out.println("UserController: Found user: " + user.getEmail());
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
            
            boolean success = userDAO.changePassword(userId, currentPassword, newPassword);
            
            if (success) {
                System.out.println("UserController: Successfully updated password for user with ID: " + id);
                
                // Send profile update email 
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

    @PutMapping("/update-details")
    public ResponseEntity<?> updateUserDetails(@RequestBody Map<String, Object> userDetails) {
        try {
            // Extract the email, first name, and last name from the request body
            String email = (String) userDetails.get("email");
            String newFirstName = (String) userDetails.get("firstName");
            String newLastName = (String) userDetails.get("lastName");
            Boolean promotionSubscription = (Boolean) userDetails.get("promotionSubscription");
        
            if (email == null || newFirstName == null || newLastName == null) {
                return ResponseEntity.badRequest().body("Email, first name, and last name are required");
            }

            // Get the current user email before update (to send notification to this email)
            String currentEmail = email;  // Default to the provided email
            Integer activeUserId = userDAO.getActiveUserId();
            if (activeUserId != null) {
                User currentUser = userDAO.getUserProfileById(activeUserId);
                if (currentUser != null && !currentUser.getEmail().equals(email)) {
                    // If email is being changed, store the original email for notification
                    currentEmail = currentUser.getEmail();
                    System.out.println("UserController: Email is being changed from " + currentEmail + " to " + email);
                }
            }

            // Call the UserDAO method to update user details
            boolean success = userDAO.updateUserDetails(email, newFirstName, newLastName, promotionSubscription);

            if (success) {
                // Send profile update email notification to the CURRENT email (before update)
                try {
                    System.out.println("UserController: Sending profile update notification to: " + currentEmail);
                    emailService.sendProfileUpdateEmail(currentEmail);
                    System.out.println("UserController: Profile update email sent successfully to: " + currentEmail);
                    
                    // If email was changed, also send notification to the new email
                    if (!currentEmail.equals(email)) {
                        System.out.println("UserController: Also sending profile update notification to new email: " + email);
                        emailService.sendProfileUpdateEmail(email);
                    }
                } catch (Exception emailError) {
                    System.err.println("UserController: Failed to send profile update email: " + emailError.getMessage());
                    emailError.printStackTrace();
                    // Continue with the response despite email failure
                }
                return ResponseEntity.ok(Map.of("message", "User details updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found with the provided email"));
            }
        } catch (Exception e) {
            System.out.println("UserController: Error updating user details: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating user details: " + e.getMessage());
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
    
        Map<String, Object> result = userDAO.validateUserLogin(email, password);
        boolean isValid = (boolean) result.get("isValid");

        if (isValid) {
            // Get user details
            User user = userDAO.getUserByEmailWithAdminStatus(email);
            
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
            response.put("isAdmin", user.isAdmin());
            response.put("token", generateJwtToken(user)); 

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

    @GetMapping("/userEmail")
    public ResponseEntity<Map<String, Object>> getActiveUserEmail() {
        try {
            // Call the method from UserDAO to get the email of the user with status_id = 2
            String email = userDAO.getUserEmailByStatusId();
        
            if (email == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No active user found with status_id = 2"));
            }
        
            Map<String, Object> response = new HashMap<>();
            response.put("email", email);
        
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("UserController: Error retrieving active user email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(Map.of("error", "Error retrieving active user email"));
        }
    }


    @GetMapping("/profileLoad")
    public ResponseEntity<Map<String, Object>> getActiveUserProfile() {
    try {
        // Get active user ID
        Integer activeUserId = userDAO.getActiveUserId(); // This method would return the ID of the active user

        if (activeUserId != null) {
            // Fetch the user's profile from the database
            User activeUser = userDAO.getUserProfileById(activeUserId);  
            
            if (activeUser != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("userId", activeUser.getUserId());
                response.put("firstName", activeUser.getFirstName());
                response.put("lastName", activeUser.getLastName());
                response.put("email", activeUser.getEmail());
                response.put("promotionSubscription", activeUser.getPromotionSubscription());
                
                
                // Add the address fields to the response
                response.put("streetAddress", activeUser.getStreetAddress());
                response.put("city", activeUser.getCity());
                response.put("state", activeUser.getState());
                response.put("zipCode", activeUser.getZipCode());
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Active user profile not found"));
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "No active user found"));
        }
    } catch (Exception e) {
        System.out.println("UserController: Error getting active user profile: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "Error fetching active user profile"));
    }
    }

    // Health check for UserController
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("UserController is working!");
    }

    @PutMapping("/{id}/address")
    public ResponseEntity<?> updateUserAddress(@PathVariable String id, @RequestBody Map<String, String> addressData) {
        try {
            System.out.println("UserController: Received PUT request to update address for user ID: " + id);
            int userId = Integer.parseInt(id);
            
            String streetAddress = addressData.get("streetAddress");
            String city = addressData.get("city");
            String state = addressData.get("state");
            String zipCode = addressData.get("zipCode");
            
            boolean success = userDAO.updateUserAddress(userId, streetAddress, city, state, zipCode);
            
            if (success) {
                System.out.println("UserController: Successfully updated address for user with ID: " + id);
                return ResponseEntity.ok(Map.of("message", "Address updated successfully"));
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

    @PutMapping("/update-address")
    public ResponseEntity<?> updateUserAddressByEmail(@RequestBody Map<String, String> addressData) {
        try {
            System.out.println("UserController: Received PUT request to update address for user email: " + addressData.get("email"));
            
            String email = addressData.get("email");
            String streetAddress = addressData.get("streetAddress");
            String city = addressData.get("city");
            String state = addressData.get("state");
            String zipCode = addressData.get("zipCode");
            
            if (email == null) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            // Log the address data for debugging
            System.out.println("Email: " + email);
            System.out.println("Street Address: " + streetAddress);
            System.out.println("City: " + city);
            System.out.println("State: " + state);
            System.out.println("ZIP Code: " + zipCode);
            
            // Get the user ID using the email
            User user = userDAO.getUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found with email: " + email);
            }
            
            int userId = user.getUserId();
            
            boolean success = userDAO.updateUserAddress(userId, streetAddress, city, state, zipCode);
            
            if (success) {
                // Send profile update email notification
                emailService.sendProfileUpdateEmail(email);
                System.out.println("UserController: Successfully updated address for user with email: " + email);
                return ResponseEntity.ok(Map.of("message", "Address updated successfully"));
            } else {
                System.out.println("UserController: Failed to update address for user with email: " + email);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update address");
            }
        } catch (Exception e) {
            System.out.println("UserController: Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String verificationCode = payload.get("verificationCode");
            String newPassword = payload.get("newPassword");
            
            if (email == null || verificationCode == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email, verification code, and new password are required"));
            }
            
            // First verify the code matches
            boolean isVerified = userDAO.verifyPasswordResetCode(email, verificationCode);
            
            if (!isVerified) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid verification code"));
            }
            
            // If verified, update the password
            boolean passwordUpdated = userDAO.updatePasswordAfterReset(email, newPassword);
            
            if (passwordUpdated) {
                return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update password"));
            }
        } catch (Exception e) {
            System.out.println("UserController: Error in password reset: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    // Admin login endpoint
    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody User loginRequest) {
        System.out.println("Admin login attempt for email: " + loginRequest.getEmail());
        
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Map<String, Object> result = userDAO.validateUserLogin(email, password);
        boolean isValid = (boolean) result.get("isValid");
        
        System.out.println("Login validation result: " + isValid);
        
        if (isValid) {
            boolean isAdmin = (boolean) result.get("isAdmin");
            System.out.println("Is admin account: " + isAdmin);
            
            // Get admin user details
            User user = userDAO.getUserByEmailWithAdminStatus(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "User not found after successful login"));
            }
            
            // Return JSON response with a success message and admin info
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin login successful");
            response.put("userId", user.getUserId());
            response.put("email", email);
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("isAdmin", true);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid email or password"));
        }
    }

    // Get all admin accounts endpoint
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllAdmins(@RequestHeader("Authorization") String authHeader) {
        try {
            // Auth check - make sure the request comes from an admin
            // Implement proper JWT token validation here
            if (!isAdminRequest(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Not authorized"));
            }
            
            List<User> admins = userDAO.getAllAdmins();
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get admin accounts: " + e.getMessage()));
        }
    }

    // Create new admin account endpoint
    @PostMapping("/admin/create")
    public ResponseEntity<?> createAdminAccount(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, Object> userData
    ) {
        try {
            // Auth check - make sure the request comes from an admin
            if (!isAdminRequest(authHeader)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Not authorized"));
            }
            
            // Create and populate user object
            User newAdmin = new User();
            newAdmin.setFirstName((String) userData.get("firstName"));
            newAdmin.setLastName((String) userData.get("lastName"));
            newAdmin.setEmail((String) userData.get("email"));
            newAdmin.setPassword((String) userData.get("password"));
            
            // Apply status ID - FORCE it to 2 (inactive) regardless of what was sent
            newAdmin.setStatusId(2);
            
            System.out.println("UserController: Creating admin with statusId=" + newAdmin.getStatusId());
            
            // Check if email already exists
            User existingUser = userDAO.getUserByEmail(newAdmin.getEmail());
            if (existingUser != null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already registered"));
            }
            
            boolean success = userDAO.createAdminAccount(newAdmin);
            
            if (success) {
                return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Admin account created successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create admin account"));
            }
        } catch (Exception e) {
            System.out.println("Error creating admin account: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create admin account: " + e.getMessage()));
        }
    }

    // Helper method to verify if request is from an admin
    private boolean isAdminRequest(String authHeader) {

        return authHeader != null && authHeader.startsWith("Bearer ");
    }

    // Placeholder for JWT token generation
    private String generateJwtToken(User user) {

        return "dummy_token_" + user.getUserId() + "_" + (user.isAdmin() ? "admin" : "user");
    }
}