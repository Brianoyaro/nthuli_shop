package org.nthuli_shop.nthuli_shop.cart.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.cart.dto.AddToCartRequest;
import org.nthuli_shop.nthuli_shop.cart.dto.CartItemDto;
import org.nthuli_shop.nthuli_shop.cart.entity.Cart;
import org.nthuli_shop.nthuli_shop.cart.entity.CartItem;
import org.nthuli_shop.nthuli_shop.cart.repository.CartItemRepository;
import org.nthuli_shop.nthuli_shop.cart.repository.CartRepository;
import org.nthuli_shop.nthuli_shop.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    /**
     * Create a new cart for a user (called during registration)
     */
    @Transactional
    public Cart createCartForUser(User user) {
        log.info("Creating cart for user {}", user.getId());
        
        if (cartRepository.existsByUserId(user.getId())) {
            log.warn("Cart already exists for user {}", user.getId());
            return cartRepository.findByUserId(user.getId()).orElse(null);
        }
        
        Cart cart = Cart.builder()
                .user(user)
                .build();
        
        Cart savedCart = cartRepository.save(cart);
        log.info("Cart created for user {} with id {}", user.getId(), savedCart.getId());
        return savedCart;
    }

    /**
     * Get or create cart for user (ensures user always has a cart)
     */
    private Cart getOrCreateCartForUser(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + userId + ". Please contact support."));
    }

    /**
     * Add item to cart or update quantity if already exists
     */
    public CartItemDto addToCart(User user, AddToCartRequest request) {
        log.info("Adding product {} to cart for user {}", request.getProductId(), user.getId());
        
        Cart cart = getOrCreateCartForUser(user.getId());
        
        var existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId());
        
        CartItem cartItem;
        if (existingItem.isPresent()) {
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            log.info("Updated quantity for product {} in cart", request.getProductId());
        } else {
            cartItem = CartItem.builder()
                    .cart(cart)
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
        Cart cart = getOrCreateCartForUser(userId);
        return cartItemRepository.findByCartId(cart.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update quantity of a cart item
     */
    public CartItemDto updateCartItemQuantity(Long userId, Long cartItemId, Integer newQuantity) {
        Cart cart = getOrCreateCartForUser(userId);
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found with id: " + cartItemId));
        
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this user's cart");
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
     * Remove item from cart by product ID
     */
    @Transactional
    public void removeFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCartForUser(userId);
        
        var item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
        log.info("Removed product {} from cart for user {}", productId, userId);
    }

    /**
     * Clear entire cart for a user
     */
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCartForUser(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        log.info("Cleared cart for user {}", userId);
    }

    /**
     * Get cart total amount
     */
    public BigDecimal getCartTotal(Long userId) {
        Cart cart = getOrCreateCartForUser(userId);
        return cartItemRepository.findByCartId(cart.getId())
                .stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Convert CartItem to DTO with product image
     */
    private CartItemDto convertToDto(CartItem cartItem) {
        BigDecimal subtotal = cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        
        // Fetch product to get primary image
        String imageUrl = null;
        try {
            var product = productRepository.findById(cartItem.getProductId());
            if (product.isPresent() && !product.get().getImages().isEmpty()) {
                // Get primary image or first image
                var primaryImage = product.get().getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getPrimary()))
                        .findFirst()
                        .orElse(product.get().getImages().get(0));
                imageUrl = primaryImage.getImageUrl();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch product image for product {}: {}", cartItem.getProductId(), e.getMessage());
        }
        
        return CartItemDto.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProductId())
                .productName(cartItem.getProductName())
                .unitPrice(cartItem.getUnitPrice())
                .quantity(cartItem.getQuantity())
                .subtotal(subtotal)
                .imageUrl(imageUrl)
                .build();
    }
}
