package org.nthuli_shop.nthuli_shop.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushRequest;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushResponse;
import org.nthuli_shop.nthuli_shop.payment.dto.PaymentResponseDto;
import org.nthuli_shop.nthuli_shop.payment.entity.Payment;
import org.nthuli_shop.nthuli_shop.payment.repository.PaymentRepository;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentStatus;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final MpesaService mpesaService;
    private final PaymentRepository paymentRepository;

    /**
     * Initiate M-Pesa STK Push payment for authenticated user
     */
    public MpesaStkPushResponse initiateMpesaPayment(User user, MpesaStkPushRequest request) {
        log.info("[PAYMENT_SERVICE] initiateMpesaPayment START - UserId: {}, OrderId: {}, Amount: {}", 
                user.getId(), request.getOrderId(), request.getAmount());
        try {
            MpesaStkPushResponse response = mpesaService.initiateStkPush(user, request);
            log.info("[PAYMENT_SERVICE] initiateMpesaPayment SUCCESS - CheckoutRequestId: {}", 
                    response.getCheckoutRequestId());
            return response;
        } catch (Exception e) {
            log.error("[PAYMENT_SERVICE] initiateMpesaPayment FAILED", e);
            throw e;
        }
    }

    /**
     * Get payment by ID and convert to DTO
     */
    public PaymentResponseDto getPaymentById(Long paymentId) {
        log.info("[PAYMENT_SERVICE] getPaymentById START - PaymentId: {}", paymentId);
        try {
            Payment payment = mpesaService.getPaymentById(paymentId);
            PaymentResponseDto dto = convertToDto(payment);
            log.info("[PAYMENT_SERVICE] getPaymentById SUCCESS - Status: {}", dto.getPaymentStatus());
            return dto;
        } catch (Exception e) {
            log.error("[PAYMENT_SERVICE] getPaymentById FAILED - PaymentId: {}", paymentId, e);
            throw e;
        }
    }

    /**
     * Get payment by order ID and convert to DTO
     */
    public PaymentResponseDto getPaymentByOrderId(Long orderId) {
        log.info("[PAYMENT_SERVICE] getPaymentByOrderId START - OrderId: {}", orderId);
        try {
            Payment payment = mpesaService.getPaymentByOrderId(orderId);
            PaymentResponseDto dto = convertToDto(payment);
            log.info("[PAYMENT_SERVICE] getPaymentByOrderId SUCCESS - PaymentId: {}, Status: {}", 
                    dto.getId(), dto.getPaymentStatus());
            return dto;
        } catch (Exception e) {
            log.error("[PAYMENT_SERVICE] getPaymentByOrderId FAILED - OrderId: {}", orderId, e);
            throw e;
        }
    }

    /**
     * Get all user payments
     */
    public List<PaymentResponseDto> getUserPayments(User user) {
        log.info("[PAYMENT_SERVICE] getUserPayments START - UserId: {}", user.getId());
        try {
            List<PaymentResponseDto> payments = paymentRepository.findByUser(user)
                    .stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            log.info("[PAYMENT_SERVICE] getUserPayments SUCCESS - Found {} payments", payments.size());
            return payments;
        } catch (Exception e) {
            log.error("[PAYMENT_SERVICE] getUserPayments FAILED - UserId: {}", user.getId(), e);
            throw e;
        }
    }

    /**
     * Get completed user payments
     */
    public List<PaymentResponseDto> getUserCompletedPayments(User user) {
        log.info("[PAYMENT_SERVICE] getUserCompletedPayments START - UserId: {}", user.getId());
        try {
            List<PaymentResponseDto> payments = paymentRepository.findByUserAndPaymentStatus(user, PaymentStatus.COMPLETED)
                    .stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
            log.info("[PAYMENT_SERVICE] getUserCompletedPayments SUCCESS - Found {} completed payments", 
                    payments.size());
            return payments;
        } catch (Exception e) {
            log.error("[PAYMENT_SERVICE] getUserCompletedPayments FAILED - UserId: {}", user.getId(), e);
            throw e;
        }
    }

    /**
     * Convert Payment entity to DTO
     */
    private PaymentResponseDto convertToDto(Payment payment) {
        log.debug("[PAYMENT_SERVICE] Converting Payment to DTO - PaymentId: {}, Status: {}", 
                payment.getId(), payment.getPaymentStatus());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        return PaymentResponseDto.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .userId(payment.getUser() != null ? payment.getUser().getId() : null)
                .email(payment.getUser() != null ? payment.getUser().getEmail() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod().toString())
                .paymentStatus(payment.getPaymentStatus().toString())
                .transactionId(payment.getTransactionId())
                .description(payment.getDescription())
                .createdAt(payment.getCreatedAt() != null ? 
                        payment.getCreatedAt().format(formatter) : null)
                .updatedAt(payment.getUpdatedAt() != null ? 
                        payment.getUpdatedAt().format(formatter) : null)
                .build();
    }
}
