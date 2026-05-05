package org.nthuli_shop.nthuli_shop.payment.repository;

import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.payment.entity.Payment;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByTransactionId(String transactionId);
    
    Optional<Payment> findByMpesaReference(String mpesaReference);
    
    Optional<Payment> findByOrder(Order order);
    
    List<Payment> findByUser(User user);
    
    List<Payment> findByUserAndPaymentStatus(User user, PaymentStatus paymentStatus);
    
    List<Payment> findByUserId(Long userId);
    
    List<Payment> findByUserIdAndPaymentStatus(Long userId, PaymentStatus paymentStatus);
}
