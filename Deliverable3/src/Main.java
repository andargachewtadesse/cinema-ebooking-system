
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        MovieDAO movieDAO = new MovieDAO();

        System.out.println("Welcome to the Cinema E-Booking System SQL Console");
        System.out.println("Type 'exit' to quit.");

        while (true) {
            System.out.print("SQL> ");
            String input = scanner.nextLine();

            if (input.equalsIgnoreCase("exit")) {
                System.out.println("Exiting...");
                break;
            }
                // Execute other SQL commands
                DatabaseHelper.executeSqlCommand(input);
            }
        }

       
    }

