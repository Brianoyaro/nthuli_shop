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
        log.info("Initiating M-Pesa payment for user: {} order: {} with amount: {}", 
                user.getId(), request.getOrderId(), request.getAmount());
        return mpesaService.initiateStkPush(user, request);
    }

    /**
     * Get payment by ID and convert to DTO
     */
    public PaymentResponseDto getPaymentById(Long paymentId) {
        Payment payment = mpesaService.getPaymentById(paymentId);
        return convertToDto(payment);
    }

    /**
     * Get payment by order ID and convert to DTO
     */
    public PaymentResponseDto getPaymentByOrderId(Long orderId) {
        Payment payment = mpesaService.getPaymentByOrderId(orderId);
        return convertToDto(payment);
    }

    /**
     * Get all user payments
     */
    public List<PaymentResponseDto> getUserPayments(User user) {
        return paymentRepository.findByUser(user)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get completed user payments
     */
    public List<PaymentResponseDto> getUserCompletedPayments(User user) {
        return paymentRepository.findByUserAndPaymentStatus(user, PaymentStatus.COMPLETED)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert Payment entity to DTO
     */
    private PaymentResponseDto convertToDto(Payment payment) {
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
