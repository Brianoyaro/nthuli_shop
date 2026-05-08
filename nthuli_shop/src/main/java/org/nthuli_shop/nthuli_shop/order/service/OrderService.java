package org.nthuli_shop.nthuli_shop.order.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.cart.entity.Cart;
import org.nthuli_shop.nthuli_shop.cart.repository.CartItemRepository;
import org.nthuli_shop.nthuli_shop.cart.repository.CartRepository;
import org.nthuli_shop.nthuli_shop.order.dto.OrderItemDto;
import org.nthuli_shop.nthuli_shop.order.dto.OrderResponseDto;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.order.entity.OrderItem;
import org.nthuli_shop.nthuli_shop.order.enums.OrderStatus;
import org.nthuli_shop.nthuli_shop.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    /**
     * Create order from authenticated user's cart items
     */
    @Transactional
    public OrderResponseDto createOrderFromCart(User user, String shippingAddress, String notes, String description) {
        log.info("Creating order from cart for user: {}", user.getId());
        
        // Get user's cart
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found for user: " + user.getId()));
        
        // Get all cart items for user's cart
        var cartItems = cartItemRepository.findByCartId(cart.getId());
        
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot create order from empty cart");
        }
        
        // Calculate total amount
        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Create order
        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .description(description)
                .shippingAddress(shippingAddress)
                .notes(notes)
                .orderStatus(OrderStatus.PENDING)
                .build();
        
        // Convert cart items to order items
        cartItems.forEach(cartItem -> {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(cartItem.getProductId())
                    .productName(cartItem.getProductName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .subtotal(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
            order.getOrderItems().add(orderItem);
        });
        
        final Order savedOrder = orderRepository.save(order);
        log.info("Order created successfully with ID: {} for user: {}", savedOrder.getId(), user.getId());
        log.info("Cart will be cleared after successful payment, not at order creation");
        
        return convertToDto(savedOrder);
    }

    /**
     * Get order by ID
     */
    public OrderResponseDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return convertToDto(order);
    }

    /**
     * Get all orders for authenticated user
     */
    public List<OrderResponseDto> getUserOrders(User user) {
        return orderRepository.findByUserId(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get completed orders for authenticated user
     */
    public List<OrderResponseDto> getUserCompletedOrders(User user) {
        return orderRepository.findByUserIdAndOrderStatus(user.getId(), OrderStatus.DELIVERED)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get pending orders for authenticated user
     */
    public List<OrderResponseDto> getUserPendingOrders(User user) {
        return orderRepository.findByUserIdAndOrderStatus(user.getId(), OrderStatus.PENDING)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Update order status
     */
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        
        order.setOrderStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setCompletedAt(java.time.LocalDateTime.now());
        }
        
        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated to {}", orderId, newStatus);
        
        return convertToDto(updatedOrder);
    }

    /**
     * Cancel order
     */
    public OrderResponseDto cancelOrder(Long orderId) {
        return updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }

    /**
     * Get all orders (admin only)
     */
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all orders with specific status
     */
    public List<OrderResponseDto> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByOrderStatus(status)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Delete order
     */
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found with id: " + orderId);
        }
        orderRepository.deleteById(orderId);
        log.info("Order {} deleted", orderId);
    }

    /**
     * Convert Order entity to DTO
     */
    private OrderResponseDto convertToDto(Order order) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        List<OrderItemDto> orderItemDtos = order.getOrderItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());
        
        return OrderResponseDto.builder()
                .id(order.getId())
                .email(order.getUser().getEmail())
                .totalAmount(order.getTotalAmount())
                .orderItems(orderItemDtos)
                .orderStatus(order.getOrderStatus().toString())
                .description(order.getDescription())
                .shippingAddress(order.getShippingAddress())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt() != null ? order.getCreatedAt().format(formatter) : null)
                .updatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt().format(formatter) : null)
                .completedAt(order.getCompletedAt() != null ? order.getCompletedAt().format(formatter) : null)
                .build();
    }
}
