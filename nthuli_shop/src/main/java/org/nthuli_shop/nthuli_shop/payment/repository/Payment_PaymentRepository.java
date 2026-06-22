package org.nthuli_shop.nthuli_shop.payment.repository;

import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.payment.entity.Payment_Payment;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface Payment_PaymentRepository extends JpaRepository<Payment_Payment, Long> {
    
    Optional<Payment_Payment> findByTransactionId(String transactionId);
    
    Optional<Payment_Payment> findByMpesaReference(String mpesaReference);
    
    Optional<Payment_Payment> findByOrder(Order order);
    
    List<Payment_Payment> findByUser(User user);
    
    List<Payment_Payment> findByUserAndPaymentStatus(User user, PaymentStatus paymentStatus);
    
    List<Payment_Payment> findByUserId(Long userId);
    
    List<Payment_Payment> findByUserIdAndPaymentStatus(Long userId, PaymentStatus paymentStatus);
}
