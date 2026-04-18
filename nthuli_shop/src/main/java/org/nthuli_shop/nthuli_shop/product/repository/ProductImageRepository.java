package org.nthuli_shop.nthuli_shop.product.repository;

import org.nthuli_shop.nthuli_shop.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
