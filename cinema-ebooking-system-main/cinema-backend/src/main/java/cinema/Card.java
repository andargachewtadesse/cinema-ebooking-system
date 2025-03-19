package cinema;


public class Card{

    private int id;
    private String cardholderName;
    private String cardNumber;
    private String cvv;
    private String cardAddress;
<<<<<<< HEAD
    private String expiration_date;
    private int customerId;


    public Card(int id, String cardholderName, String cardNumber, String cvv, 
    String cardAddress, String expiration_date, int customerId) {
        
=======
    private int customerId;

    public Card(int id, String cardholderName, String cardNumber, String cvv, String cardAddress, int customerId) {
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
        this.id = id;
        this.cardholderName = cardholderName;
        this.cardNumber = cardNumber;
        this.cvv = cvv;
        this.cardAddress = cardAddress;
<<<<<<< HEAD
        this.expiration_date = expiration_date;
=======
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
        this.customerId = customerId;
    }

    public Card() {
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getCardholderName() {
        return cardholderName;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public String getCvv() {
        return cvv;
    }

    public String getCardAddress() {
        return cardAddress;
    }

<<<<<<< HEAD
    public String getExpirationDate(){
        return expiration_date;
    }

=======
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
    public int getCustomerId() {
        return customerId;
    }

    // Setters
    public void setId(int id) {
        this.id = id;
    }

    public void setCardholderName(String cardholderName) {
        this.cardholderName = cardholderName;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public void setCardAddress(String cardAddress) {
        this.cardAddress = cardAddress;
    }

<<<<<<< HEAD
    public void setExpirationDate(String expiration_date){
        this.expiration_date = expiration_date;
    }

=======
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    @Override
    public String toString() {
        return "Card{" +
                "id=" + id +
                ", cardholderName='" + cardholderName + '\'' +
                ", cardNumber='" + cardNumber + '\'' +
                ", cvv='" + cvv + '\'' +
                ", cardAddress='" + cardAddress + '\'' +
<<<<<<< HEAD
                ", expiration date='" + expiration_date + '\'' +
=======
>>>>>>> 4f988932ba154c0caf1635cd79e3e13531863b2d
                ", customerId=" + customerId +
                '}';
    }
}

