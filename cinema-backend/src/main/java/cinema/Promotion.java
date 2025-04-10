package cinema;

import java.util.Date;

public class Promotion {
    private int promotionId;
    private double discountPercentage;
    private String description;
    private Date creationDate;
    private boolean sent;
    
    public Promotion() {
        this.creationDate = new Date();
        this.sent = false;
    }

    public Promotion(int promotionId, double discountPercentage, String description) {
        this.promotionId = promotionId;
        this.discountPercentage = discountPercentage;
        this.description = description;
        this.creationDate = new Date();
        this.sent = false;
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
    
    public Date getCreationDate() {
        return creationDate;
    }
    
    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }
    
    public boolean isSent() {
        return sent;
    }
    
    public void setSent(boolean sent) {
        this.sent = sent;
    }

    @Override
    public String toString() {
        return "Promotion{" +
                "promotionId=" + promotionId +
                ", discountPercentage=" + discountPercentage +
                ", description='" + description + '\'' +
                ", creationDate=" + creationDate +
                ", sent=" + sent +
                '}';
    }
}