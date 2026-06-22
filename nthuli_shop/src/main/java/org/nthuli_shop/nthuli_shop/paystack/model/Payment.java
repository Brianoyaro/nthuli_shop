package org.nthuli_shop.nthuli_shop.paystack.model;

import jakarta.persistence.*;
import lombok.*;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentMethod;
import org.nthuli_shop.nthuli_shop.paystack.enums.PaymentStatus;

import java.math.BigDecimal;


@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String reference;

    private BigDecimal amount;

    private String email;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(nullable = false)
    private Long orderId;

}
