package org.nthuli_shop.nthuli_shop.paystack.service.impl;

import lombok.RequiredArgsConstructor;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.order.repository.OrderRepository;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentRequestDto;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentResponseDto;
import org.nthuli_shop.nthuli_shop.paystack.enums.PaymentStatus;
import org.nthuli_shop.nthuli_shop.paystack.model.Payment;
import org.nthuli_shop.nthuli_shop.paystack.repository.PaymentRepository;
import org.nthuli_shop.nthuli_shop.paystack.service.PaymentService;
import org.nthuli_shop.nthuli_shop.paystack.service.PaystackService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaystackService paystackService;
    private final OrderRepository orderRepo;//TODO.Potentila error because of copying code

    @Override
    public PaymentResponseDto initiatePayment(PaymentRequestDto request) {

        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow();

        String reference = UUID.randomUUID().toString();

        Payment payment = Payment.builder()
                .reference(reference)
                .orderId(order.getId())
                .email(request.getEmail())
                .amount(order.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);

        String url = paystackService.initializeTransaction(
                request.getEmail(),
                order.getTotalAmount(),   // ✅ SOURCE OF TRUTH
                reference
        );
        return PaymentResponseDto.builder()
                .reference(reference)
                .authorizationUrl(url)
                .message("Redirect to Paystack to complete payment")
                .build();
    }
}
