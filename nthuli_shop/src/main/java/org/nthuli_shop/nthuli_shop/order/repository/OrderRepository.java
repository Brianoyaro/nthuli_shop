package org.nthuli_shop.nthuli_shop.order.repository;

import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.order.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserId(Long userId);
    
    List<Order> findByUserIdAndOrderStatus(Long userId, OrderStatus orderStatus);
    
    List<Order> findByOrderStatus(OrderStatus orderStatus);
    
    List<Order> findByUser(User user);
}
