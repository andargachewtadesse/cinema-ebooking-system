package cinema;

import java.io.Serializable;

public class User implements Serializable {

    private int user_id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
<<<<<<< HEAD
    private int status_id; // added to represent user status (active/inactive)

    public User(int user_id, String username, String password, String firstName, String lastName, String email, int status_id) {
=======

    public User(int user_id, String username, String password, String firstName, String lastName, String email) {
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
        this.user_id = user_id;
        this.username = username;
        this.password = password; // Consider hashing the password before storing it
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
<<<<<<< HEAD
        this.status_id = status_id;
=======
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
    }

    public User() {
    }
<<<<<<< HEAD

=======
    
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
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

<<<<<<< HEAD
    public int getStatusId() {
        return status_id;
    }

    // Setters
=======
    // Setters

>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
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
<<<<<<< HEAD

    public void setStatusId(int status_id) {
        this.status_id = status_id;
    }

    @Override
    public String toString() {
        return "User{" +
                "user_id=" + user_id +
=======
    
    
    @Override
    public String toString() {
        return "User{" +
                "user id=" + user_id +
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
                ", username='" + username + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
<<<<<<< HEAD
                ", status_id=" + status_id +
=======
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
                '}';
    }
}
