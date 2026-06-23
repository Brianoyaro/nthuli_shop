package org.nthuli_shop.nthuli_shop.paystack.service;

import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentRequestDto;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentResponseDto;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentVerificationResponseDto;

import java.util.Map;

public interface PaymentService {
    PaymentResponseDto initiatePayment(PaymentRequestDto request);
    PaymentVerificationResponseDto verifyTransaction(String reference);
    void processWebhook(Map<String, Object> payload);
}

