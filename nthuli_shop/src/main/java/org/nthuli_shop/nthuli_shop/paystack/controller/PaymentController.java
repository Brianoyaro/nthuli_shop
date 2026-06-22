package org.nthuli_shop.nthuli_shop.paystack.controller;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.cart.service.CartService;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.order.enums.OrderStatus;
import org.nthuli_shop.nthuli_shop.order.repository.OrderRepository;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentRequestDto;
import org.nthuli_shop.nthuli_shop.paystack.Dto.PaymentResponseDto;
import org.nthuli_shop.nthuli_shop.paystack.enums.PaymentStatus;
import org.nthuli_shop.nthuli_shop.paystack.repository.PaymentRepository;
import org.nthuli_shop.nthuli_shop.paystack.service.PaymentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepo;
    private final CartService cartService;

    @PostMapping
    public PaymentResponseDto pay(@RequestBody PaymentRequestDto request) {
        log.info("Received request: {}", request);
        return paymentService.initiatePayment(request);
    }

    @PostMapping("/webhook/paystack")
    public void handleWebhook(@RequestBody Map<String, Object> payload) {

        Map data = (Map) payload.get("data");
        String reference = (String) data.get("reference");

        paymentRepository.findByReference(reference).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            // TODO:
            // - update order status to CONFIRMED
            Long orderId = payment.getOrderId();
            Order order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepo.save(order);

            // - clear cart
            Long userId = order.getUser().getId();
            cartService.clearCart(userId);
        });
    }
}

