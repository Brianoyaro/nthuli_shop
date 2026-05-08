package org.nthuli_shop.nthuli_shop.cart.repository;

import org.nthuli_shop.nthuli_shop.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    /**
     * Find all items in a specific cart
     * @param cartId the cart ID
     * @return list of cart items
     */
    List<CartItem> findByCartId(Long cartId);
    
    /**
     * Find a specific item in a cart by product ID
     * @param cartId the cart ID
     * @param productId the product ID
     * @return Optional containing the cart item if found
     */
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
    
    /**
     * Delete all items from a cart
     * @param cartId the cart ID
     */
    void deleteByCartId(Long cartId);
    
    /**
     * Delete a specific item from a cart by product ID
     * @param cartId the cart ID
     * @param productId the product ID
     */
    void deleteByCartIdAndProductId(Long cartId, Long productId);
}
