package cinema;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

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
}