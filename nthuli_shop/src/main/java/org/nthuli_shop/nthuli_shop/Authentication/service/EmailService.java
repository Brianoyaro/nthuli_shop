package org.nthuli_shop.nthuli_shop.Authentication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.order.entity.OrderItem;
import org.nthuli_shop.nthuli_shop.paystack.model.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.mail.from:noreply@nthulishop.com}")
    private String fromEmail;

    @Value("${app.admin.email:admin@nthulishop.com}")
    private String adminEmail;

//    /**
//     * Notify the admin when a customer's paymentPayment is confirmed.
//     * Non-fatal — exceptions are caught and logged only.
//     */
//    public void sendAdminOrderNotification(Order order, Payment payment) {
//        try {
//            MimeMessage message = mailSender.createMimeMessage();
//            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
//            helper.setTo(adminEmail);
//            helper.setFrom(fromEmail);
//            helper.setSubject("New Order #" + order.getId() + " — Payment Confirmed | Nthuli Shop");
//            helper.setText(buildAdminOrderEmailHtml(order, payment), true);
//            mailSender.send(message);
//            log.info("Admin order notification sent for order #{} to: {}", order.getId(), adminEmail);
//        } catch (MessagingException e) {
//            log.error("Failed to send admin order notification for order #{}: {}", order.getId(), e.getMessage());
//        }
//    }
//
//    private String buildAdminOrderEmailHtml(Order order, Payment payment) {
//        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
//        String createdAt = order.getCreatedAt() != null ? order.getCreatedAt().format(fmt) : "-";
//        String customerEmail = order.getUser() != null ? order.getUser().getEmail() : "-";
//        String shippingAddress = order.getShippingAddress() != null ? order.getShippingAddress() : "-";
//        String notes = (order.getNotes() != null && !order.getNotes().isBlank()) ? order.getNotes() : "None";
//
//        StringBuilder rows = new StringBuilder();
//        for (OrderItem item : order.getOrderItems()) {
//            rows.append(String.format(
//                "<tr><td style='padding:8px;border-bottom:1px solid #e5e7eb'>%s</td>" +
//                "<td style='padding:8px;border-bottom:1px solid #e5e7eb;text-align:center'>%d</td>" +
//                "<td style='padding:8px;border-bottom:1px solid #e5e7eb;text-align:right'>KES %.2f</td>" +
//                "<td style='padding:8px;border-bottom:1px solid #e5e7eb;text-align:right'>KES %.2f</td></tr>",
//                item.getProductName(), item.getQuantity(),
//                item.getUnitPrice().doubleValue(), item.getSubtotal().doubleValue()
//            ));
//        }
//
//        return String.format("""
//            <!DOCTYPE html><html><head><meta charset="UTF-8"></head>
//            <body style="font-family:Arial,sans-serif;color:#333;margin:0;padding:0;background:#f9fafb">
//              <div style="max-width:640px;margin:0 auto;background:#fff">
//                <div style="background:#1e40af;color:white;padding:24px 32px">
//                  <h1 style="margin:0;font-size:22px">&#x1F6D2; New Order Received</h1>
//                  <span style="display:inline-block;background:#22c55e;color:white;padding:4px 14px;border-radius:99px;font-size:13px;margin-top:10px">&#x2705; Payment Confirmed</span>
//                </div>
//                <div style="padding:32px">
//                  <p style="margin:0 0 20px;color:#374151">A customer has placed a new order and paymentPayment has been confirmed via M-Pesa.</p>
//
//                  <h3 style="font-size:13px;text-transform:uppercase;color:#6b7280;letter-spacing:.05em;margin:0 0 8px">Order Details</h3>
//                  <table style="width:100%;background:#f3f4f6;border-radius:8px;padding:0;border-collapse:collapse">
//                    <tr>
//                      <td style="padding:10px 16px"><span style="font-size:11px;color:#9ca3af;display:block;text-transform:uppercase">Order ID</span><strong>#%d</strong></td>
//                      <td style="padding:10px 16px"><span style="font-size:11px;color:#9ca3af;display:block;text-transform:uppercase">Date</span><strong>%s</strong></td>
//                    </tr>
//                    <tr>
//                      <td style="padding:10px 16px"><span style="font-size:11px;color:#9ca3af;display:block;text-transform:uppercase">Customer</span><strong>%s</strong></td>
//                      <td style="padding:10px 16px"><span style="font-size:11px;color:#9ca3af;display:block;text-transform:uppercase">M-Pesa Ref</span><strong>%s</strong></td>
//                    </tr>
//                  </table>
//
//                  <h3 style="font-size:13px;text-transform:uppercase;color:#6b7280;letter-spacing:.05em;margin:20px 0 8px">Shipping Address</h3>
//                  <p style="background:#f3f4f6;padding:12px 16px;border-radius:8px;margin:0;font-size:14px">%s</p>
//
//                  <h3 style="font-size:13px;text-transform:uppercase;color:#6b7280;letter-spacing:.05em;margin:20px 0 8px">Customer Notes</h3>
//                  <p style="background:#f3f4f6;padding:12px 16px;border-radius:8px;margin:0;font-size:14px;color:#6b7280;font-style:italic">%s</p>
//
//                  <h3 style="font-size:13px;text-transform:uppercase;color:#6b7280;letter-spacing:.05em;margin:20px 0 8px">Items Ordered</h3>
//                  <table style="width:100%;border-collapse:collapse">
//                    <thead><tr style="background:#f3f4f6">
//                      <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase">Product</th>
//                      <th style="padding:8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase">Qty</th>
//                      <th style="padding:8px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase">Unit Price</th>
//                      <th style="padding:8px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase">Subtotal</th>
//                    </tr></thead>
//                    <tbody>%s
//                      <tr><td colspan="3" style="padding:10px 8px;font-weight:bold;border-top:2px solid #1e40af">Total</td>
//                          <td style="padding:10px 8px;font-weight:bold;border-top:2px solid #1e40af;text-align:right">KES %.2f</td></tr>
//                    </tbody>
//                  </table>
//                </div>
//                <div style="background:#f3f4f6;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
//                  &copy; 2026 Nthuli Shop Admin &mdash; Automated notification. Do not reply.
//                </div>
//              </div>
//            </body></html>
//            """,
//            order.getId(), createdAt, customerEmail, mpesaRef,
//            shippingAddress, notes, rows.toString(),
//            order.getTotalAmount().doubleValue()
//        );
//    }

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
