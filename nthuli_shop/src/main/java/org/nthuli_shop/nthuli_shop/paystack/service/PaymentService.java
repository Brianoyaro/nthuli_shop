package org.nthuli_shop.nthuli_shop.paystack.service;

import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentRequestDto;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentResponseDto;

public interface PaymentService {
    PaymentResponseDto initiatePayment(PaymentRequestDto request);
}

