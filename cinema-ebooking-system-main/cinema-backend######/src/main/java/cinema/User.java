package cinema;

import java.io.Serializable;

public class User implements Serializable {

    private int user_id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private int status_id; // 1 for active, 2 for inactive
    private boolean promotionSubscription;
    private String verificationCode;

    public User(int user_id, String username, String password, String firstName, String lastName, 
                String email, int status_id, boolean promotionSubscription) {
        this.user_id = user_id;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.status_id = status_id;
        this.promotionSubscription = promotionSubscription;
    }

    public User() {
        this.status_id = 2; // Default to inactive
        this.promotionSubscription = false;
    }

    public int getUserId() {
        return user_id;
    }

    public void setUserId(int user_id) {
        this.user_id = user_id;
    }
    
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getStatusId() {
        return status_id;
    }

    public void setStatusId(int status_id) {
        this.status_id = status_id;
    }
    
    public boolean getPromotionSubscription() {
        return promotionSubscription;
    }
    
    public void setPromotionSubscription(boolean promotionSubscription) {
        this.promotionSubscription = promotionSubscription;
    }
    
    public String getVerificationCode() {
        return verificationCode;
    }
    
    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
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
                ", promotionSubscription=" + promotionSubscription +
                '}';
    }
}