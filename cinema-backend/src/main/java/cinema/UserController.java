package cinema;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")  // Adjust the origin as per your frontend's setup
public class UserController {

    private final UserDAO userDAO;
    
    @Autowired
    public UserController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    // CREATE User
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            System.out.println("UserController: Received request to create user with username: " + user.getUsername());
            
            // Insert user using UserDAO
            int userId = userDAO.insertUser(user);
            user.setUserId(userId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (Exception e) {
            System.out.println("UserController: Error creating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to create user: " + e.getMessage());
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

        // PUT update user first name and last name
    @PutMapping("/{id}/name")
    public ResponseEntity<?> updateUserName(@PathVariable String id, @RequestBody User user) {
        try {
            System.out.println("UserController: Received PUT request to update name for user ID: " + id);
            int userId = Integer.parseInt(id);
        
            boolean success = userDAO.updateUserName(userId, user.getFirstName(), user.getLastName());
        
            if (success) {
                System.out.println("UserController: Successfully updated name for user with ID: " + id);
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

    // PUT update user email
    @PutMapping("/{id}/email")
    public ResponseEntity<?> updateUserEmail(@PathVariable String id, @RequestBody User user) {
        try {
            System.out.println("UserController: Received PUT request to update email for user ID: " + id);
            int userId = Integer.parseInt(id);
        
            boolean success = userDAO.updateUserEmail(userId, user.getEmail());
        
            if (success) {
                System.out.println("UserController: Successfully updated email for user with ID: " + id);
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

    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {

        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();
        
        // Check if username and password are valid
        boolean isValid = userDAO.validateUserLogin(username, password);

        if (isValid) {
            return ResponseEntity.ok("Login successful");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
    }



    // Health check for UserController
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("UserController is working!");
    }
}
