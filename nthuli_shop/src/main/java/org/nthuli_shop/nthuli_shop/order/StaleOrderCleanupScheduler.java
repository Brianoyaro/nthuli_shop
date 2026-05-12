package org.nthuli_shop.nthuli_shop.order;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.order.enums.OrderStatus;
import org.nthuli_shop.nthuli_shop.order.repository.OrderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;/**
 * Periodically cancels PENDING orders that were never paid.
 * This cleans up abandoned checkout sessions where the user
 * created an order but never completed payment.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StaleOrderCleanupScheduler {

    private static final int STALE_THRESHOLD_HOURS = 2;

    private final OrderRepository orderRepository;

    /**
     * Run every 30 minutes. Cancel any PENDING orders older than 2 hours.
     */
    @Scheduled(fixedRate = 30 * 60 * 1000)
    @Transactional
    public void cancelStaleOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(STALE_THRESHOLD_HOURS);

        List<Order> staleOrders = orderRepository
                .findByOrderStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);

        if (staleOrders.isEmpty()) {
            return;
        }

        log.info("🧹 Cancelling {} stale PENDING order(s) older than {} hours",
                staleOrders.size(), STALE_THRESHOLD_HOURS);

        for (Order order : staleOrders) {
            order.setOrderStatus(OrderStatus.CANCELLED);
            log.info("❌ Auto-cancelled stale order #{} (created at {})", order.getId(), order.getCreatedAt());
        }

        orderRepository.saveAll(staleOrders);
    }
}
