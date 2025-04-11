package cinema;

import java.io.Serializable;

public class User implements Serializable {

    private int user_id;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private int status_id; // 1 for active, 2 for inactive
    private boolean promotionSubscription;
    private String verificationCode;
    
    // Address fields 
    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;

    private boolean isAdmin;

    public User(int user_id,String password, String firstName, String lastName, 
                String email, int status_id, boolean promotionSubscription) {
        this.user_id = user_id;

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

    // New getters and setters for address fields
    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    @Override
    public String toString() {
        return "User{" +
                "user_id=" + user_id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", status_id=" + status_id +
                ", promotionSubscription=" + promotionSubscription +
                ", isAdmin=" + isAdmin +
                ", streetAddress='" + streetAddress + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zipCode='" + zipCode + '\'' +
                '}';
    }
}