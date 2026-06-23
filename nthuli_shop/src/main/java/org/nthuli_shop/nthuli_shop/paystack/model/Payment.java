package org.nthuli_shop.nthuli_shop.paystack.model;

import jakarta.persistence.*;
import lombok.*;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.paystack.enums.PaymentMethod;
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

//    @OneToOne
//    @JoinColumn(name = "order_id")
//    private Order order;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @Column(nullable = false)
    private Long orderId;

}
