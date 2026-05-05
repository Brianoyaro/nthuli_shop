package org.nthuli_shop.nthuli_shop.cart.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.cart.dto.AddToCartRequest;
import org.nthuli_shop.nthuli_shop.cart.dto.CartItemDto;
import org.nthuli_shop.nthuli_shop.cart.entity.CartItem;
import org.nthuli_shop.nthuli_shop.cart.repository.CartItemRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartItemRepository cartItemRepository;

    /**
     * Add item to cart or update quantity if already exists
     */
    public CartItemDto addToCart(User user, AddToCartRequest request) {
        log.info("Adding product {} to cart for user {}", request.getProductId(), user.getId());
        
        var existingItem = cartItemRepository.findByUserIdAndProductId(user.getId(), request.getProductId());
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            log.info("Updated quantity for product {} in cart", request.getProductId());
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .productId(request.getProductId())
                    .productName(request.getProductName())
                    .unitPrice(request.getUnitPrice())
                    .quantity(request.getQuantity())
                    .build();
            log.info("Added new product {} to cart", request.getProductId());
        }
        
        CartItem savedItem = cartItemRepository.save(cartItem);
        return convertToDto(savedItem);
    }

    /**
     * Get all cart items for a user
     */
    public List<CartItemDto> getCartItems(Long userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update quantity of a cart item
     */
    public CartItemDto updateCartItemQuantity(Long userId, Long cartItemId, Integer newQuantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartItemId));
        
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Cart item does not belong to this user");
        }
        
        if (newQuantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }
        
        cartItem.setQuantity(newQuantity);
        CartItem updatedItem = cartItemRepository.save(cartItem);
        log.info("Updated cart item {} quantity to {}", cartItemId, newQuantity);
        
        return convertToDto(updatedItem);
    }

    /**
     * Remove item from cart
     */
    public void removeFromCart(Long userId, Long productId) {
        var item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        cartItemRepository.deleteByUserIdAndProductId(userId, productId);
        log.info("Removed product {} from cart for user {}", productId, userId);
    }

    /**
     * Clear entire cart for a user
     */
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
        log.info("Cleared cart for user {}", userId);
    }

    /**
     * Get cart total amount
     */
    public BigDecimal getCartTotal(Long userId) {
        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Convert CartItem to DTO
     */
    private CartItemDto convertToDto(CartItem cartItem) {
        BigDecimal subtotal = cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        
        return CartItemDto.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProductId())
                .productName(cartItem.getProductName())
                .unitPrice(cartItem.getUnitPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
