package cinema;

import java.io.Serializable;

public class User implements Serializable {

    private int user_id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;

    public User(int user_id, String username, String password, String firstName, String lastName, String email) {
        this.user_id = user_id;
        this.username = username;
        this.password = password; // Consider hashing the password before storing it
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
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
    
    
    @Override
    public String toString() {
        return "User{" +
                "user id=" + user_id +
                ", username='" + username + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
