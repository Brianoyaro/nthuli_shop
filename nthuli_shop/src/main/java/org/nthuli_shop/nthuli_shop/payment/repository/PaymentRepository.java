package org.nthuli_shop.nthuli_shop.payment.repository;

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
    List<Payment> findByOrderId(Long orderId);
    List<Payment> findByUserId(Long userId);
    List<Payment> findByUserIdAndPaymentStatus(Long userId, PaymentStatus paymentStatus);
    List<Payment> findByEmail(String email);
    List<Payment> findByEmailAndPhoneNumber(String email, String phoneNumber);
    List<Payment> findByEmailAndPaymentStatus(String email, PaymentStatus paymentStatus);
}
