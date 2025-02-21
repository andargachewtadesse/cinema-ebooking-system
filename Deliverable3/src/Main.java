import java.sql.Date;  // Import the correct Date class
import java.sql.Time;  // Import Time class
import java.util.List;  // Import List class
import java.util.ArrayList;
import java.util.Arrays;
import java.math.BigDecimal;
import java.util.Scanner; // Import ArrayList class

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        MovieDAO movieDAO = new MovieDAO();

        System.out.println("Welcome to the Cinema E-Booking System SQL Console");
        System.out.println("Type 'exit' to quit.");
        System.out.println("Commands: add_movie, delete_movie");

        while (true) {
            System.out.print("SQL> ");
            String input = scanner.nextLine();

            if (input.equalsIgnoreCase("exit")) {
                System.out.println("Exiting...");
                break;
            }

            if (input.startsWith("add_movie")) {
                // Gather movie details and add movie
                Movie movie = createMovie(scanner);
                movieDAO.insertMovie(movie);
            
            } else if (input.startsWith("delete_movie")) {
                // Delete movie by title
                // (add delete logic here)
            
            } else {
                // Execute other SQL commands
                DatabaseHelper.executeSqlCommand(input);
            }
        }

        scanner.close();
    }

    private static Movie createMovie(Scanner scanner) {
        System.out.println("Adding movie...");
        System.out.print("Enter title: ");
        String title = scanner.nextLine();
        System.out.print("Enter category: ");
        String category = scanner.nextLine();
        System.out.print("Enter cast: ");
        String cast = scanner.nextLine();
        System.out.print("Enter director: ");
        String director = scanner.nextLine();
        System.out.print("Enter producer: ");
        String producer = scanner.nextLine();
        System.out.print("Enter synopsis: ");
        String synopsis = scanner.nextLine();
        System.out.print("Enter reviews: ");
        String reviews = scanner.nextLine();
        System.out.print("Enter trailer picture file name: ");
        String trailerPicture = scanner.nextLine();
        System.out.print("Enter trailer video file name: ");
        String trailerVideo = scanner.nextLine();
        System.out.print("Enter MPAA rating: ");
        String mpaaRating = scanner.nextLine();

        // Collect showtimes from user input
        List<ShowTime> showTimes = new ArrayList<>();
        System.out.print("Enter number of showtimes: ");
        int numShowtimes = Integer.parseInt(scanner.nextLine());
        
        for (int i = 0; i < numShowtimes; i++) {
            System.out.println("Enter showtime " + (i + 1) + " details:");

            System.out.print("Enter show date (YYYY-MM-DD): ");
            Date showDate = Date.valueOf(scanner.nextLine());

            System.out.print("Enter show time (HH:mm:ss): ");
            Time showTime = Time.valueOf(scanner.nextLine());

            System.out.print("Enter screen number: ");
            int screenNumber = Integer.parseInt(scanner.nextLine());

            System.out.print("Enter available seats: ");
            int availableSeats = Integer.parseInt(scanner.nextLine());

            System.out.print("Enter ticket price: ");
            BigDecimal price = new BigDecimal(scanner.nextLine());

            // Create a ShowTime object and add it to the list
            ShowTime showTimeObj = new ShowTime(0, 0, showDate, showTime, screenNumber, availableSeats, price);
            showTimes.add(showTimeObj);
        }

        // Return the movie with the showtimes list
        return new Movie(title, category, cast, director, producer, synopsis, reviews, trailerPicture, trailerVideo, mpaaRating, showTimes);
    }

    
}
