package cinema;

import java.util.List;
import java.util.Optional;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import cinema.ShowTime;
import cinema.Ticket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private ShowTimeDAO showTimeDAO;

    public void sendVerificationEmail(String to, String verificationCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Cinema E-Booking System - Email Verification");
        message.setText("Dear User,\n\n" +
                "Thank you for registering at our Cinema E-Booking System. " +
                "To complete your registration, please use the following verification code:\n\n" +
                verificationCode + "\n\n" +
                "If you did not request this verification, please ignore this email.\n\n" +
                "Best Regards,\nCinema E-Booking Team");
        
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Cinema E-Booking System - Password Reset");
        message.setText("Dear User,\n\n" +
                "You have requested to reset your password. " +
                "To reset your password, please use the following token:\n\n" +
                resetToken + "\n\n" +
                "Or click on this link to reset your password directly:\n" +
                "http://localhost:3000/reset-password?email=" + to + "\n\n" +
                "If you did not request this reset, please contact our support team immediately.\n\n" +
                "Best Regards,\nCinema E-Booking Team");
        
        mailSender.send(message);
    }

    public void sendProfileUpdateEmail(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Cinema E-Booking System - Profile Update");
        message.setText("Dear User,\n\n" +
                "Your profile information has been successfully updated. " +
                "If you did not make these changes, please contact our support team immediately.\n\n" +
                "Best Regards,\nCinema E-Booking Team");
        
        mailSender.send(message);
    }
    
    public void sendPromotionEmail(String to, Promotion promotion) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Cinema E-Booking System - Special Promotion");
            message.setText("Dear Valued Customer,\n\n" +
                    "We're excited to offer you a special promotion!\n\n" +
                    promotion.getDescription() + "\n\n" +
                    "Discount: " + promotion.getDiscountPercentage() + "% off your next purchase!\n\n" +
                    "Use promotion code: " + promotion.getCode() + "\n\n" +
                    "Simply enter this code at checkout to redeem your discount.\n\n" +
                    "Best Regards,\nCinema E-Booking Team");
            
            mailSender.send(message);
            System.out.println("EmailService: Successfully sent promotion email to " + to);
        } catch (Exception e) {
            System.out.println("EmailService: Error sending promotion email: " + e.getMessage());
            e.printStackTrace();
            
        }
    }

    public void sendPromotionEmailBulk(List<String> recipients, Promotion promotion) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            // Convert list of emails to string array for the setTo method
            String[] emailArray = recipients.toArray(new String[0]);
            message.setTo(emailArray);
            
            // Use BCC instead of To for privacy reasons
            message.setBcc(emailArray);
            message.setSubject("Cinema E-Booking System - Special Promotion");
            message.setText("Dear Valued Customer,\n\n" +
                    "We're excited to offer you a special promotion!\n\n" +
                    promotion.getDescription() + "\n\n" +
                    "Discount: " + promotion.getDiscountPercentage() + "% off your next purchase!\n\n" +
                    "Use promotion code: " + promotion.getCode() + "\n\n" +
                    "Simply enter this code at checkout to redeem your discount.\n\n" +
                    "Best Regards,\nCinema E-Booking Team");
            
            mailSender.send(message);
            System.out.println("EmailService: Successfully sent bulk promotion email to " + recipients.size() + " recipients");
        } catch (Exception e) {
            System.out.println("EmailService: Error sending bulk promotion email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendOrderConfirm(String to, List<Ticket> tickets) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Cinema E-Booking System - Order Confirmation");

        StringBuilder emailText = new StringBuilder();
        emailText.append("Dear customer,\n\n")
                 .append("Thank you for your booking at Cinema E-Booking System! Your order has been confirmed.\n\n")
                 .append("Here are your ticket details:\n\n");

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");

        BigDecimal totalOrderPrice = BigDecimal.ZERO;

        for (Ticket ticket : tickets) {
            Optional<ShowTime> showTimeOpt = showTimeDAO.getShowTimeById(ticket.getShowId());
            String showDateStr = "N/A";
            String showTimeStr = "N/A";

            if (showTimeOpt.isPresent()) {
                ShowTime showTime = showTimeOpt.get();
                if (showTime.getShowDate() != null) {
                    showDateStr = showTime.getShowDate().toLocalDate().format(dateFormatter);
                }
                if (showTime.getShowTime() != null) {
                    showTimeStr = showTime.getShowTime().format(timeFormatter);
                }
            }
            
            emailText.append("Movie: ").append(ticket.getMovieTitle()).append("\n")
                     .append("Seat: ").append(ticket.getSeatNumber()).append("\n")
                     .append("Type: ").append(capitalize(ticket.getTicketType())).append("\n")
                     .append("Date: ").append(showDateStr).append("\n")
                     .append("Time: ").append(showTimeStr).append("\n")
                     .append("Price: $").append(String.format("%.2f", ticket.getPrice()))
                     .append("\n\n");
                     
            totalOrderPrice = totalOrderPrice.add(ticket.getPrice());
        }

        emailText.append("Total Price: $").append(String.format("%.2f", totalOrderPrice)).append("\n\n");

        emailText.append("If you did not make this booking, please contact our support team.\n\n")
                 .append("Best Regards,\nCinema E-Booking Team");

        message.setText(emailText.toString());
        mailSender.send(message);
        System.out.println("Order confirmation email sent to: " + to + " for " + tickets.size() + " tickets.");
    }
    
    private String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}