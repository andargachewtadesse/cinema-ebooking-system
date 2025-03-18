package cinema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"cinema", "cinema.config"})
public class Main {

    @Autowired
    private DataInitializer dataInitializer;
    
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    
    }

}