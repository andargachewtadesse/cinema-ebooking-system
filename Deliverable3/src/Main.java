import java.util.Scanner;

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
                // Prompt for movie details and add movie
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
                System.out.print("Enter show dates (YYYY-MM-DD): ");
                String showDates = scanner.nextLine();

                Movie movie = new Movie(title, category, cast, director, producer, synopsis, reviews, 
                                       trailerPicture, trailerVideo, mpaaRating, showDates);

                movieDAO.insertMovie(movie);
            
            }else if(input.startsWith("delete_movie")){
                System.out.println("Deleting movie...");
                System.out.print("Enter title: ");
                String title = scanner.nextLine();
                
                movieDAO.deleteMovie(title);

            }else {
                // Execute other SQL commands
                DatabaseHelper.executeSqlCommand(input);
            }
        }

        scanner.close();
    }
}
