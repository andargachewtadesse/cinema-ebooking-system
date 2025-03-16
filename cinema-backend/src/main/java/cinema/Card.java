package cinema;


public class Card{

    private int id;
    private String cardholderName;
    private String cardNumber;
    private String cvv;
    private String cardAddress;
    private int customerId;

    public Card(int id, String cardholderName, String cardNumber, String cvv, String cardAddress, int customerId) {
        this.id = id;
        this.cardholderName = cardholderName;
        this.cardNumber = cardNumber;
        this.cvv = cvv;
        this.cardAddress = cardAddress;
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
                ", customerId=" + customerId +
                '}';
    }
}

