import java.sql.*;

public class DatabaseHelper {
    private static final String URL = "jdbc:mysql://localhost:3306/cinema_db";
    private static final String USER = "root"; // Change to your MySQL username
    private static final String PASSWORD = "mysqlpass"; // Change to your MySQL password

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void executeSqlCommand(String sql) {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {

            if (sql.trim().toUpperCase().startsWith("SELECT")) {
                ResultSet resultSet = stmt.executeQuery(sql);
                ResultSetMetaData metaData = resultSet.getMetaData();
                int columnCount = metaData.getColumnCount();

                // Print column names
                for (int i = 1; i <= columnCount; i++) {
                    System.out.printf("%-20s", metaData.getColumnName(i));
                }
                System.out.println("\n" + new String(new char[columnCount * 20]).replace("\0", "-"));

                // Print rows
                while (resultSet.next()) {
                    for (int i = 1; i <= columnCount; i++) {
                        System.out.printf("%-20s", resultSet.getString(i));
                    }
                    System.out.println();
                }
            } else {
                int rowsAffected = stmt.executeUpdate(sql);
                System.out.println(rowsAffected + " row(s) affected.");
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
