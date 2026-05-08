package org.nthuli_shop.nthuli_shop.cart.repository;

import org.nthuli_shop.nthuli_shop.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    
    /**
     * Find cart by user ID
     * @param userId the user ID
     * @return Optional containing the cart if found
     */
    Optional<Cart> findByUserId(Long userId);
    
    /**
     * Check if a cart exists for a user
     * @param userId the user ID
     * @return true if cart exists, false otherwise
     */
    boolean existsByUserId(Long userId);
}
