package org.nthuli_shop.nthuli_shop.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MpesaStkPushRequest {
    private Long orderId;
    private String email;
    private String phoneNumber;
    private BigDecimal amount;
    private String description;
}
