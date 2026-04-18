package org.nthuli_shop.nthuli_shop.product.repository;

import org.nthuli_shop.nthuli_shop.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByPriceGreaterThan(Double price);
    List<Product> findByCategory(String category);
    Optional<Product> findByName(String name);
    List<Product> findAllByOrderByTypeAsc();
}