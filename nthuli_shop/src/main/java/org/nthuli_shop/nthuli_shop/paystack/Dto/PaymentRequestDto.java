package org.nthuli_shop.nthuli_shop.paystack.Dto;

import lombok.Data;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentMethod;

@Data
public class PaymentRequestDto {

    private Long orderId;

    private String email;

    private PaymentMethod paymentMethod;
}

