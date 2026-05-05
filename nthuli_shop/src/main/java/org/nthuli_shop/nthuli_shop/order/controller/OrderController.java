package org.nthuli_shop.nthuli_shop.order.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.order.dto.OrderResponseDto;
import org.nthuli_shop.nthuli_shop.order.dto.CreateOrderFromCartRequest;
import org.nthuli_shop.nthuli_shop.order.enums.OrderStatus;
import org.nthuli_shop.nthuli_shop.order.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    /**
     * Create order from authenticated user's cart
     * POST /api/orders/from-cart
     * Authentication: REQUIRED
     */
    @PostMapping("/from-cart")
    public ResponseEntity<?> createOrderFromCart(
            @AuthenticationPrincipal User user,
            @RequestBody CreateOrderFromCartRequest request) {
        try {
            if (request.getShippingAddress() == null || request.getShippingAddress().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Shipping address is required"));
            }

            OrderResponseDto order = orderService.createOrderFromCart(
                    user,
                    request.getShippingAddress(),
                    request.getNotes(),
                    request.getDescription()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(createSuccessResponse("Order created successfully from cart", order));

        } catch (Exception e) {
            log.error("Error creating order from cart", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create order: " + e.getMessage()));
        }
    }

    /**
     * Get authenticated user's orders
     * GET /api/orders/user/all
     * Authentication: REQUIRED
     */
    @GetMapping("/user/all")
    public ResponseEntity<?> getUserOrders(@AuthenticationPrincipal User user) {
        try {
            List<OrderResponseDto> orders = orderService.getUserOrders(user);
            return ResponseEntity.ok(createSuccessResponse("User orders retrieved successfully", orders));
        } catch (Exception e) {
            log.error("Error retrieving user orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    /**
     * Get authenticated user's completed orders
     * GET /api/orders/user/completed
     * Authentication: REQUIRED
     */
    @GetMapping("/user/completed")
    public ResponseEntity<?> getUserCompletedOrders(@AuthenticationPrincipal User user) {
        try {
            List<OrderResponseDto> orders = orderService.getUserCompletedOrders(user);
            return ResponseEntity.ok(createSuccessResponse("Completed orders retrieved successfully", orders));
        } catch (Exception e) {
            log.error("Error retrieving completed orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    /**
     * Get authenticated user's pending orders
     * GET /api/orders/user/pending
     * Authentication: REQUIRED
     */
    @GetMapping("/user/pending")
    public ResponseEntity<?> getUserPendingOrders(@AuthenticationPrincipal User user) {
        try {
            List<OrderResponseDto> orders = orderService.getUserPendingOrders(user);
            return ResponseEntity.ok(createSuccessResponse("Pending orders retrieved successfully", orders));
        } catch (Exception e) {
            log.error("Error retrieving pending orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    /**
     * Get order by ID (authenticated user can only see their own orders)
     * GET /api/orders/{orderId}
     * Authentication: REQUIRED
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        try {
            OrderResponseDto order = orderService.getOrderById(orderId);
            
            // Verify order belongs to authenticated user
            if (!order.getEmail().equals(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("You do not have permission to view this order"));
            }
            
            return ResponseEntity.ok(createSuccessResponse("Order retrieved successfully", order));
        } catch (Exception e) {
            log.error("Error retrieving order", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Order not found"));
        }
    }

    /**
     * Update order status (admin only)
     * PUT /api/orders/{orderId}/status/{status}
     * Authentication: REQUIRED (Admin role)
     */
    @PutMapping("/{orderId}/status/{status}")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @PathVariable String status) {
        try {
            // Validate status
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            
            OrderResponseDto updatedOrder = orderService.updateOrderStatus(orderId, orderStatus);
            return ResponseEntity.ok(createSuccessResponse("Order status updated successfully", updatedOrder));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Invalid order status: " + status));
        } catch (Exception e) {
            log.error("Error updating order status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update order status: " + e.getMessage()));
        }
    }

    /**
     * Cancel order
     * PUT /api/orders/{orderId}/cancel
     * Authentication: REQUIRED
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        try {
            OrderResponseDto order = orderService.getOrderById(orderId);
            
            // Verify order belongs to authenticated user
            if (!order.getEmail().equals(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("You do not have permission to cancel this order"));
            }
            
            OrderResponseDto cancelledOrder = orderService.cancelOrder(orderId);
            return ResponseEntity.ok(createSuccessResponse("Order cancelled successfully", cancelledOrder));

        } catch (Exception e) {
            log.error("Error cancelling order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to cancel order: " + e.getMessage()));
        }
    }

    /**
     * Delete order (admin only)
     * DELETE /api/orders/{orderId}
     * Authentication: REQUIRED (Admin role)
     */
    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long orderId) {
        try {
            orderService.deleteOrder(orderId);
            return ResponseEntity.ok(createSuccessResponse("Order deleted successfully", null));

        } catch (Exception e) {
            log.error("Error deleting order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to delete order: " + e.getMessage()));
        }
    }

    /**
     * Get all orders (admin only)
     * GET /api/orders/admin/all
     * Authentication: REQUIRED (Admin role)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<OrderResponseDto> orders = orderService.getAllOrders();
            return ResponseEntity.ok(createSuccessResponse("All orders retrieved successfully", orders));

        } catch (Exception e) {
            log.error("Error retrieving all orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    /**
     * Get orders by status (admin only)
     * GET /api/orders/admin/status/{status}
     * Authentication: REQUIRED (Admin role)
     */
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            List<OrderResponseDto> orders = orderService.getOrdersByStatus(orderStatus);
            return ResponseEntity.ok(createSuccessResponse("Orders retrieved by status successfully", orders));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Invalid order status: " + status));
        } catch (Exception e) {
            log.error("Error retrieving orders by status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("success", "false");
        response.put("message", message);
        return response;
    }
}
