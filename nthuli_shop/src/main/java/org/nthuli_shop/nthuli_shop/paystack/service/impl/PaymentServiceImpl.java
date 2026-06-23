package org.nthuli_shop.nthuli_shop.paystack.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.cart.service.CartService;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.order.enums.OrderStatus;
import org.nthuli_shop.nthuli_shop.order.repository.OrderRepository;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentRequestDto;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentResponseDto;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentVerificationResponseDto;
import org.nthuli_shop.nthuli_shop.paystack.enums.PaymentStatus;
import org.nthuli_shop.nthuli_shop.paystack.model.Payment;
import org.nthuli_shop.nthuli_shop.paystack.repository.PaymentRepository;
import org.nthuli_shop.nthuli_shop.paystack.service.PaymentService;
import org.nthuli_shop.nthuli_shop.paystack.service.PaystackService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaystackService paystackService;
    private final OrderRepository orderRepo;//TODO.Potentila error because of copying code
    private final CartService cartService;

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
        log.warn("after payment initialisation, the returned url:{}, reference: {}", url, reference);
        return PaymentResponseDto.builder()
                .reference(reference)
                .authorizationUrl(url)
                .message("Redirect to Paystack to complete payment")
                .build();
    }

    @Transactional
    public PaymentVerificationResponseDto verifyTransaction(
            String reference) {

        Map response =
                paystackService.verifyTransaction(reference);

        Boolean status = (Boolean) response.get("status");


        if (status == null || !status) {

            return PaymentVerificationResponseDto.builder()
                    .success(false)
                    .reference(reference)
                    .paymentStatus("FAILED")
                    .message("Unable to verify transaction")
                    .build();
        }

        Map<String, Object> data =
                (Map<String, Object>) response.get("data");

        String paystackStatus =
                String.valueOf(data.get("status"));

        Optional<Payment> paymentOpt =
                paymentRepository.findByReference(reference);

        if (paymentOpt.isEmpty()) {

            return PaymentVerificationResponseDto.builder()
                    .success(false)
                    .reference(reference)
                    .paymentStatus("NOT_FOUND")
                    .message("Payment record not found")
                    .build();
        }

        Payment payment = paymentOpt.get();

        if ("success".equalsIgnoreCase(paystackStatus)) {

            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            Order order = orderRepo
                    .findById(payment.getOrderId())
                    .orElseThrow(() ->
                            new RuntimeException("Order not found"));

            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepo.save(order);

            return PaymentVerificationResponseDto.builder()
                    .success(true)
                    .reference(reference)
                    .paymentStatus("COMPLETED")
                    .message("Payment successful")
                    .build();
        }

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        return PaymentVerificationResponseDto.builder()
                .success(false)
                .reference(reference)
                .paymentStatus("FAILED")
                .message("Payment not completed")
                .build();
    }

    @Transactional
    public void processWebhook(Map<String, Object> payload) {

        Map<String, Object> data =
                (Map<String, Object>) payload.get("data");

        String reference =
                String.valueOf(data.get("reference"));

        String paystackStatus =
                String.valueOf(data.get("status"));

        if (!"success".equalsIgnoreCase(paystackStatus)) {
            return;
        }

        paymentRepository.findByReference(reference)
                .ifPresent(payment -> {

                    if (payment.getStatus() == PaymentStatus.SUCCESS) {
                        return; // idempotent
                    }

                    payment.setStatus(PaymentStatus.SUCCESS);
                    paymentRepository.save(payment);

                    Order order = orderRepo
                            .findById(payment.getOrderId())
                            .orElseThrow(() ->
                                    new RuntimeException("Order not found"));

                    order.setOrderStatus(OrderStatus.CONFIRMED);
                    orderRepo.save(order);

                    cartService.clearCart(
                            order.getUser().getId());
                });
    }
}
