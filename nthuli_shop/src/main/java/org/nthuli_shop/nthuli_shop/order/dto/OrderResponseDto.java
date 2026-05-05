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
public class OrderResponseDto {
    private Long id;
    private String email;
    private BigDecimal totalAmount;
    private List<OrderItemDto> orderItems;
    private String orderStatus;
    private String description;
    private String shippingAddress;
    private String notes;
    private String createdAt;
    private String updatedAt;
    private String completedAt;
}
