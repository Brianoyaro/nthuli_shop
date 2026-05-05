package org.nthuli_shop.nthuli_shop.payment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
     * Initiate M-Pesa STK Push payment
     */
    public MpesaStkPushResponse initiateMpesaPayment(MpesaStkPushRequest request) {
        log.info("Initiating M-Pesa payment for order: {} with email: {} and amount: {}", 
                request.getOrderId(), request.getEmail(), request.getAmount());
        return mpesaService.initiateStkPush(request);
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
    public List<PaymentResponseDto> getUserPayments(Long userId) {
        return mpesaService.getUserPayments(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get completed user payments
     */
    public List<PaymentResponseDto> getUserCompletedPayments(Long userId) {
        return mpesaService.getUserCompletedPayments(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all payments by email
     */
    public List<PaymentResponseDto> getPaymentsByEmail(String email) {
        return paymentRepository.findByEmail(email)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get completed payments by email
     */
    public List<PaymentResponseDto> getCompletedPaymentsByEmail(String email) {
        return paymentRepository.findByEmailAndPaymentStatus(email, org.nthuli_shop.nthuli_shop.payment.enums.PaymentStatus.COMPLETED)
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
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .email(payment.getEmail())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod().toString())
                .paymentStatus(payment.getPaymentStatus().toString())
                .transactionId(payment.getTransactionId())
                .phoneNumber(payment.getPhoneNumber())
                .description(payment.getDescription())
                .createdAt(payment.getCreatedAt() != null ? 
                        payment.getCreatedAt().format(formatter) : null)
                .updatedAt(payment.getUpdatedAt() != null ? 
                        payment.getUpdatedAt().format(formatter) : null)
                .build();
    }
}
