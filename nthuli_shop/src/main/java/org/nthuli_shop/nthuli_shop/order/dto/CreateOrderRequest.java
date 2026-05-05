package org.nthuli_shop.nthuli_shop.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    private String email;
    private String phoneNumber;
    private BigDecimal totalAmount;
    private List<CreateOrderItemRequest> orderItems;
    private String description;
    private String shippingAddress;
    private String notes;
}
