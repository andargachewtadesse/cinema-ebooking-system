package cinema;

public class Promotion {
    private int promotionId;
    private double discountPercentage;
    private String description;
    private int customerId;

    public Promotion() {}

    public Promotion(int promotionId, double discountPercentage, String description, int customerId) {
        this.promotionId = promotionId;
        this.discountPercentage = discountPercentage;
        this.description = description;
        this.customerId = customerId;
    }



    // Getters and Setters
    public int getPromotionId() {
        return promotionId;
    }

    public void setPromotionId(int promotionId) {
        this.promotionId = promotionId;
    }

    public double getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    @Override
    public String toString() {
        return "Promotion{" +
                "promotionId=" + promotionId +
                ", discountPercentage=" + discountPercentage +
                ", description='" + description + '\'' +
                ", customerId=" + customerId +
                '}';
    }
}
