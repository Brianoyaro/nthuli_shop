package org.nthuli_shop.nthuli_shop.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderFromCartRequest {
    
    private String shippingAddress;
    
    private String notes;
    
    private String description;
}
