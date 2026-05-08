package org.nthuli_shop.nthuli_shop.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDto {
    
    private Long id;
    
    private Long productId;
    
    private String productName;
    
    private BigDecimal unitPrice;
    
    private Integer quantity;
    
    private BigDecimal subtotal;
    
    private String imageUrl;
    
    private String productCategory;
}
