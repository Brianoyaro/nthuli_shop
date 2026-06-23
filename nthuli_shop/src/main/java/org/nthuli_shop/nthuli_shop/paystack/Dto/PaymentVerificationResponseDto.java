package org.nthuli_shop.nthuli_shop.paystack.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentVerificationResponseDto {

    private boolean success;

    private String reference;

    private String paymentStatus;

    private String message;
}
