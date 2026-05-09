package org.nthuli_shop.nthuli_shop.Authentication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.mail.from:noreply@nthulishop.com}")
    private String fromEmail;
    
    public void sendPasswordResetEmail(User user, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(user.getEmail());
            helper.setFrom(fromEmail);
            helper.setSubject("Password Reset Request - Nthuli Shop");
            
            String htmlContent = buildPasswordResetEmailHtml(user.getEmail(), resetLink);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", user.getEmail());
            
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    private String buildPasswordResetEmailHtml(String email, String resetLink) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
                        .header { background-color: #1e40af; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                        .content { background-color: white; padding: 20px; }
                        .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666; }
                        .button { display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .warning { background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hi <strong>%s</strong>,</p>
                            
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            
                            <a href="%s" class="button">Reset Password</a>
                            
                            <p>Or copy and paste this link in your browser:</p>
                            <p style="word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
                                %s
                            </p>
                            
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong> This link will expire in 24 hours. If you didn't request this reset, please ignore this email or change your password if you suspect unauthorized access.
                            </div>
                            
                            <p>Best regards,<br>Nthuli Shop Team</p>
                        </div>
                        <div class="footer">
                            <p>© 2026 Nthuli Shop. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """, email, resetLink, resetLink);
    }
}
