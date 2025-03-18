package cinema;

import java.io.Serializable;

public class User implements Serializable {

    private int user_id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private int status_id; // added to represent user status (active/inactive)

    public User(int user_id, String username, String password, String firstName, String lastName, String email, int status_id) {
        this.user_id = user_id;
        this.username = username;
        this.password = password; // Consider hashing the password before storing it
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.status_id = status_id;
    }

    public User() {
    }

    // Getters
    public int getUserId() {
        return user_id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public int getStatusId() {
        return status_id;
    }

    // Setters
    public void setUserId(int user_id) {
        this.user_id = user_id;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password; // Again, consider hashing before storing
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setStatusId(int status_id) {
        this.status_id = status_id;
    }

    @Override
    public String toString() {
        return "User{" +
                "user_id=" + user_id +
                ", username='" + username + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", status_id=" + status_id +
                '}';
    }
}
