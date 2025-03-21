package cinema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration
public class AdminInitializer {

    @Autowired
    private Environment env;

    @Bean
    public CommandLineRunner setupAdmin(UserDAO userDAO) {
        return args -> {
            try {
                // Read admin credentials from environment variables or properties
                String adminEmail = env.getProperty("admin.email", "admin@bulldawgs.com");
                String adminPassword = env.getProperty("admin.password", "Admin123!");
                String adminFirstName = env.getProperty("admin.firstName", "Admin");
                String adminLastName = env.getProperty("admin.lastName", "User");
                
                // Create initial admin account
                userDAO.createInitialAdminAccount(adminEmail, adminPassword, adminFirstName, adminLastName);
                
                // Verify admin was created
                User admin = userDAO.getUserByEmailWithAdminStatus(adminEmail);
                if (admin != null && admin.isAdmin()) {
                    System.out.println("Admin account verification successful: " + adminEmail);
                } else {
                    System.out.println("WARNING: Admin account verification failed!");
                }
            } catch (Exception e) {
                System.err.println("ERROR creating initial admin account: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
} 