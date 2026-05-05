package org.nthuli_shop.nthuli_shop.cart.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.cart.dto.AddToCartRequest;
import org.nthuli_shop.nthuli_shop.cart.dto.CartItemDto;
import org.nthuli_shop.nthuli_shop.cart.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    /**
     * Add item to cart
     * POST /api/cart/add
     */
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @AuthenticationPrincipal User user,
            @RequestBody AddToCartRequest request) {
        try {
            if (request.getProductId() == null) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Product ID is required"));
            }
            if (request.getProductName() == null || request.getProductName().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Product name is required"));
            }
            if (request.getUnitPrice() == null || request.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Unit price must be greater than 0"));
            }
            if (request.getQuantity() == null || request.getQuantity() <= 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Quantity must be greater than 0"));
            }

            CartItemDto cartItem = cartService.addToCart(user, request);
            return ResponseEntity.ok()
                    .body(createSuccessResponse("Item added to cart", cartItem));

        } catch (Exception e) {
            log.error("Error adding item to cart", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to add item: " + e.getMessage()));
        }
    }

    /**
     * Get all cart items for authenticated user
     * GET /api/cart
     */
    @GetMapping
    public ResponseEntity<?> getCart(@AuthenticationPrincipal User user) {
        try {
            List<CartItemDto> items = cartService.getCartItems(user.getId());
            BigDecimal total = cartService.getCartTotal(user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("items", items);
            response.put("total", total);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error retrieving cart", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve cart: " + e.getMessage()));
        }
    }

    /**
     * Update cart item quantity
     * PUT /api/cart/{cartItemId}
     */
    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        try {
            if (quantity == null || quantity <= 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Quantity must be greater than 0"));
            }

            CartItemDto updatedItem = cartService.updateCartItemQuantity(user.getId(), cartItemId, quantity);
            return ResponseEntity.ok()
                    .body(createSuccessResponse("Cart item updated", updatedItem));

        } catch (Exception e) {
            log.error("Error updating cart item", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update cart item: " + e.getMessage()));
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/{productId}
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromCart(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        try {
            cartService.removeFromCart(user.getId(), productId);
            return ResponseEntity.ok()
                    .body(createSuccessResponse("Item removed from cart", null));

        } catch (Exception e) {
            log.error("Error removing item from cart", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to remove item: " + e.getMessage()));
        }
    }

    /**
     * Clear entire cart
     * DELETE /api/cart/clear/all
     */
    @DeleteMapping("/clear/all")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal User user) {
        try {
            cartService.clearCart(user.getId());
            return ResponseEntity.ok()
                    .body(createSuccessResponse("Cart cleared", null));

        } catch (Exception e) {
            log.error("Error clearing cart", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to clear cart: " + e.getMessage()));
        }
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}
