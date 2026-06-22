package org.nthuli_shop.nthuli_shop.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushRequest;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushResponse;
import org.nthuli_shop.nthuli_shop.payment.dto.PaymentResponseDto;
import org.nthuli_shop.nthuli_shop.payment.entity.Payment_Payment;
import org.nthuli_shop.nthuli_shop.payment.repository.Payment_PaymentRepository;
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
    private final Payment_PaymentRepository paymentPaymentRepository;

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
            Payment_Payment paymentPayment = mpesaService.getPaymentById(paymentId);
            PaymentResponseDto dto = convertToDto(paymentPayment);
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
            Payment_Payment paymentPayment = mpesaService.getPaymentByOrderId(orderId);
            PaymentResponseDto dto = convertToDto(paymentPayment);
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
            List<PaymentResponseDto> payments = paymentPaymentRepository.findByUser(user)
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
            List<PaymentResponseDto> payments = paymentPaymentRepository.findByUserAndPaymentStatus(user, PaymentStatus.COMPLETED)
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
     * Get payment by checkoutRequestId (stored as transactionId)
     */
    public PaymentResponseDto getPaymentByCheckoutRequestId(String checkoutRequestId) {
        log.info("[PAYMENT_SERVICE] getPaymentByCheckoutRequestId START - CheckoutRequestId: {}", checkoutRequestId);
        try {
            Payment_Payment paymentPayment = mpesaService.getPaymentByCheckoutRequestId(checkoutRequestId);
            PaymentResponseDto dto = convertToDto(paymentPayment);
            log.info("[PAYMENT_SERVICE] getPaymentByCheckoutRequestId SUCCESS - PaymentId: {}, Status: {}", 
                    dto.getId(), dto.getPaymentStatus());
            return dto;
        } catch (Exception e) {
            log.error("[PAYMENT_SERVICE] getPaymentByCheckoutRequestId FAILED - CheckoutRequestId: {}", checkoutRequestId, e);
            throw e;
        }
    }

    /**
     * Convert Payment entity to DTO
     */
    private PaymentResponseDto convertToDto(Payment_Payment paymentPayment) {
        log.debug("[PAYMENT_SERVICE] Converting Payment to DTO - PaymentId: {}, Status: {}", 
                paymentPayment.getId(), paymentPayment.getPaymentStatus());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        return PaymentResponseDto.builder()
                .id(paymentPayment.getId())
                .orderId(paymentPayment.getOrder() != null ? paymentPayment.getOrder().getId() : null)
                .userId(paymentPayment.getUser() != null ? paymentPayment.getUser().getId() : null)
                .email(paymentPayment.getUser() != null ? paymentPayment.getUser().getEmail() : null)
                .amount(paymentPayment.getAmount())
                .paymentMethod(paymentPayment.getPaymentMethod().toString())
                .paymentStatus(paymentPayment.getPaymentStatus().toString())
                .transactionId(paymentPayment.getTransactionId())
                .description(paymentPayment.getDescription())
                .createdAt(paymentPayment.getCreatedAt() != null ?
                        paymentPayment.getCreatedAt().format(formatter) : null)
                .updatedAt(paymentPayment.getUpdatedAt() != null ?
                        paymentPayment.getUpdatedAt().format(formatter) : null)
                .build();
    }
}
