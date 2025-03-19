package cinema;

<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Autowired;
=======
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"cinema", "cinema.config"})
public class Main {
<<<<<<< HEAD

    @Autowired
    private DataInitializer dataInitializer;
    
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    
    }

=======
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
}