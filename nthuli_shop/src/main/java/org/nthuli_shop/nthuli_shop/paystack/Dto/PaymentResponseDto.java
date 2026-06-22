package org.nthuli_shop.nthuli_shop.paystack.Dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDto {

    private String reference;

    private String authorizationUrl;

    private String message;
}
